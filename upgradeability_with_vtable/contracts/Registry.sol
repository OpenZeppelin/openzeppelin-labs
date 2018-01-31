pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Proxy.sol';
import './Upgradeable.sol';

contract Registry is IRegistry {
  mapping (string => mapping (bytes4 => address)) implementations;

  function addImplementationFromName(string version, string func, address impl) public {
    return addImplementation(version, bytes4(keccak256(func)), impl);
  }

  function addImplementation(string version, bytes4 func, address impl) public {
    require(implementations[version][func] == 0x0);
    implementations[version][func] = impl;
    ImplementationAdded(version, func, impl);
  }

  function getImplementation(string version, bytes4 func) public view returns (address) {
    return implementations[version][func];
  }

  function create(string version) public payable returns (Proxy) {
    Proxy proxy = new Proxy(version);

    Upgradeable(proxy).initialize.value(msg.value)(msg.sender);

    Created(proxy);

    return proxy;
  }
}
