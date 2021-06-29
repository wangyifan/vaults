// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./roleAccess.sol";

contract XConfig is RoleAccess {

  function initialize() external {
      require(!initialized, "can only initialize once");
      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(ADMIN_ROLE, _msgSender());
      initialized = true;
  }

  // increase by one when new config is recorded
  uint256 public ConfigVersion;
  mapping(uint256 => bytes) public Configs;
  bool private initialized;

  function UpdateConfig(bytes calldata config) onlyAdmin external {
    ConfigVersion += 1;
    Configs[ConfigVersion] = config;
  }
}
