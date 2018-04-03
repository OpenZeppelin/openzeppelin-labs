pragma solidity ^0.4.21;


/**
 * @title OwnedUpgradeabilityStorage
 * @dev This contract keeps track of the upgradeability owner
 */
contract OwnedUpgradeabilityStorage {
  // Storage position of the owner of the contract
  bytes32 private constant upgradeabilityOwnerPosition = keccak256("org.zeppelinos.proxy.owner");

  /**
   * @dev Constructor function
   */
  function OwnedUpgradeabilityStorage() public {}

  /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
  function upgradeabilityOwner() public view returns (address owner) {
    bytes32 position = upgradeabilityOwnerPosition;
    assembly {
      owner := sload(position)
    }
  }

  /**
   * @dev Sets the address of the owner
   */
  function setUpgradeabilityOwner(address newUpgradeabilityOwner) internal {
    bytes32 position = upgradeabilityOwnerPosition;
    assembly {
      sstore(position, newUpgradeabilityOwner)
    }
  }
}
