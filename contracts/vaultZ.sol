// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./vaultYERC20.sol";
import "./IWToken.sol";


contract VaultZ is Pausable, Ownable {
    using SafeMath for uint256;

    mapping(address => bool) public erc20Exists;
    mapping(address => uint256) public tokenBonds;
    mapping(address => address) public tokenOwners;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(address => uint256) public depositsPerToken;
    mapping(uint256 => bool) public mintDone;
    mapping(address => address) public getERC20;
    address[] public allERC20s;

    uint256 public mintWatermark;
    uint256 public withdrawNonce;

    // VaultZ

    mapping(address => address) public tokenAddressBook;

    event TokenMint(address token, address receiver, uint256 amount, uint256 depositNonce, uint256 tokenBalanceAfter);
    event TokenBurn(address token, address account, uint256 amount, uint256 withdrawNonce, uint256 tokenBalanceAfter);
    event ERC20Created(address source, address VaultYERC20);

    constructor(address _wToken) {
    }

    function registerToken(address XTokenAddress) public onlyOwner returns (bool) {
        require(!erc20Exists[XTokenAddress]);
        erc20Exists[XTokenAddress] = true;
        return true;
    }

    // only owner can mint
    function mint(address XTokenAddress, address receiver, uint256 amount, uint256 mintNonce) public onlyOwner {
        require(receiver != address(0), "mint to the zero address");
        require(amount > 0, "mint only to positive amount ");
        require(mintNonce >= mintWatermark, "mint nonce too low");
        require(mintDone[mintNonce]==false, "only mint once");
        address YTokenAddress = tokenAddressBook[XTokenAddress];
        if (YTokenAddress == address(0)) {
            createERC20(XTokenAddress);
        }
        mintDone[mintNonce] = true;
        VaultYERC20(YTokenAddress).mint(receiver, amount);
        while(mintDone[mintWatermark]) {
            // release storage space
            delete mintDone[mintWatermark];
            mintWatermark += 1;
        }
    }

    function createERC20(address XTokenAddress) internal returns(address erc20){
        if (getERC20[XTokenAddress] != address(0)) {
            return getERC20[XTokenAddress];
        }
        bytes memory bytecode = type(VaultYERC20).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(XTokenAddress));
        assembly {
            erc20 := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        VaultYERC20(erc20).initialize();
        getERC20[XTokenAddress] = erc20;
        allERC20s.push(erc20);
        emit ERC20Created(XTokenAddress, erc20);
    }

    // anyone can withdraw
    function withdraw(address XTokenAddress, address account, uint256 amount) public {
        address YTokenAddress = tokenAddressBook[XTokenAddress];
        VaultYERC20(YTokenAddress).burnFrom(account, amount);
        withdrawNonce += 1;
        emit TokenBurn(XTokenAddress, account, amount, withdrawNonce, VaultYERC20(YTokenAddress).balanceOf(account));
    }

    function IgnoreMint(uint256 mintNonce) public onlyOwner{
        mintDone[mintNonce] = true;
    }

}