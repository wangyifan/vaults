// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Deploy VaultX in the origin blockchain and connect to
// the YVault in the AMM blockchain
contract TestCoin is ERC20 {
  constructor() ERC20("TestCoin", "TC") {}

  function mint(address to, uint amount) public {
    _mint(to, amount);
  }
}
