// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./xcoin.sol";

contract Minter is Ownable {
    address internal _xcoin;

    constructor(address xcoin) {
        require(xcoin != address(0));
        _xcoin = xcoin;
    }

    function mint(address account, uint256 amount) public onlyOwner returns (bool){
        XCoin(_xcoin).mint(account, amount);
        return true;
    }

    function setCap(uint256 newCap) public onlyOwner returns (bool) {
        XCoin(_xcoin).setCap(newCap);
        return true;
    }
}
