pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Proxied.sol';

contract Proxy is Proxied {
  function Proxy(string _version) public {
    registry = IRegistry(msg.sender);
    version = _version;
  }

  function upgradeTo(string _version) public {
    version = _version;
  }

  function () payable public {
    bytes memory data = msg.data;
    address impl = registry.getImplementation(version, msg.sig);

    assembly {
      let result := delegatecall(gas, impl, add(data, 0x20), mload(data), 0, 0)
      let size := returndatasize

      let ptr := mload(0x40)
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }
}
