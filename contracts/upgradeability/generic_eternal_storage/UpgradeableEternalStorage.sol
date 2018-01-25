pragma solidity ^0.4.18;

import './EternalStorage.sol';
import './UpgradeabilityStorage.sol';

/**
 * @title UpgradeableEternalStorage
 * @dev This is the storage necessary to perform upgradeable contracts.
 * This means, required state variables for upgradeability purpose and those
 * strictly related to token contracts.
 */
contract UpgradeableEternalStorage is UpgradeabilityStorage, EternalStorage {

  bool public initialized = false;

  function initialize() public {
    require(!initialized);
    initialized = true;
  }

}
