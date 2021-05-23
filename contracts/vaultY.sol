// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./vaultYERC20.sol";
import "./IWToken.sol";
import "./IPriceOracle.sol";

// Deploy VaultY in the mapped blockchain and pair it with
// the VaultX in the origin blockchain
contract VaultY is Pausable, AccessControlEnumerable {
    using SafeMath for uint256;
    using Address for address;

    // role definition
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    // modifier
    modifier onlyAdmin {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        _;
    }

    modifier onlyValidator {
        require(hasRole(VALIDATOR_ROLE, _msgSender()), "Caller is not a validator");
        _;
    }

    // variables
    mapping(address => address) public tokenMapping;
    mapping(address => address) public tokenMappingReversed;
    mapping(address => mapping(address => bool)) public tokenMappingPaused;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256 )) public tokenMappingExitNonce;
    mapping(address => mapping(address => mapping(uint256 => bool))) public tokenMappingMintdone;
    mapping(address => mapping(address => uint256)) public tokenStagingBalances;
    mapping(address => mapping(address => uint256)) public tokenWithdrawFees;
    address public stagingAccount; // temporarily hold receiver's token before withdraw
    address public tipAccount;
    address public priceOracle;
    uint256 public tipRate; // 5 means 5/10,000
    string public fiatCurrency; // fiat currency
    uint256 public fiatFeeAmount; // 5 means 5 cents
    string public nativeToken; // chain native token

    // events
    event TokenMint(
        address indexed sourceToken,
        address indexed mappedToken,
        address to,
        uint256 amount,
        uint256 tip,
        uint256 indexed depositNonce,
        uint256 tokenBalanceAfter
    );
    event TokenBurn(
        address indexed sourceToken,
        address indexed mappedToken,
        address account,
        uint256 amount,
        uint256 indexed ExitNonce,
        uint256 tokenBalanceAfter
    );

    constructor() {
        //setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(VALIDATOR_ROLE, _msgSender());
    }

    // fallback function
    fallback() external {revert();}
    receive() external payable {revert();}

    function setTipAccount(address newTipAccount) public onlyAdmin {
        require(newTipAccount != address(0));
        tipAccount = newTipAccount;
    }

    function setFiatCurrency(string memory fiatcurrency) public onlyAdmin {
        fiatCurrency = fiatcurrency;
    }

    function setFiatFeeAmount(uint256 amount) public onlyAdmin {
        require(amount >=0, "negative fiat fee amount");
        fiatFeeAmount = amount;
    }

    function setNativeToken(string memory nativetoken) public onlyAdmin {
        nativeToken = nativetoken;
    }

    function setPriceOracle(address priceoracle) public onlyAdmin {
        require(priceoracle.isContract(), "price oracle is not a contract");
        priceOracle = priceoracle;
    }

    function setStagingAccount(address stagingaccount) public onlyAdmin {
        require(stagingaccount != address(0));
        stagingAccount = stagingaccount;
    }

    function pauseAll() public onlyAdmin {
        _pause();
    }

    function unpauseAll() public onlyAdmin {
        _unpause();
    }

    function pauseTokenMapping(
        address sourceToken,
        address mappedToken
    ) public onlyAdmin {
        require(tokenMapping[sourceToken] == mappedToken, "token mapping not found");
        tokenMappingPaused[sourceToken][mappedToken] = true;
    }

    function unpauseTokenMapping(
        address sourceToken,
        address mappedToken
    ) public onlyAdmin {
        require(tokenMapping[sourceToken] == mappedToken, "token mapping not found");
        tokenMappingPaused[sourceToken][mappedToken] = false;
    }

    // call this only ONCE for each token mapping
    function setupTokenMapping(
        address sourceToken,
        address mappedToken
    ) public onlyAdmin returns (bool) {
        require(mappedToken.isContract(), "mapped token address is not a contract");
        require(sourceToken != address(0), "mapped token is null address");
        require(tokenMapping[sourceToken] == address(0), "token mapping exists already");

        tokenMapping[sourceToken] = mappedToken;
        tokenMappingReversed[mappedToken] = sourceToken;
        // pause the token at first
        pauseTokenMapping(sourceToken, mappedToken);
        return true;
    }

    function addValidator(address validator) public onlyAdmin returns (bool) {
        grantRole(VALIDATOR_ROLE, validator);
        return true;
    }

    function removeValidator(address validator) public onlyAdmin returns (bool) {
        if (hasRole(VALIDATOR_ROLE, validator)) {
            revokeRole(VALIDATOR_ROLE, validator);
        }
        return true;
    }

    function getValidators() public view returns (address[] memory) {
        uint256 count = getRoleMemberCount(VALIDATOR_ROLE);
        address[]  memory validators_ = new address[](count);
        for (uint index = 0; index < count; index++) {
            validators_[index] = getRoleMember(VALIDATOR_ROLE, index);
        }
        return validators_;
    }

    // calculate tip
    function getTip(uint256 amount) internal view returns(uint256) {
        return amount*tipRate/10000;
    }

    // calculate fee
    function getFee() internal view returns(uint256) {
      return IPriceOracle(priceOracle).convertNativeToken(fiatCurrency, fiatFeeAmount);
    }

    // only validator can mint
    function mint(
        address sourceToken,
        address mappedToken,
        address to,
        uint256 amount,
        uint256 mintNonce
    ) public onlyValidator whenNotPaused {
        require(
            tokenMappingPaused[sourceToken][mappedToken] == false,
            "token mapping paused"
        );
        require(to != address(0), "mint to the zero address");
        require(amount > 0, "mint only to positive amount ");
        require(mintNonce >= tokenMappingWatermark[sourceToken][mappedToken], "mint nonce too low");
        require(tokenMappingMintdone[sourceToken][mappedToken][mintNonce]==false, "only mint once");

        tokenMappingMintdone[sourceToken][mappedToken][mintNonce] = true;
        uint256 tip = getTip(amount);
        uint256 fee = getFee();
        uint256 netAmount = amount - tip;
        require(tip >= 0, "Negative tip");
        require(fee >= 0, "Negative fee");
        require(amount - tip > 0, "Negative net amount");
        // credt the receiver for token
        tokenStagingBalances[mappedToken][to] += netAmount;
        // debit the receiver for fee
        tokenWithdrawFees[mappedToken][to] += fee;
        VaultYERC20(mappedToken).mint(stagingAccount, netAmount);
        VaultYERC20(mappedToken).mint(tipAccount,tip);
        emit TokenMint(
            sourceToken,
            mappedToken,
            to,
            amount - tip,
            tip,
            mintNonce,
            VaultYERC20(mappedToken).balanceOf(to)
        );
        uint256 mintWatermark = tokenMappingWatermark[sourceToken][mappedToken];
        while(tokenMappingMintdone[sourceToken][mappedToken][mintWatermark]) {
            // release storage space
            delete tokenMappingMintdone[sourceToken][mappedToken][mintWatermark];
            mintWatermark += 1;
        }
        tokenMappingWatermark[sourceToken][mappedToken] = mintWatermark;
    }

    // withdraw
    function withdraw(address mappedToken, address to) public payable whenNotPaused {
        require(msg.value >= tokenWithdrawFees[mappedToken][to], "Not enough fee for withdraw token");
        require(tokenStagingBalances[mappedToken][to] > 0, "zero token balance for receiver");
        uint256 amount = tokenStagingBalances[mappedToken][to];
        // reset staging balance and withdraw fee to 0
        tokenStagingBalances[mappedToken][to] = 0;
        tokenWithdrawFees[mappedToken][to] = 0;
        // transfer the token
        VaultYERC20(mappedToken).transfer(to, amount);
    }

    // anyone can exit the mapped token back to its origin chain
    function exit(address mappedToken, address from, uint256 amount) whenNotPaused public {
      require(mappedToken.isContract(), "mapped token address is not a contract");
        address sourceToken = tokenMappingReversed[mappedToken];
        require(
            tokenMappingPaused[sourceToken][mappedToken] == false,
            "token mapping paused"
        );

        VaultYERC20(mappedToken).burnFrom(from, amount);
        tokenMappingExitNonce[sourceToken][mappedToken] += 1;
        emit TokenBurn(
            sourceToken,
            mappedToken,
            from,
            amount,
            tokenMappingExitNonce[sourceToken][mappedToken],
            VaultYERC20(mappedToken).balanceOf(from)
        );
    }

    function skipMintdone(address sourceToken, address mappedToken, uint256 mintNonce) public onlyAdmin {
        tokenMappingMintdone[sourceToken][mappedToken][mintNonce] = true;
    }

    function collectFee(address payable to, uint256 amount) public onlyAdmin {
        require(amount <= address(this).balance, "amount too large");
        require(to != address(0));
        to.transfer(amount);
    }
}
