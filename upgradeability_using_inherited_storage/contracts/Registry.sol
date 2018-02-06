pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Upgradeable.sol';
import './UpgradeabilityProxy.sol';

contract Registry is IRegistry {
  mapping (string => address) versions;

  function addVersion(string version, address implementation) public {
    require(versions[version] == 0x0);
    versions[version] = implementation;
    VersionAdded(version, implementation);
  }

  function getVersion(string version) public view returns (address) {
    return versions[version];
  }

  function create(string version) public payable returns (UpgradeabilityProxy) {
    UpgradeabilityProxy proxy = new UpgradeabilityProxy(version);

    Upgradeable(proxy).initialize.value(msg.value)(msg.sender);

    Created(proxy);

    return proxy;
  }
}
