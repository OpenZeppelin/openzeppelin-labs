pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Upgradeable.sol';
import './UpgradeabilityProxy.sol';

/**
 * @title Registry
 * @dev This contract works as a registry of versions, it holds the implementations for the registered versions.
 */
contract Registry is IRegistry {
  // Mapping of versions to implementations of different functions
  mapping (string => mapping (bytes4 => address)) internal versions;

  /**
  * @dev Registers a new version of a function with its implementation address
  * @param version representing the version name of the new function implementation to be registered
  * @param func representing the name of the function to be registered
  * @param implementation representing the address of the new function implementation to be registered
  */
  function addVersionFromName(string version, string func, address implementation) public {
    return addVersion(version, bytes4(keccak256(func)), implementation);
  }

  /**
  * @dev Registers a new version of a function with its implementation address
  * @param version representing the version name of the new function implementation to be registered
  * @param func representing the signature of the function to be registered
  * @param implementation representing the address of the new function implementation to be registered
  */
  function addVersion(string version, bytes4 func, address implementation) public {
    require(versions[version][func] == address(0));
    versions[version][func] = implementation;
    VersionAdded(version, func, implementation);
  }

  /**
  * @dev Tells the address of the function implementation for a given version
  * @param version representing the version of the function implementation to be queried
  * @param func representing the signature of the function to be queried
  * @return address of the function implementation registered for the given version
  */
  function getVersion(string version, bytes4 func) public view returns (address) {
    return versions[version][func];
  }

  /**
  * @dev Creates an upgradeable proxy
  * @return address of the new proxy created
  */
  function createProxy(string version, bytes4[] funcs) public payable returns (UpgradeabilityProxy) {
    UpgradeabilityProxy proxy = new UpgradeabilityProxy(version, funcs);
    Upgradeable(proxy).initialize.value(msg.value)(msg.sender);
    ProxyCreated(proxy);
    return proxy;
  }
}
