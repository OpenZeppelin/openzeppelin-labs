pragma solidity ^0.4.18;

import './GES_EternalStorage.sol';
import './GES_UpgradeabilityStorage.sol';
import './GES_UpgradeabilityOwnerStorage.sol';

/**
 * @title GES_OwnedUpgradeabilityStorage
 * @dev This is the storage necessary to perform upgradeable contracts.
 * This means, required state variables for upgradeability purpose and eternal storage per se.
 */
contract GES_OwnedUpgradeabilityStorage is GES_UpgradeabilityOwnerStorage, GES_UpgradeabilityStorage, GES_EternalStorage {}
