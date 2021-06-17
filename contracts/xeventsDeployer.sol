// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./xevents.sol";

contract XeventsDeployer {

    function deploy() public returns (address){
        bytes32 salt = "0x00";
        bytes memory bytecode = type(XEvents).creationCode;
        address addr;
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        return addr;
    }
}
