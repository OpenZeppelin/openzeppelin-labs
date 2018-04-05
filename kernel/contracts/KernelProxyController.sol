pragma solidity ^0.4.18;

import "./ZepCore.sol";
import "./KernelRegistry.sol";
import "./KernelInstance.sol";
import "zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol";
import "zos-core/contracts/upgradeability/UpgradeabilityProxyFactory.sol";

contract KernelProxyController {
  ZepCore private _zepCore;
  UpgradeabilityProxyFactory private _factory;

  function KernelProxyController(ZepCore zepCore, UpgradeabilityProxyFactory factory) public {
    require(zepCore != address(0));
    require(factory != address(0));
    _zepCore = zepCore;
    _factory = factory;
  }

  function zepCore() public view returns (ZepCore) {
    return _zepCore;
  }

  function factory() public view returns (UpgradeabilityProxyFactory) {
    return _factory;
  }

  function create(string distribution, string version, string contractName) public returns (OwnedUpgradeabilityProxy) {
    address implementation = getImplementation(distribution, version, contractName);
    return factory().createProxy(msg.sender, implementation);
  }

  function createAndCall(string distribution, string version, string contractName, bytes data) payable public returns (OwnedUpgradeabilityProxy) {
    address implementation = getImplementation(distribution, version, contractName);
    return factory().createProxyAndCall(msg.sender, implementation, data);
  }

  function getImplementation(string distribution, string version, string contractName) internal returns (address) {
    KernelRegistry registry = zepCore().registry();
    KernelInstance instance = registry.getInstance(distribution, version);
    address implementation = instance.getImplementation(contractName);
    require(implementation != address(0));
    return implementation;
  }
}
