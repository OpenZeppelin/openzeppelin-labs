pragma solidity ^0.4.21;

import './Proxy.sol';
import './UpgradeabilityStorage.sol';

/**
 * @title UpgradeabilityProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeabilityProxy is Proxy, UpgradeabilityStorage {
  /**
  * @dev This event will be emitted every time the implementation gets upgraded
  * @param implementation representing the address of the upgraded implementation
  */
  event Upgraded(address indexed implementation);

  /**
  * @dev Upgrades the implementation address
  * @param _implementation representing the address of the new implementation to be set
  */
  function _upgradeTo(address _implementation) internal {
    address currentImplementation = implementation();
    require(currentImplementation != _implementation);
    setImplementation(_implementation);
    emit Upgraded(_implementation);
  }
}
