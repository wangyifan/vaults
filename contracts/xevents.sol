// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
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
  mapping(address => mapping(bytes32 => uint256)) public vaultEventWatermark;
  //[vault][tokenMapping] => nonce
  mapping(address => mapping(bytes32 => uint256)) public vaultEventDone;
  //[vault] => blockNumber
  mapping(address => uint256) public vaultWatermark;
  //[vault][blocknumber] => store counter
  mapping(address =>mapping(uint256 => uint256)) public vaultStoreCounter;
  //[vault][tokenMapping] => nonce
  mapping(address =>mapping(bytes32 => uint256)) public mintWatermark;
  uint256 public storeCounter;
  bool private initialized;

  function store(
      bytes calldata sig,
      address vault,
      uint256 nonce,
      bytes32 tokenMapping,
      uint256 blockNumber,
      bytes calldata eventData) external {
      // store vault events in order
      require(vaultEventWatermark[vault][tokenMapping] == nonce, "nonce too low");

      VaultEvent memory vaultEvent;
      vaultEvent.sig = sig;
      vaultEvent.eventData = eventData;
      vaultEvent.blockNumber = blockNumber;

      // tokenMapping is sha3(source chain id, soure token, mapped chain id, mapped token)
      vaultEvents[vault][tokenMapping][nonce] = vaultEvent;

      // increase token mapping watermark by one
      vaultEventWatermark[vault][tokenMapping]+=1;

      // increase counter
      storeCounter += 1;
  }

  function doMint(address vault, bytes32 tokenMapping, uint256 nonce) external {
      mintWatermark[vault][tokenMapping] = nonce;
  }

  // validator should call this to explicitly move the block number forward
  // if one validator does not store all vault events in one round
  // (e.g. partially complete for all events in one block),
  // the next call to it could fail because of nonce check.
  // So this function should be called after all vaults events are stored.
  function updateVaultWatermark(address vault, uint256 blockNumber) external {
      vaultWatermark[vault] = blockNumber;
      vaultStoreCounter[vault][blockNumber] = storeCounter;
  }

  function done(address vault, bytes32 tokenMapping, uint256 nonce) external {
      vaultEventDone[vault][tokenMapping] = nonce;
  }

  function setStoreCounter(uint256 n_) external {
      storeCounter = n_;
  }

  function rescue(address vault, uint256 blockNumber, uint256 storeCounter_) public {
      vaultWatermark[vault] = blockNumber;
      vaultStoreCounter[vault][blockNumber] = storeCounter_;
  }

  function rescueVault(address vault, bytes32 tokenMapping, uint256 nonce) public {
      vaultEventWatermark[vault][tokenMapping] = nonce;
  }
}
