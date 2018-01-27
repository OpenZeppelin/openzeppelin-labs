pragma solidity ^0.4.18;

import './EternalStorage.sol';
import './UpgradeabilityStorage.sol';
import './UpgradeabilityOwnerStorage.sol';

/**
 * @title OwnedUpgradeabilityStorage
 * @dev This is the storage necessary to perform upgradeable contracts.
 * This means, required state variables for upgradeability purpose and eternal storage per se.
 */
contract OwnedUpgradeabilityStorage is UpgradeabilityOwnerStorage, UpgradeabilityStorage, EternalStorage {}
