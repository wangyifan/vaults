// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./staking.sol";
import "./roleAccess.sol";
import "./tokenPausable.sol";
import "./tokenFee.sol";

// Deploy VaultX in the origin blockchain and pair it with
// the VaultY in the mapped blockchain
contract VaultX is RoleAccess, TokenPausable, Staking, TokenFee {
    using SafeMath for uint256;
    using Address for address;

    // structs
    struct tokenPairInfo {
        address sourceToken;
        uint256 sourceTokenChainid;
        string sourceTokenSymbol;
        address mappedToken;
        uint256 mappedTokenChainid;
        string mappedTokenSymbol;
        bool paused;
    }

    struct tokenPair {
        address sourceToken;
        address mappedToken;
    }

    address NATIVETOKEN;

    // variables
    mapping(address => string) internal sourceTokenSymbols;
    mapping(address => uint256) internal mappedTokenChainids;
    mapping(address => string) internal mappedTokenSymbols;
    mapping(address => address) internal tokenMapping;
    mapping(address => address) internal tokenMappingReversed;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256 )) public tokenMappingDepositNonce;
    mapping(address => mapping(address => mapping(uint256 => bool))) public tokenMappingWithdrawdone;
    mapping(address => mapping(address => uint256)) internal tokenStagingBalances;
    tokenPair[] internal tokenPairs;

    // events
    event TokenDeposit(
        uint256 sourceChainid,
        address indexed sourceToken,
        uint256 mappedChainid,
        address indexed mappedToken,
        address from,
        uint256 amount,
        uint256 tip,
        uint256 indexed depositNonce
    );
    event TokenWithdraw(
        uint256 sourceChainid,
        address indexed sourceToken,
        uint256 mappedChainid,
        address indexed mappedToken,
        address to,
        uint256 amount,
        uint256 indexed withdrawNonce
    );

    constructor(address nativeToken) Staking(10) {
        // setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(VALIDATOR_ROLE, _msgSender());

        // fee setting
        tipAccount = _msgSender();

        // setup native token
        NATIVETOKEN = nativeToken;
    }

    // fallback function
    fallback() external {revert();}
    receive() external payable {revert();}

    function setupTokenMapping(
        uint256 mappedChainid,
        address sourceToken,
        address mappedToken,
        string memory sourceTokenSymbol_,
        string memory mappedTokenSymbol_,
        uint256 tipRate
    ) external onlyAdmin returns (bool) {
        require(
            sourceToken == NATIVETOKEN || sourceToken.isContract(),
            "source token is not a contract"
        );
        require(mappedToken != address(0), "mapped token is null address");

        tokenMapping[sourceToken] = mappedToken;
        tokenMappingReversed[mappedToken] = sourceToken;
        sourceTokenSymbols[sourceToken] = sourceTokenSymbol_;
        mappedTokenChainids[mappedToken] = mappedChainid;
        mappedTokenSymbols[mappedToken] = mappedTokenSymbol_;

        // add to token pair list
        tokenPair memory pair = tokenPair(sourceToken, mappedToken);
        tokenPairs.push(pair);

        // pause the token at first
        pauseTokenMapping(sourceToken, mappedToken);
        // set tip
        setTipRate(sourceToken, mappedToken, tipRate);

        return true;
    }

    function getTokenPairs() external view returns(tokenPairInfo[] memory){
        uint256 n = tokenPairs.length;
        tokenPairInfo[] memory result = new tokenPairInfo[](n);
        for(uint i= 0; i < n; i++) {
            result[i].sourceToken = tokenPairs[i].sourceToken;
            result[i].sourceTokenChainid = block.chainid;
            result[i].sourceTokenSymbol = sourceTokenSymbols[result[i].sourceToken];
            result[i].mappedToken = tokenPairs[i].mappedToken;
            result[i].mappedTokenChainid = mappedTokenChainids[result[i].mappedToken];
            result[i].mappedTokenSymbol = mappedTokenSymbols[result[i].mappedToken];
            result[i].paused = tokenMappingPaused[result[i].sourceToken][result[i].mappedToken];
        }

        return result;
    }

    // deposit native crypto, e.g. ETH, MOAC
    // this contract will receive the fund
    function depositNative() payable external whenNotPaused returns (bool){
        address sourceToken = NATIVETOKEN;
        address mappedToken = tokenMapping[sourceToken];
        require(mappedToken != address(0), "token mapping not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false, "token mapping paused");

        uint256 amount = msg.value;
        address from = _msgSender();
        // 1. charge tip
        uint256 tipX = 0;
        if (shouldTip()) {
            tipX = getTip(sourceToken, mappedToken, amount);
            if (tipX > 0) {
                tokenStagingBalances[NATIVETOKEN][tipAccount] += tipX;
            }
        }

        // 2. emit event
        emit TokenDeposit(
            block.chainid,
            sourceToken,
            mappedTokenChainids[mappedToken],
            mappedToken,
            from,
            amount,
            tipX,
            tokenMappingDepositNonce[sourceToken][mappedToken]
        );

        // 3. increase nonce
        tokenMappingDepositNonce[sourceToken][mappedToken] += 1;

        return true;
    }

    // deposit ERC20 token, sender need to approve this contract for the amount in advance.
    function depositToken(address sourceToken, uint256 amount) external whenNotPaused returns (bool){
        address mappedToken = tokenMapping[sourceToken];
        require(sourceToken.isContract(), "source token is not a contract");
        require(tokenMapping[sourceToken] != address(0), "token mapping not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false, "token mapping paused");

        address from = _msgSender();

        // 0. lock token in this contract
        IERC20(sourceToken).transferFrom(from, address(this), amount);

        // 1. charge tip
        uint256 tipX = 0;
        if (shouldTip()) {
            tipX = getTip(sourceToken, mappedToken, amount);
            if (tipX > 0){
                tokenStagingBalances[sourceToken][tipAccount] += tipX;
            }
        }

        // 2. emit event
        emit TokenDeposit(
            block.chainid,
            sourceToken,
            mappedTokenChainids[mappedToken],
            mappedToken,
            from,
            amount,
            tipX,
            tokenMappingDepositNonce[sourceToken][mappedToken]
        );

        // 3. increase nonce
        tokenMappingDepositNonce[sourceToken][mappedToken] += 1;

        return true;
    }

    function withdraw(
        address sourceToken,
        address mappedToken,
        address to,
        uint256 amount,
        uint256 tipY,
        uint256 withdrawNonce
    ) external whenNotPaused onlyValidator {
        require(tokenMapping[sourceToken] != address(0), "token mapping not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false);
        require(to != address(0), "withdraw to the zero address");
        require(amount > 0, "withdraw only to positive amount ");
        require(withdrawNonce >= tokenMappingWatermark[sourceToken][mappedToken], "withdraw nonce too low");
        require(
            tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawNonce]==false,
            "only withdraw once"
        );

        // no re-entry
        tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawNonce] = true;

        // 1. charge tip
        uint256 tipX = 0;
        if (shouldTip()) {
            tipX = getTip(sourceToken, mappedToken, amount);
            if (tipX > 0){
                tokenStagingBalances[sourceToken][tipAccount] += tipX;
            }
        }

        // 2. unlock token back to user
        uint256 netAmount = amount - tipX - tipY;
        require(netAmount > 0, "withdraw net amount negative");
        tokenStagingBalances[sourceToken][to] += netAmount;

        // 3. emit event
        emit TokenWithdraw(
            block.chainid,
            sourceToken,
            mappedTokenChainids[mappedToken],
            mappedToken,
            to,
            amount,
            withdrawNonce
        );

        // 4. delete storage space if possible
        uint256 withdrawWatermark = tokenMappingWatermark[sourceToken][mappedToken];
        while(tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark]) {
            // release storage space
            delete tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark];
            withdrawWatermark += 1;
        }
        tokenMappingWatermark[sourceToken][mappedToken] = withdrawWatermark;
    }

    function skipWithdrawdone(
        address sourceToken,
        address mappedToken,
        uint256 withdrawNonce
    ) external onlyAdmin {
        tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawNonce] = true;
    }

    // cashout mint the staged asset
    function cashout(address token, address payable to, uint256 amount) external whenNotPaused {
        address owner = _msgSender();
        uint256 balance = tokenStagingBalances[token][owner];
        require(to != address(0), "cashout to the zero address");
        require(balance >= amount, "cashout amount too large");

        tokenStagingBalances[token][owner] -= amount;

        // transfer the token
        if (token == NATIVETOKEN) {
            to.transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    function cashoutBalance(address token, address owner) external view returns(uint256){
        return tokenStagingBalances[token][owner];
    }

    function clearStorage(address sourceToken, address mappedToken) external onlyAdmin {
        uint256 withdrawWatermark = tokenMappingWatermark[sourceToken][mappedToken];
        while(tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark]) {
            // release storage space
            delete tokenMappingWithdrawdone[sourceToken][mappedToken][withdrawWatermark];
            withdrawWatermark += 1;
        }
        tokenMappingWatermark[sourceToken][mappedToken] = withdrawWatermark;
    }
}
