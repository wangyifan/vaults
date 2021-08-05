// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract RoleAccess is AccessControlEnumerable {
    // role definition
    bytes32 internal constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 internal constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 internal constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 internal constant RESCUEOP_ROLE = keccak256("RESCUEOP_ROLE");
    bytes32 internal constant NONCEOP_ROLE = keccak256("NONCEOP_ROLE");
    bytes32 internal constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 internal constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    // struct
    struct Role {
        bytes32 role;
        string describe;
    }

    // modifier
    modifier onlyAdmin {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        _;
    }

    modifier onlyManager {
        require(hasRole(MANAGER_ROLE, _msgSender()), "Caller is not a manager");
        _;
    }

    modifier onlyMinter {
        require(hasRole(MINTER_ROLE, _msgSender()), "Caller is not a minter");
        _;
    }

    modifier onlyRescueOp {
        require(hasRole(RESCUEOP_ROLE, _msgSender()), "Caller is not a rescue op");
        _;
    }

    modifier onlyNonceOp {
        require(hasRole(NONCEOP_ROLE, _msgSender()), "Caller is not a nonce op");
        _;
    }

    modifier onlyValidator {
        require(hasRole(VALIDATOR_ROLE, _msgSender()), "Caller is not a validator");
        _;
    }

    modifier onlyBlacklister {
        require(hasRole(BLACKLISTER_ROLE, _msgSender()), "Caller is not a blacklister");
        _;
    }

    function getRoles() public pure returns(Role[] memory) {
        Role[] memory result = new Role[](7);
        result[0] = Role(ADMIN_ROLE, "admin");
        result[1] = Role(MANAGER_ROLE, "manager");
        result[2] = Role(MINTER_ROLE, "minter");
        result[3] = Role(RESCUEOP_ROLE, "rescue op");
        result[4] = Role(NONCEOP_ROLE, "nonce op");
        result[5] = Role(VALIDATOR_ROLE, "validator");
        result[6] = Role(BLACKLISTER_ROLE, "blacklister");
        return result;
    }

    function addRoleMember(bytes32 role, address member) external onlyAdmin returns (bool) {
        grantRole(role, member);
        return true;
    }

    function removeRoleMember(bytes32 role, address member) external onlyAdmin returns (bool) {
        if (hasRole(role, member)) {
            revokeRole(role, member);
        }
        return true;
    }

    function getRoleMembers(bytes32 role) external view returns (address[] memory) {
        uint256 count = getRoleMemberCount(role);
        address[]  memory members_ = new address[](count);
        for (uint index = 0; index < count; index++) {
            members_[index] = getRoleMember(role, index);
        }
        return members_;
    }
}
