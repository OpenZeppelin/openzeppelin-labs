pragma solidity ^0.4.18;

import './Proxy.sol';
import './IRegistry.sol';
import './UpgradeabilityStorage.sol';

contract UpgradeabilityProxy is Proxy, UpgradeabilityStorage {

  function UpgradeabilityProxy(string _version) public {
    registry = IRegistry(msg.sender);
    _implementation = registry.getVersion(_version);
  }

  function upgradeTo(string _version) public {
    _implementation = registry.getVersion(_version);
  }

  function implementation() public view returns (address) {
    return _implementation;
  }

}
