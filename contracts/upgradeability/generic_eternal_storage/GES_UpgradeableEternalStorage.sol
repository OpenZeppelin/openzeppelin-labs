pragma solidity ^0.4.18;

import './GES_EternalStorage.sol';
import './GES_UpgradeabilityStorage.sol';

/**
 * @title GES_pgradeableEternalStorage
 * @dev This is the storage necessary to perform upgradeable contracts.
 * This means, required state variables for upgradeability purpose and those
 * strictly related to token contracts.
 */
contract GES_UpgradeableEternalStorage is GES_UpgradeabilityStorage, GES_EternalStorage {

  bool public initialized = false;

  function initialize() public {
    require(!initialized);
    initialized = true;
  }

}
