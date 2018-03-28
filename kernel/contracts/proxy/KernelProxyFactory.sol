pragma solidity ^0.4.18;

import "./KernelProxy.sol";
import "../ZepCore.sol";
import "../KernelRegistry.sol";
import "../KernelInstance.sol";

contract KernelProxyFactory {
  event ProxyCreated(address proxy);

  ZepCore private _zepCore;

  function KernelProxyFactory(ZepCore zepCore) public {
    _zepCore = zepCore;
  }

  function zepCore() public view returns (ZepCore) {
    return _zepCore;
  }

  function createProxy(string distribution, string version, string contractName) public returns (KernelProxy) {
    address implementation = getImplementation(distribution, version, contractName);
    KernelProxy proxy = new KernelProxy(implementation);
    proxy.transferProxyOwnership(msg.sender);
    ProxyCreated(proxy);
    return proxy;
  }

  function getImplementation(string distribution, string version, string contractName) public returns (address) {
    KernelRegistry registry = zepCore().registry();
    KernelInstance instance = registry.getInstance(distribution, version);
    return instance.getImplementation(contractName);
  }
}
