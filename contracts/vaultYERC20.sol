// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// this erc20 should support both mint() and burn() operation
contract VaultYERC20 is Pausable, Ownable, ReentrancyGuard, ERC20Burnable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20Pausable: token transfer while paused");
    }

    function chargeFee(address to, uint256 amount) public onlyOwner {
    }

    function initialize() public {
    }
}
