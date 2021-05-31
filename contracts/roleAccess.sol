// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract RoleAccess is AccessControlEnumerable {
    // role definition
    bytes32 internal constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 internal constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    // modifier
    modifier onlyAdmin {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        _;
    }

    modifier onlyValidator {
        require(hasRole(VALIDATOR_ROLE, _msgSender()), "Caller is not a validator");
        _;
    }

    function addValidator(address validator) external onlyAdmin returns (bool) {
        grantRole(VALIDATOR_ROLE, validator);
        return true;
    }

    function removeValidator(address validator) external onlyAdmin returns (bool) {
        if (hasRole(VALIDATOR_ROLE, validator)) {
            revokeRole(VALIDATOR_ROLE, validator);
        }
        return true;
    }

    function getValidators() external view returns (address[] memory) {
        uint256 count = getRoleMemberCount(VALIDATOR_ROLE);
        address[]  memory validators_ = new address[](count);
        for (uint index = 0; index < count; index++) {
            validators_[index] = getRoleMember(VALIDATOR_ROLE, index);
        }
        return validators_;
    }
}
