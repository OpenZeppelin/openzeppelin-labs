pragma solidity ^0.4.18;

contract UpgradeabilityStorage {
  string internal _version;
  address internal _implementation;

  function version() public view returns (string) {
    return _version;
  }

  function implementation() public view returns (address) {
    return _implementation;
  }
}
