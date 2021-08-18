// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./roleAccess.sol";
import "./tokenPausable.sol";
import "./tokenFee.sol";

// Deploy VaultX in the origin blockchain and pair it with
// the VaultY in the mapped blockchain
contract VaultX is RoleAccess, TokenPausable, TokenFee {
    using SafeMath for uint256;
    using Address for address;
    using SafeERC20 for IERC20;

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

    struct tokenWithdraw {
      address sourceToken;
      address mappedToken;
      address payable to;
      uint256 amount;
      uint256 tipY;
      uint256 withdrawNonce;
    }

    // variables
    mapping(address => string) internal sourceTokenSymbols;
    mapping(address => uint256) internal mappedTokenChainids;
    mapping(address => string) internal mappedTokenSymbols;
    mapping(address => address) internal tokenMapping;
    mapping(address => address) internal tokenMappingReversed;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256)) public tokenMappingDepositNonce;
    mapping(address => uint256) internal tipBalances;
    mapping(uint256 => bool) public omitNonces;
    tokenPair[] internal tokenPairs;
    uint256 public CreatedAt;
    uint256 public totalDepositNonce;
    address public NATIVETOKEN;
    address payable public rescueVault;

    // events
    event TokenDeposit(
        address vault,
        uint256 sourceChainid,
        uint256 mappedChainid,
        address indexed sourceToken,
        address indexed mappedToken,
        address from,
        uint256 amount,
        uint256 tip,
        uint256 indexed nonce,
        uint256 totalNonce,
        uint256 blockNumber
    );
    event IgnoreNonces(
        address sender,
        uint256[] nonces
    );
    event SkipNonce(
        uint256 start,
        uint256 step
    );
    event Rescue(
        address token,
        address payable to,
        uint256 amount
    );

    constructor(address nativeToken) {
        require(nativeToken != address(0));

        // setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(RESCUEOP_ROLE, _msgSender());
        _setupRole(NONCEOP_ROLE, _msgSender());

        // fee setting
        tipAccount = _msgSender();

        // setup native token
        NATIVETOKEN = nativeToken;

        // record when the valut is created
        CreatedAt = block.number;
    }

    // fallback function, this contract does not
    // receive any plain ether
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
        require(tokenMappingWatermark[sourceToken][mappedToken] == 0, "token mapping watermark exists");
        require(tokenMappingDepositNonce[sourceToken][mappedToken] == 0, "token mapping nonce exists");

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

    function updateTokenMapping(
        uint256 mappedChainid,
        address sourceToken,
        address mappedToken,
        string memory sourceTokenSymbol_,
        string memory mappedTokenSymbol_
    ) external onlyAdmin returns (bool){
        mappedTokenChainids[mappedToken] = mappedChainid;
        sourceTokenSymbols[sourceToken] = sourceTokenSymbol_;
        mappedTokenSymbols[mappedToken] = mappedTokenSymbol_;

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
                tipBalances[NATIVETOKEN] += tipX;
            }
        }

        // 2. emit event
        emit TokenDeposit(
            address(this),
            block.chainid,
            mappedTokenChainids[mappedToken],
            sourceToken,
            mappedToken,
            from,
            amount,
            tipX,
            tokenMappingDepositNonce[sourceToken][mappedToken],
            totalDepositNonce,
            block.number
        );

        // 3. increase nonce
        tokenMappingDepositNonce[sourceToken][mappedToken] += 1;
        totalDepositNonce += 1;

        return true;
    }

    // deposit ERC20 token, sender need to approve this contract for the amount in advance.
    function depositToken(address sourceToken, uint256 amount) external whenNotPaused returns (bool){
        address mappedToken = tokenMapping[sourceToken];
        require(sourceToken.isContract(), "source token is not a contract");
        require(mappedToken != address(0), "token mapping not found");
        require(tokenMappingReversed[mappedToken]==sourceToken, "token mapping reversed not found");
        require(tokenMappingPaused[sourceToken][mappedToken] == false, "token mapping paused");

        address from = _msgSender();

        // 1. charge tip
        uint256 tipX = 0;
        if (shouldTip()) {
            tipX = getTip(sourceToken, mappedToken, amount);
            if (tipX > 0){
                tipBalances[sourceToken] += tipX;
            }
        }

        // 2. emit event
        emit TokenDeposit(
            address(this),
            block.chainid,
            mappedTokenChainids[mappedToken],
            sourceToken,
            mappedToken,
            from,
            amount,
            tipX,
            tokenMappingDepositNonce[sourceToken][mappedToken],
            totalDepositNonce,
            block.number
        );

        // 3. increase nonce
        tokenMappingDepositNonce[sourceToken][mappedToken] += 1;
        totalDepositNonce += 1;

        // 4. lock token in this contract
        IERC20(sourceToken).safeTransferFrom(from, address(this), amount);

        return true;
    }

    function validateSignature(bytes memory signature) internal pure returns(bool){
        require(signature.length > 0);
        // TODO: replace with bls.sol
        return true;
    }

    function batchWithdraw(
        bytes calldata signature, tokenWithdraw[] memory tokenWithdraws
    ) external onlyMinter returns (bool) {
        require(validateSignature(signature), "Invalid token mint signature");
        for(uint256 index=0;index < tokenWithdraws.length;index++) {
            tokenWithdraw memory tw = tokenWithdraws[index];
            if(omitNonces[tw.withdrawNonce]==false){
                withdraw(
                    tw.sourceToken,
                    tw.mappedToken,
                    tw.to,
                    tw.amount,
                    tw.tipY,
                    tw.withdrawNonce
                );
            }
        }

        return true;
    }

    function withdraw(
        address sourceToken,
        address mappedToken,
        address payable to,
        uint256 amount,
        uint256 tipY,
        uint256 nonce
    ) public onlyMinter returns (bool) {
        require(tokenMapping[sourceToken]== mappedToken, "token mapping not found");
        require(tokenMappingReversed[mappedToken]==sourceToken, "token mapping reversed not found");
        require(nonce == tokenMappingWatermark[sourceToken][mappedToken], "withdraw nonce too low");
        require(to != address(0), "zero address for to addr");

        // increase watermark
        tokenMappingWatermark[sourceToken][mappedToken]+=1;

        // process the withdraw event
        if(omitNonces[nonce]==false) {
            // 1. charge tip
            uint256 tipX = 0;
            if (tipAccount != address(0)) {
                tipX = amount / 10000 * tipRatePerMapping[sourceToken][mappedToken];
                tipBalances[sourceToken] += tipX;
            }

            // 2. unlock token back to user
            uint256 netAmount = amount - tipX - tipY;
            require(netAmount > 0, "withdraw net amount negative");
            if (sourceToken == NATIVETOKEN) {
                payable(to).transfer(netAmount);
            } else {
              IERC20(sourceToken).safeTransfer(to, netAmount);
            }
        }

        return true;
    }

    // cashout accumulated tip, only tip account can call this
    function tipCashout(address token, address payable to, uint256 amount) external returns (bool) {
        address owner = _msgSender();
        require(owner == tipAccount, "Not tip account");
        uint256 balance = tipBalances[token];
        require(to != address(0), "cashout to the zero address");
        require(balance >= amount, "cashout amount too large");

        tipBalances[token] -= amount;

        // transfer the token
        if (token == NATIVETOKEN) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        return true;
    }

    function tipBalance(address token) external view returns(uint256){
        return tipBalances[token];
    }

    function addNoncesToOmit(uint256[] memory nonces) external onlyNonceOp returns (bool) {
        for(uint256 index=0;index<nonces.length;index++) {
            omitNonces[nonces[index]] = true;
        }
        emit IgnoreNonces(_msgSender(), nonces);

        return true;
    }

    function removeNoncesToOmit(uint256[] memory nonces) external onlyNonceOp returns (bool) {
        for(uint256 index=0;index<nonces.length;index++) {
            delete omitNonces[nonces[index]];
        }

        return true;
    }

    function skipWithdrawWatermark(
        address sourceToken,
        address mappedToken,
        uint256 skip
    ) external onlyNonceOp {
        emit SkipNonce(tokenMappingWatermark[sourceToken][mappedToken], skip);
        tokenMappingWatermark[sourceToken][mappedToken] += skip;
    }

    // when in emergency, funds can only exit to rescue vault
    function setRescueVault(address payable _rescueVault) external onlyAdmin returns (bool) {
        require(address(_rescueVault).isContract(), "rescue vault should be a contract");
        rescueVault = _rescueVault;

        return true;
    }

    function rescue(address token, uint256 amount) external onlyRescueOp returns (bool) {
        require(rescueVault != address(0), "rescue vault address is zero");
        emit Rescue(token, rescueVault, amount);
        if (token == NATIVETOKEN) {
            payable(rescueVault).transfer(amount);
        } else {
            IERC20(token).safeTransfer(rescueVault, amount);
        }

        return true;
    }
}
