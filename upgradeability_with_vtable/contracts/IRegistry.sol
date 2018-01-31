pragma solidity ^0.4.18;

interface IRegistry {
  event Created(address proxy);
  event ImplementationAdded(string version, bytes4 func, address impl);

  function addImplementation(string version, bytes4 func, address impl) public;
  function addImplementationFromName(string version, string func, address impl) public;
  function getImplementation(string version, bytes4 func) public view returns (address);
}
