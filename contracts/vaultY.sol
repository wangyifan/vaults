// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./vaultYERC20.sol";
import "./IWToken.sol";
import "./staking.sol";
import "./roleAccess.sol";
import "./tokenPausable.sol";
import "./tokenFee.sol";

// Deploy VaultY in the mapped blockchain and pair it with
// the VaultX in the origin blockchain
contract VaultY is RoleAccess, TokenPausable, Staking, TokenFee {
    using SafeMath for uint256;
    using Address for address;

    // variables
    mapping(address => uint256) public sourceTokenChainid;
    mapping(address => string) public sourceTokenSymbol;
    mapping(address => address) public tokenMapping;
    mapping(address => address) public tokenMappingReversed;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256 )) public tokenMappingExitNonce;
    mapping(address => mapping(address => mapping(uint256 => bool))) public tokenMappingMintdone;
    mapping(address => mapping(address => uint256)) public tokenStagingBalances;
    mapping(address => mapping(address => uint256)) public tokenWithdrawFees;

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

    constructor() Staking(10) {
        //setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(VALIDATOR_ROLE, _msgSender());
    }

    // fallback function
    fallback() external {revert();}
    receive() external payable {revert();}

    // call this only ONCE for each token mapping
    function setupTokenMapping(
        uint256 sourceChainid,
        address sourceToken,
        address mappedToken,
        string memory sourceTokenSymbol_,
        string memory mappedTokenSymbol_
    ) public onlyAdmin returns (bool) {
        require(mappedToken.isContract(), "mapped token address is not a contract");
        require(sourceToken != address(0), "mapped token is null address");

        tokenMapping[sourceToken] = mappedToken;
        tokenMappingReversed[mappedToken] = sourceToken;
        // pause the token at first
        pauseTokenMapping(sourceToken, mappedToken);
        return true;
    }

    // mint in batch
    function batchMint(bytes calldata input) public onlyValidator whenNotPaused {
        require(input.length%160==0);
        for(uint index = 0; index < input.length; index+=160){
            address sourceToken = abi.decode(input[index:32], (address));
            address mappedToken = abi.decode(input[32:64], (address));
            address to = abi.decode(input[64:96], (address));
            uint256 amount = abi.decode(input[96:128], (uint256));
            uint256 mintNonce = abi.decode(input[128:160], (uint256));
            mint(sourceToken, mappedToken, to, amount, mintNonce);
        }
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
