// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./roleAccess.sol";

contract RescueVault is RoleAccess {
  function Withdraw(address token, address to, uint256 amount) external view onlyAdmin returns (bool){
      token;
      to;
      amount;
      return true;
  }

  function WithdrawNative(address to, uint256 amount) external view onlyAdmin returns (bool){
      to;
      amount;
      return true;
  }
}
