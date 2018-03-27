pragma solidity ^0.4.18;

import './Proxy.sol';
import './IRegistry.sol';
import './UpgradeabilityStorage.sol';

/**
 * @title UpgradeabilityProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeabilityProxy is Proxy, UpgradeabilityStorage {

  /**
   * @dev Constructor function
   */
  function UpgradeabilityProxy(string _version) public {
    registry = IRegistry(msg.sender);
    version_ = _version;
    loadVersion();
  }

  /**
   * @dev Upgrades the implementation of a given function to the requested version
   * @param targetVersion representing the version name of the new implementation to be set
   */
  function upgradeTo(string targetVersion) public {
    clearVersion();
    version_ = targetVersion;
    loadVersion();
  }

  /**
   * @dev Clears from the implementation cache all functions from the current version
   */
  function clearVersion() internal {
    bytes4 func;
    address impl;
    uint256 i;

    for (i = 0; i < registry.getFunctionCount(version_); i++) {
      (func, impl) = registry.getFunctionByIndex(version_, i);
      implementations_[func] = 0;
    }

    fallback_ = address(0);
  }

  /**
   * @dev Adds to the implementation cache all functions from the current version
   */
  function loadVersion() internal {
    bytes4 func;
    address impl;
    uint256 i;

    for (i = 0; i < registry.getFunctionCount(version_); i++) {
      (func, impl) = registry.getFunctionByIndex(version_, i);
      implementations_[func] = impl;
    }
    
    fallback_ = registry.getFallback(version_);
  }
}
