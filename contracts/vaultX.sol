// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IWToken.sol";

// Deploy VaultX in the origin blockchain and pair it with
// the VaultY in the mapped blockchain
contract VaultX is Pausable, AccessControlEnumerable {
    using SafeMath for uint256;
    using Address for address;

    struct tokenPair {
      address sourceToken;
      address mappedToken;
      uint256 mappedTokenChainid;
      string symbol;
    }

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
    address public wrappedNativeToken;
    mapping(address => uint256) public mappedTokenChainid;
    mapping(address => string) public mappedTokenSymbol;
    mapping(address => address) public tokenMapping;
    mapping(address => address) public tokenMappingReversed;
    mapping(address => mapping(address => bool)) public tokenMappingPaused;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256 )) public tokenMappingDepositNonce;
    mapping(address => mapping(address => mapping(uint256 => bool))) public tokenMappingWithdrawdone;
    tokenPair[] public tokenPairs;

    // events
    event TokenDeposit(
        uint256 sourceChainid,
        address indexed sourceToken,
        uint256 mappedChainid,
        address indexed mappedToken,
        address from,
        uint256 amount,
        uint256 indexed depositNonce,
        uint256 tokenBalanceAfter
    );
    event TokenWithdraw(
        uint256 sourceChainid,
        address indexed sourceToken,
        uint256 mappedChainid,
        address indexed mappedToken,
        address to,
        uint256 amount,
        uint256 indexed withdrawNonce,
        uint256 tokenBalanceAfter
    );

    constructor(address _wrappedNativeToken) {
        wrappedNativeToken = _wrappedNativeToken;

        // setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(VALIDATOR_ROLE, _msgSender());
    }

    // fallback function
    fallback() external {revert();}
    receive() external payable {revert();}

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
        tokenMappingPaused[sourceToken][mappedToken] = true;
    }

    function unpauseTokenMapping(
        address sourceToken,
        address mappedToken
    ) public onlyAdmin {
        tokenMappingPaused[sourceToken][mappedToken] = false;
    }

    function setupTokenMapping(
        address sourceToken,
        uint256 mappedChainid,
        address mappedToken,
        string memory mappedTokenSymbol_
    ) public onlyAdmin returns (bool) {
        require(sourceToken.isContract(), "source token is not a contract");
        require(mappedToken != address(0), "mapped token is null address");

        tokenMapping[sourceToken] = mappedToken;
        tokenMappingReversed[mappedToken] = sourceToken;
        mappedTokenChainid[mappedToken] = mappedChainid;
        mappedTokenSymbol[mappedToken] = mappedTokenSymbol_;

        addTokenMappingPair(
            sourceToken,
            mappedChainid,
            mappedToken,
            mappedTokenSymbol_
        );

        // pause the token at first
        pauseTokenMapping(sourceToken, mappedToken);
        return true;
    }

    function addTokenMappingPair(
        address sourceToken,
        uint256 mappedChainid,
        address mappedToken,
        string memory mappedTokenSymbol_
    ) private {
        tokenPair memory pair = tokenPair(sourceToken, mappedToken, mappedChainid, mappedTokenSymbol_);
        tokenPairs.push(pair);
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

    // deposit native crypto, e.g. ETH, MOAC
    function depositNative() payable public whenNotPaused returns (bool){
        address sourceToken = wrappedNativeToken;
        address mappedToken = tokenMapping[sourceToken];
        require(mappedToken != address(0), "token mapping not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false, "token mapping paused");

        IWToken(wrappedNativeToken).deposit{value: msg.value}();
        assert(IWToken(wrappedNativeToken).transfer(address(this), msg.value));
        tokenMappingDepositNonce[sourceToken][mappedToken] += 1;
        emit TokenDeposit(
            block.chainid,
            wrappedNativeToken,
            mappedTokenChainid[mappedToken],
            mappedToken,
            _msgSender(),
            msg.value,
            tokenMappingDepositNonce[sourceToken][mappedToken],
            IERC20(wrappedNativeToken).balanceOf(address(this))
        );
        return true;
    }

    // deposit ERC20 token, sender need to approve this contract for the amount in advance.
    function depositToken(address sourceToken, uint256 amount) public whenNotPaused returns (bool){
        require(sourceToken.isContract(), "source token is not a contract");
        address mappedToken = tokenMapping[sourceToken];
        require(tokenMapping[sourceToken] != address(0), "token mapping not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false, "token mapping paused");

        IERC20(sourceToken).transferFrom(_msgSender(), address(this), amount);
        tokenMappingDepositNonce[sourceToken][mappedToken] += 1;
        emit TokenDeposit(
            block.chainid,
            sourceToken,
            mappedTokenChainid[mappedToken],
            mappedToken,
            _msgSender(),
            amount,
            tokenMappingDepositNonce[sourceToken][mappedToken],
            IERC20(sourceToken).balanceOf(address(this))
        );
        return true;
    }

    function withdraw(
        address sourceToken,
        address mappedToken,
        address to,
        uint256 amount,
        uint256 withdrawNonce
    ) public whenNotPaused onlyValidator {
        require(tokenMapping[sourceToken] != address(0), "token mapping not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false);
        require(to != address(0), "withdraw to the zero address");
        require(amount > 0, "withdraw only to positive amount ");
        require(withdrawNonce >= tokenMappingWatermark[sourceToken][mappedToken], "withdraw nonce too low");
        require(
            tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawNonce]==false,
            "only withdraw once"
        );

        tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawNonce] = true;
        IERC20(sourceToken).transfer(to, amount);
        emit TokenWithdraw(
            block.chainid,
            sourceToken,
            mappedTokenChainid[mappedToken],
            mappedToken,
            to,
            amount,
            withdrawNonce,
            IERC20(sourceToken).balanceOf(to)
        );
        uint256 withdrawWatermark = tokenMappingWatermark[sourceToken][mappedToken];
        while(tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark]) {
            // release storage space
            delete tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark];
            withdrawWatermark += 1;
        }
        tokenMappingWatermark[sourceToken][mappedToken] = withdrawWatermark;
    }

    function SkipWithdrawdone(
        address sourceToken,
        address mappedToken,
        uint256 withdrawNonce
    ) public onlyAdmin {
        tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawNonce] = true;
    }

    function clearStorage(address sourceToken, address mappedToken) public onlyAdmin {
        uint256 withdrawWatermark = tokenMappingWatermark[sourceToken][mappedToken];
        while(tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark]) {
            // release storage space
            delete tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark];
            withdrawWatermark += 1;
        }
        tokenMappingWatermark[sourceToken][mappedToken] = withdrawWatermark;
    }
}
