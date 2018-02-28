pragma solidity ^0.4.18;

import './IRegistry.sol';

/**
 * @title UpgradeabilityStorage
 * @dev This contract holds all the necessary state variables to support the upgrade functionality
 */
contract UpgradeabilityStorage {
  // Versions registry
  IRegistry internal registry;

  // Address of the current implementation
  address internal _implementation;

  /**
  * @dev Tells the address of the current implementation
  * @return address of the current implementation
  */
  function implementation() public view returns (address) {
    return _implementation;
  }
}
