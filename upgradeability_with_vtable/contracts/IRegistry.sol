pragma solidity ^0.4.18;

/**
 * @title IRegistry
 * @dev This contract represents the interface of a registry contract
 */
interface IRegistry {
  /**
  * @dev This event will be emitted every time a new proxy is created
  * @param proxy representing the address of the proxy created
  */
  event ProxyCreated(address proxy);

  /**
  * @dev This event will be emitted every time a new implementation of a function is registered
  * @param version representing the version name of the registered implementation
  * @param func representing the signature of the function implementation registered
  * @param implementation representing the address of the registered implementation
  */
  event VersionAdded(string version, bytes4 func, address implementation);

  /**
  * @dev Registers a new version of a function with its implementation address
  * @param version representing the version name of the new function implementation to be registered
  * @param func representing the name of the function to be registered
  * @param implementation representing the address of the new function implementation to be registered
  */
  function addVersionFromName(string version, string func, address implementation) public;

  /**
  * @dev Registers a new version of a function with its implementation address
  * @param version representing the version name of the new function implementation to be registered
  * @param func representing the signature of the function to be registered
  * @param implementation representing the address of the new function implementation to be registered
  */
  function addVersion(string version, bytes4 func, address implementation) public;

  /**
  * @dev Tells the address of the function implementation for a given version
  * @param version representing the version of the function implementation to be queried
  * @param func representing the signature of the function to be queried
  * @return address of the function implementation registered for the given version
  */
  function getVersion(string version, bytes4 func) public view returns (address);
}
