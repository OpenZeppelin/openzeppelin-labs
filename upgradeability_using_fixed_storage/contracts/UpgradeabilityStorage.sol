pragma solidity ^0.4.21;

/**
 * @title UpgradeabilityStorage
 * @dev This contract holds all the necessary state variables to support the upgrade functionality
 */
contract UpgradeabilityStorage {
  // Storage position of the address of the current implementation
  bytes32 private constant implementationPosition = keccak256("zeppelin_os.proxy.implementation");

  /**
   * @dev Constructor function
   */
  function UpgradeabilityStorage() public {}

  /**
   * @dev Tells the address of the current implementation
   * @return address of the current implementation
   */
  function implementation() public view returns (address impl) {
    bytes32 position = implementationPosition;
    assembly {
      impl := sload(position)
    }
  }

  /**
   * @dev Sets the address of the current implementation
   * @param newImplementation address representing the new implementation to be set
   */
  function setImplementation(address newImplementation) internal {
    bytes32 position = implementationPosition;
    assembly {
      sstore(position, newImplementation)
    }
  }

  /**
   * @dev Sets the address of the current implementation
   * @param newImplementation address representing the new implementation to be set
   */
  function validateNonUsedImplementation(address newImplementation) internal {
    address currentImplementation = implementation();
    require(currentImplementation != newImplementation);
  }
}
