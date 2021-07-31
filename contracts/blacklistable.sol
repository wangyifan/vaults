// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./roleAccess.sol";

contract Blacklistable is RoleAccess {
    // blacklists
    mapping(address => bool) internal blacklisted;

    // events
    event Blacklisted(address indexed _account);
    event UnBlacklisted(address indexed _account);

    // modifier
    modifier notBlacklisted(address account) {
        require(
            !blacklisted[account],
            "Blacklistable: account is blacklisted"
        );
        _;
    }

    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    function blacklist(address account) external onlyBlacklister {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unBlacklist(address account) external onlyBlacklister {
        blacklisted[account] = false;
        emit UnBlacklisted(account);
    }
}
