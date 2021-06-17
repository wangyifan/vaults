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
  }

  constructor(){
      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(ADMIN_ROLE, _msgSender());
      _setupRole(VALIDATOR_ROLE, _msgSender());
  }

  //[vault][tokenMapping][nonce] = {eventData, blsSig}
  mapping(address => mapping(bytes32 => mapping(uint256 => VaultEvent))) public vaultEvents;
  //[vault][tokenMapping] => nonce
  mapping(address => mapping(bytes32 => uint256)) public vaultEventWatermark;
  //[vault][tokenMapping][nonce] => bool
  mapping(address => mapping(bytes32 => mapping(uint256 => bool))) public vaultEventDone;
  //[vault][tokenMapping] => nonce
  mapping(address => mapping(bytes32 => uint256)) public vaultEventDoneWatermark;

  // test
  uint256 public n;

  function store(
      bytes calldata sig,
      address vault,
      uint256 nonce,
      bytes32 tokenMapping,
      bytes calldata eventData) external {
      // store vault events in order
      require(vaultEventWatermark[vault][tokenMapping] == nonce, "nonce too low");
      require(vaultEventDone[vault][tokenMapping][nonce] == false, "unrepeatable for same nonce");

      VaultEvent memory vaultEvent;
      vaultEvent.sig = sig;
      vaultEvent.eventData = eventData;

      // tokenMapping is sha3(source chain id, soure token, mapped chain id, mapped token)
      vaultEvents[vault][tokenMapping][nonce] = vaultEvent;

      // increase watermark by one
      vaultEventWatermark[vault][tokenMapping]+=1;
  }

  function done(address vault, bytes32 tokenMapping, uint256 nonce) external {
      vaultEventDone[vault][tokenMapping][nonce] = true;
  }

  function freeStorage(address vault, bytes32 tokenMapping) external {
      uint256 start = vaultEventDoneWatermark[vault][tokenMapping];
      while(vaultEventDone[vault][tokenMapping][start] == true) {
          delete vaultEventDone[vault][tokenMapping][start];
          start+=1;
      }
      vaultEventDoneWatermark[vault][tokenMapping] = start;
  }

  function setn(uint256 n_) external {
      n = n_;
  }
}
