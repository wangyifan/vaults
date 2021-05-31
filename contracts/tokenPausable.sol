// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "./roleAccess.sol";

contract TokenPausable is Pausable, RoleAccess {
    mapping(address => mapping(address => bool)) internal tokenMappingPaused;

    function pauseAll() external onlyAdmin {
        _pause();
    }

    function unpauseAll() external onlyAdmin {
        _unpause();
    }

    function pauseTokenMapping(
        address sourceToken,
        address mappedToken
    ) public onlyAdmin {
        tokenMappingPaused[sourceToken][mappedToken] = true;
    }

    function unpauseTokenMapping(
        address sourceToken,
        address mappedToken
    ) external onlyAdmin {
        tokenMappingPaused[sourceToken][mappedToken] = false;
    }
}
