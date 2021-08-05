// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./roleAccess.sol";

contract RescueVault is RoleAccess {
  function Withdraw(address token, address to, uint256 amount) external onlyAdmin returns (bool){
      return true;
  }

  function WithdrawNative(address to, uint256 amount) external onlyAdmin returns (bool){
      return true;
  }
}
