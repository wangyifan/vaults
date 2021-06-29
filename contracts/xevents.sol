// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./roleAccess.sol";

contract XEvents is RoleAccess {

  // structs
  struct VaultEvent {
      bytes eventData;
      bytes sig;
      uint256 blockNumber;
  }

  function initialize() external {
      require(!initialized, "can only initialize once");
      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(ADMIN_ROLE, _msgSender());
      _setupRole(VALIDATOR_ROLE, _msgSender());
      initialized = true;
  }

  //[vault][tokenMapping][nonce] = {eventData, blsSig}
  mapping(address => mapping(bytes32 => mapping(uint256 => VaultEvent))) public vaultEvents;
  //[vault][tokenMapping] => nonce
  mapping(address => mapping(bytes32 => uint256)) public tokenMappingWatermark;
  //[vault][tokenMapping] => nonce
  mapping(address => mapping(bytes32 => uint256)) public vaultEventDone;
  //[vault] => blockNumber
  mapping(address => uint256) public vaultWatermark;
  //[vault][tokenMapping] => nonce
  mapping(address =>mapping(bytes32 => uint256)) public mintWatermark;
  bool private initialized;

  function RecordVaultEvent(
      bytes calldata sig,
      address vault,
      uint256 nonce,
      bytes32 tokenMapping,
      uint256 blockNumber,
      bytes calldata eventData) external {
      // store vault events in order
      require(tokenMappingWatermark[vault][tokenMapping] == nonce, "nonce too low");

      VaultEvent memory vaultEvent;
      vaultEvent.sig = sig;
      vaultEvent.eventData = eventData;
      vaultEvent.blockNumber = blockNumber;

      // tokenMapping is sha3(source chain id, soure token, mapped chain id, mapped token)
      vaultEvents[vault][tokenMapping][nonce] = vaultEvent;

      // increase token mapping watermark by one
      tokenMappingWatermark[vault][tokenMapping]+=1;
  }

  // validator should call this to explicitly move the block number forward
  // if one validator does not store all vault events in one round
  // (e.g. partially complete for all events in one block),
  // the next call to it could fail because of nonce check.
  // So this function should be called after all vaults events are stored.
  function updateVaultWatermark(address vault, uint256 blockNumber) external {
      vaultWatermark[vault] = blockNumber;
  }

  function done(address vault, bytes32 tokenMapping, uint256 nonce) external {
      vaultEventDone[vault][tokenMapping] = nonce;
  }

  function rescueVault(address vault, uint256 blockNumber) public {
      vaultWatermark[vault] = blockNumber;
  }

  function rescueTokenMapping(address vault, bytes32 tokenMapping, uint256 nonce) public {
      tokenMappingWatermark[vault][tokenMapping] = nonce;
  }
}
