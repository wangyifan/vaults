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

    // variables
    mapping(address => uint256) internal sourceTokenChainids;
    mapping(address => string) internal sourceTokenSymbols;
    mapping(address => string) internal mappedTokenSymbols;
    mapping(address => address) internal tokenMapping;
    mapping(address => address) internal tokenMappingReversed;
    mapping(address => mapping(address => uint256)) public tokenMappingWatermark;
    mapping(address => mapping(address => uint256 )) internal tokenMappingBurnNonce;
    mapping(address => mapping(address => uint256)) internal tokenStagingBalances;
    tokenPair[] public tokenPairs;

    // events
    event TokenMint(
        uint256 sourceChainid,
        address indexed sourceToken,
        uint256 mappedChainid,
        address indexed mappedToken,
        address to,
        uint256 amount,
        uint256 tip,
        uint256 indexed mintNonce
    );
    event TokenBurn(
        uint256 sourceChainid,
        address indexed sourceToken,
        uint256 mappedChainid,
        address indexed mappedToken,
        address account,
        uint256 amount,
        uint256 tip,
        uint256 indexed burnNonce
    );
    event rescue(
        address token,
        address admin,
        address to,
        uint256 amount
    );

    constructor() Staking(10) {
        //setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(VALIDATOR_ROLE, _msgSender());

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
    function batchMint(bytes calldata input) external onlyValidator whenNotPaused {
        require(input.length%160==0);
        for(uint index = 0; index < input.length; index+=160){
            address sourceToken = abi.decode(input[index:32], (address));
            address mappedToken = abi.decode(input[32:64], (address));
            address to = abi.decode(input[64:96], (address));
            uint256 amount = abi.decode(input[96:128], (uint256));
            uint256 mintNonce = abi.decode(input[128:160], (uint256));
            uint256 tip = 0;
            mint(sourceToken, mappedToken, to, amount, tip, mintNonce);
        }
    }

    // only validator can mint
    function mint(
        address sourceToken,
        address mappedToken,
        address to,
        uint256 amount,
        uint256 tipX,
        uint256 mintNonce
    ) public onlyValidator whenNotPaused {
        require(to != address(0), "mint to the zero address");
        require(tokenMappingPaused[sourceToken][mappedToken] == false,"token mapping paused");
        require(mintNonce == tokenMappingWatermark[sourceToken][mappedToken], "mint nonce too low");

        // 1. charge tip
        uint256 tipY = 0;
        if (shouldTip()) {
            tipY = getTip(sourceToken, mappedToken, amount);
            if (tipY > 0) {
                tokenStagingBalances[mappedToken][tipAccount] += tipY;
            }
        }

        // 2. mint the token
        uint256 netAmount = amount - tipY - tipX;
        require(netAmount > 0, "Negative net amount");
        XCoin(mappedToken).mint(to, netAmount);

        // 3. emit event
        emit TokenMint(
            sourceTokenChainids[sourceToken],
            sourceToken,
            block.chainid,
            mappedToken,
            to,
            amount,
            tipY,
            mintNonce
        );

        // 4. increase nonce
        tokenMappingWatermark[sourceToken][mappedToken] = mintNonce + 1;
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
            sourceTokenChainids[sourceToken],
            sourceToken,
            block.chainid,
            mappedToken,
            from,
            amount,
            tipY,
            tokenMappingBurnNonce[sourceToken][mappedToken]
        );

        // increase nonce
        tokenMappingBurnNonce[sourceToken][mappedToken] += 1;
    }

    // cashout mint the staged asset
    function cashout(address token, address to, uint256 amount) external whenNotPaused {
        address owner = _msgSender();
        uint256 balance = tokenStagingBalances[token][owner];
        require(to != address(0), "cashout to the zero address");
        require(balance >= amount, "cashout amount too large");

        tokenStagingBalances[token][owner] -= amount;

        // mint the token
        XCoin(token).mint(to, amount);
    }

    function cashoutBalance(address token, address owner) external view returns(uint256){
        return tokenStagingBalances[token][owner];
    }

    function skipMintWatermark(address sourceToken, address mappedToken, uint256 skip) external {
        tokenMappingWatermark[sourceToken][mappedToken] += skip;
    }

    function rescueAsset(address mappedToken, address to, uint256 amount) external onlyAdmin{
        XCoin(mappedToken).transfer(to, amount);
        emit rescue(mappedToken, _msgSender(), to, amount);
    }
}
