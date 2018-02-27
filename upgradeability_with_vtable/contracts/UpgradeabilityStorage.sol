pragma solidity ^0.4.18;

import './IRegistry.sol';

/**
 * @title UpgradeabilityStorage
 * @dev This contract holds all the necessary state variables to support the upgrade functionality
 */
contract UpgradeabilityStorage {
  // Registry of versions
  IRegistry internal registry;

  // Mapping of functions to current implementations
  mapping (bytes4 => address) internal _implementations;

  /**
  * @dev Tells the address of the current implementation for a given function signature
  * @param func representing the signature of the function to query the implementation of
  * @return address of the current implementation of the given function
  */
  function implementation(bytes4 func) public view returns (address) {
    return _implementations[func];
  }
}
