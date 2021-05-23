// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./xbx.sol";

contract Minter is Ownable {
    address internal _xtoken;

    constructor(address xtoken) {
        _xtoken = xtoken;
    }

    function mint(address account, uint256 amount) public onlyOwner returns (bool){
        XToken(_xtoken).mint(account, amount);
        return true;
    }

    function setCap(uint256 newCap) public onlyOwner returns (bool) {
        XToken(_xtoken).setCap(newCap);
        return true;
    }
}
