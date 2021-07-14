// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./roleAccess.sol";

contract XConfig is RoleAccess {

  function initialize() external {
      require(!initialized, "can only initialize once");
      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(ADMIN_ROLE, _msgSender());
      _setupRole(VALIDATOR_ROLE, _msgSender());
      initialized = true;
  }

  // initialize should be called only once
  bool private initialized;

  uint256 public VaultConfigVersion;
  uint256 public VssConfigVersion;
  mapping(uint256 => bytes) public VaultConfigs;
  mapping(uint256 => bytes) public VssConfigs;
  address[] public activeVssMemberList;

  function updateVssConfig() onlyValidator external {
  }


  function UpdateVaultConfig(bytes calldata config) onlyAdmin external {
    VaultConfigVersion += 1;
    VaultConfigs[VaultConfigVersion] = config;
  }
}
