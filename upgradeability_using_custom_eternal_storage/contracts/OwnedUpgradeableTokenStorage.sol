pragma solidity ^0.4.18;

import './TokenStorage.sol';
import './UpgradeabilityStorage.sol';
import './UpgradeabilityOwnerStorage.sol';

/**
 * @title OwnedUpgradeableTokenStorage
 * @dev This is the storage necessary to perform upgradeable contracts.
 * This means, required state variables for owned upgradeability purpose and those strictly related to token contracts.
 */
contract OwnedUpgradeableTokenStorage is UpgradeabilityStorage, UpgradeabilityOwnerStorage, TokenStorage {}
