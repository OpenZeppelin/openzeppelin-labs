pragma solidity ^0.4.18;

import "./Proxy.sol";
import "./KernelProxyStorage.sol";

contract KernelProxy is KernelProxyStorage, Proxy {
  event ProxyOwnershipTransferred(address previousOwner, address newOwner);

  modifier onlyProxyOwner() {
    require(msg.sender == proxyOwner());
    _;
  }

  function KernelProxy(address implementation) public {
    _proxyOwner = msg.sender;
    upgradeTo(implementation);
  }

  function implementation() public view returns (address) {
    return _implementation;
  }

  function proxyOwner() public view returns (address) {
    return _proxyOwner;
  }

  function transferProxyOwnership(address newOwner) public onlyProxyOwner {
    require(newOwner != address(0));
    ProxyOwnershipTransferred(proxyOwner(), newOwner);
    _proxyOwner = newOwner;
  }

  function upgradeTo(address implementation) public onlyProxyOwner {
    _upgradeTo(implementation);
  }

  function upgradeToAndCall(address implementation, bytes data) payable public onlyProxyOwner {
    upgradeTo(implementation);
    require(this.call.value(msg.value)(data));
  }

  function _upgradeTo(address implementation) internal {
    require(implementation != address(0));
    require(_implementation != implementation);
    _implementation = implementation;
  }
}
