// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "./roleAccess.sol";

contract XEvents is RoleAccess, Pausable {

  // structs
  struct VaultEvent {
      bytes sig;
      bytes eventData;
  }

  struct VaultEventExt {
      bytes sig;
      address vault;
      uint256 nonce;
      bytes32 tokenMapping;
      bytes eventData;
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
  //[vault] => blockNumber
  mapping(address => uint256) public vaultWatermark;
  bool private initialized;


  function validateSignature(bytes memory signature) internal pure returns(bool){
      require(signature.length > 0);
      return true;
  }

  function RecordVaultEventBatch(
      VaultEventExt[] memory vaultEventExts
  ) external whenNotPaused {
      for(uint256 index=0;index<vaultEventExts.length;index++) {
          RecordVaultEvent(
              vaultEventExts[index].sig,
              vaultEventExts[index].vault,
              vaultEventExts[index].nonce,
              vaultEventExts[index].tokenMapping,
              vaultEventExts[index].eventData
          );
      }
  }

  function RecordVaultEvent(
      bytes memory sig,
      address vault,
      uint256 nonce,
      bytes32 tokenMapping,
      bytes memory eventData) public whenNotPaused{
      // store vault events in order
      require(tokenMappingWatermark[vault][tokenMapping] == nonce, "nonce too low");
      require(validateSignature(sig), "Invalid vault event signature");

      VaultEvent memory vaultEvent = VaultEvent(sig, eventData);

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

  function rescueVault(address vault, uint256 blockNumber) public {
      vaultWatermark[vault] = blockNumber;
  }

  function rescueTokenMapping(address vault, bytes32 tokenMapping, uint256 nonce) public {
      tokenMappingWatermark[vault][tokenMapping] = nonce;
  }

  // admin can assign validator role to another EOA or smart contract
  function grantValidator(address validator) public onlyAdmin returns (bool) {
      grantRole(VALIDATOR_ROLE, validator);
      return true;
  }

  function pause() external onlyAdmin {
      _pause();
  }

  function unpause() external onlyAdmin {
      _unpause();
  }
}
