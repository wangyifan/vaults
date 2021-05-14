// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// for wrapper token interface
interface IWToken {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}