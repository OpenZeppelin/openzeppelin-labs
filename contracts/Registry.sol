pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Proxy.sol';
import './Upgradeable.sol';

contract Registry is IRegistry {
    mapping (string => address) versions;

    function addVersion(string version, address impl) public {
        require(versions[version] == 0x0);
        versions[version] = impl;
        VersionAdded(version, impl);
    }

    function getVersion(string version) public view returns (address) {
        return versions[version];
    }

    function create(string version) public payable returns (Proxy) {
         Proxy proxy = new Proxy(version);

         Upgradeable(proxy).initialize.value(msg.value)(msg.sender);

         Created(proxy);

         return proxy;
    }
}
