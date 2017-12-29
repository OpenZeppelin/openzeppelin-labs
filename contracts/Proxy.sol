pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Proxied.sol';

contract Proxy is Proxied {
    function Proxy(string _version) public {
        registry = IRegistry(msg.sender);
        impl = registry.getVersion(_version);
    }

    function upgradeTo(string _version) public {
        impl = registry.getVersion(_version);
    }

    function () payable public {
        bytes memory data = msg.data;
        address _impl = impl;

        assembly {
            let result := delegatecall(gas, _impl, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize

            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
