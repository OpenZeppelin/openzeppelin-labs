pragma solidity ^0.4.18;

interface IRegistry {
  event Created(address proxy);
  event VersionAdded(string version, address implementation);

  function addVersion(string version, address implementation) public;
  function getVersion(string version) public view returns (address);
}
