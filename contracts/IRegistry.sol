pragma solidity ^0.4.18;

interface IRegistry {
    event Created(address proxy);
    event VersionAdded(string version, address impl);

    function addVersion(string version, address impl) public;
    function getVersion(string version) public view returns (address);
}
