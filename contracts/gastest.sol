// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract GasTest {
    uint256 unit = 10;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    function mint(address account, uint256 amount) public {
        totalSupply += amount;
        balances[account] += amount;
    }

    function batchMint(address[] memory accounts, uint256[] memory amounts) public {
        for(uint256 index=0;index<accounts.length;index++) {
            totalSupply += amounts[index];
            balances[accounts[index]] += amounts[index];
        }
    }

    function setZero1() public {
        totalSupply += 10000 * unit;
    }

    function setUnit(uint256 input) public {
        unit = input;
    }

    function setZero2() public {
        totalSupply += 10000 * unit;
    }
}
