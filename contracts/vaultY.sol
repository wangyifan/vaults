// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./xcoin.sol";
import "./staking.sol";
import "./roleAccess.sol";
import "./tokenPausable.sol";
import "./tokenFee.sol";

// Deploy VaultY in the mapped blockchain and pair it with
// the VaultX in the origin blockchain
contract VaultY is RoleAccess, TokenPausable, Staking, TokenFee {
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

    struct tokenMint {
      address sourceToken;
      address mappedToken;
      address payable to;
      uint256 amount;
      uint256 tipX;
      uint256 mintNonce;
    }

    // variables
    mapping(address => uint256) internal sourceTokenChainids;
    mapping(address => string) internal sourceTokenSymbols;
    mapping(address => string) internal mappedTokenSymbols;
    mapping(address => address) internal tokenMapping;
    mapping(address => address) internal tokenMappingReversed;
    mapping(address => uint256) internal tipBalances;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256 )) internal tokenMappingBurnNonce;
    mapping(uint256 => bool) public omitNonces;
    tokenPair[] public tokenPairs;

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
        uint256 blockNumber
    );
    event TokenBurn(
        address vault,
        uint256 sourceChainid,
        uint256 mappedChainid,
        address indexed sourceToken,
        address indexed mappedToken,
        address from,
        uint256 amount,
        uint256 tip,
        uint256 indexed nonce,
        uint256 blockNumber
    );
    event SkipNonce(
        uint256 start,
        uint256 step
    );
    event IgnoreNonces(
        address sender,
        uint256[] nonces
    );
    event Refund(
        address token,
        address payable to,
        uint256 amount
    );

    constructor() Staking(10) {
      // setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(REFUNDOP_ROLE, _msgSender());
        _setupRole(NONCEOP_ROLE, _msgSender());

        // fee setting for tip
        tipAccount = _msgSender();
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
        string memory mappedTokenSymbol_,
        uint256 tipRate
    ) external onlyAdmin returns (bool) {
        require(mappedToken.isContract(), "mapped token address is not a contract");
        require(sourceToken != address(0), "mapped token is null address");

        tokenMapping[sourceToken] = mappedToken;
        tokenMappingReversed[mappedToken] = sourceToken;
        sourceTokenChainids[sourceToken] = sourceChainid;
        sourceTokenSymbols[sourceToken] = sourceTokenSymbol_;
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
            result[i].sourceTokenChainid = sourceTokenChainids[result[i].sourceToken];
            result[i].sourceTokenSymbol = sourceTokenSymbols[result[i].sourceToken];
            result[i].mappedToken = tokenPairs[i].mappedToken;
            result[i].mappedTokenChainid = block.chainid;
            result[i].mappedTokenSymbol = mappedTokenSymbols[result[i].mappedToken];
            result[i].paused = tokenMappingPaused[result[i].sourceToken][result[i].mappedToken];
        }

        return result;
    }

    // mint in batch
    function batchMint(
        bytes calldata signature, bytes calldata input
    ) external onlyMinter whenNotPaused {
        require(validateSignature(signature), "Invalid token mint signature");
        tokenMint[] memory tokenMints = abi.decode(input, (tokenMint[]));

        for(uint256 index=0;index < tokenMints.length;index++){
            tokenMint memory tm = tokenMints[index];
            mint(
                tm.sourceToken,
                tm.mappedToken,
                tm.to,
                tm.amount,
                tm.tipX,
                tm.mintNonce
            );
        }
    }

    function validateSignature(bytes memory signature) internal pure returns(bool){
        require(signature.length > 0);
        return true;
    }

    // admin can assign minter role to another EOA or smart contract
    function grantMinter(address minter) public onlyAdmin returns (bool) {
        grantRole(MINTER_ROLE, minter);
        return true;
    }

    // this is just placeholder so that the generated go binding will
    // have the same interface between the two vaults x & y.
    function withdraw(
        address sourceToken,
        address mappedToken,
        address payable to,
        uint256 amount,
        uint256 tipY,
        uint256 nonce
    ) public {
    }

    function mint(
        address sourceToken,
        address mappedToken,
        address payable to,
        uint256 amount,
        uint256 tipX,
        uint256 nonce
    ) public onlyMinter {
        require(nonce == tokenMappingWatermark[sourceToken][mappedToken], "mint nonce too low");

        // process the mint event
        if(omitNonces[nonce]==false) {
            // 1. charge tip
            uint256 tipY = amount * tipRatePerMapping[sourceToken][mappedToken] / 10000;
            if (tipY != 0) {
              tipBalances[mappedToken] += tipY;
            }

            // 2. mint the token
            uint256 netAmount = amount -tipX - tipY;
            require(netAmount > 0, "mint net amount negative");
            XCoin(mappedToken).mint(to, amount - tipX - tipY);
        }

        // increase watermark
        tokenMappingWatermark[sourceToken][mappedToken]++;
    }

    // anyone can exit the mapped token back to its origin chain
    function burn(address mappedToken, uint256 amount) whenNotPaused external {
        require(mappedToken.isContract(), "mapped token address is not a contract");
        address sourceToken = tokenMappingReversed[mappedToken];
        require(
            tokenMappingPaused[sourceToken][mappedToken] == false,
            "token mapping paused"
        );

        address from = _msgSender();
        // charge tip if needed
        uint256 tipY = 0;
        if (shouldTip()) {
            tipY = getTip(sourceToken, mappedToken, amount);
            if (tipY > 0) {
                // transfer directly instead of staging account since
                // the asset is not under control of the vault contract
                XCoin(mappedToken).transferFrom(from, tipAccount, tipY);
            }
        }

        // burn the remain net amount
        uint256 netAmount = amount - tipY;
        require(netAmount > 0, "Negative net amount");
        // need first approve, otherwise will revert
        XCoin(mappedToken).burnFrom(from, netAmount);

        // emit event
        emit TokenBurn(
            address(this),
            sourceTokenChainids[sourceToken],
            block.chainid,
            sourceToken,
            mappedToken,
            from,
            amount,
            tipY,
            tokenMappingBurnNonce[sourceToken][mappedToken],
            block.number
        );

        // increase nonce
        tokenMappingBurnNonce[sourceToken][mappedToken] += 1;
    }

    // cashout mint the staged asset
    function tipCashout(address token, address to, uint256 amount) external whenNotPaused {
        address owner = _msgSender();
        require(owner == tipAccount, "Not tip account");
        uint256 balance = tipBalances[token];
        require(to != address(0), "cashout to the zero address");
        require(balance >= amount, "cashout amount too large");

        tipBalances[token] -= amount;

        // mint the token
        XCoin(token).mint(to, amount);
    }

    function tipBalance(address token) external view returns(uint256){
        return tipBalances[token];
    }

    function addNoncesToOmit(uint256[] memory nonces) external onlyNonceOp {
        for(uint256 index=0;index<nonces.length;index++) {
            omitNonces[nonces[index]] = true;
        }
        emit IgnoreNonces(_msgSender(), nonces);
    }

    function removeNoncesToOmit(uint256[] memory nonces) external onlyNonceOp {
        for(uint256 index=0;index<nonces.length;index++) {
            delete omitNonces[nonces[index]];
        }
    }

    function skipMintWatermark(
        address sourceToken, address mappedToken, uint256 skip
    ) external onlyNonceOp {
        emit SkipNonce(tokenMappingWatermark[sourceToken][mappedToken], skip);
        tokenMappingWatermark[sourceToken][mappedToken] += skip;
    }

    function refund(address token, address payable to, uint256 amount) external onlyRefundOp {
        XCoin(token).mint(to, amount);
        emit Refund(token, to, amount);
    }
}
