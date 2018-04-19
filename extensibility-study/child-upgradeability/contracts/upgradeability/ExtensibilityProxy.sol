pragma solidity ^0.4.21;
import "./OwnedUpgradeabilityProxy.sol";

contract ExtensibilityProxy is OwnedUpgradeabilityProxy {
  bytes32 private constant facadeImplementationPosition = keccak256("org.zeppelinos.proxy.facadeImplementation");


  function facadeImplementation() public view returns (address impl) {
    bytes32 position = facadeImplementationPosition;
    assembly {
      impl := sload(position)
    }
  }

  function setFacadeImplementation(address newImplementation) internal {
    bytes32 position = facadeImplementationPosition;
    assembly {
      sstore(position, newImplementation)
    }
  }

  function upgradeFacadeTo(address implementation) public onlyProxyOwner {
    _upgradeFacadeTo(implementation);
  }

  function upgradeFacadeToAndCall(address implementation, bytes data) payable public onlyProxyOwner {
    upgradeFacadeTo(implementation);
    require(this.call.value(msg.value)(data));
  }

  function _upgradeFacadeTo(address newImplementation) internal {
    require(newImplementation != address(0));
    address currentImplementation = facadeImplementation();
    require(currentImplementation != newImplementation);
    setFacadeImplementation(newImplementation);
    emit Upgraded(newImplementation);
  }

  function () payable public {
    address _impl = facadeImplementation();
    require(_impl != address(0));

    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize)
      let result := delegatecall(gas, _impl, ptr, calldatasize, 0, 0)
      let size := returndatasize
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }


}
