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
  function UpgradeabilityProxy(string version, bytes4[] funcs) public {
    registry = IRegistry(msg.sender);
    for(uint256 i = 0; i < funcs.length; i++) {
      upgradeTo(version, funcs[i]);
    }
  }

  /**
  * @dev Upgrades the implementation of a given function to the requested version
  * @param version representing the version name of the new implementation to be set
  * @param func representing the signature of the function to be set
  */
  function upgradeTo(string version, bytes4 func) public {
    _implementations[func] = registry.getVersion(version, func);
  }
}
