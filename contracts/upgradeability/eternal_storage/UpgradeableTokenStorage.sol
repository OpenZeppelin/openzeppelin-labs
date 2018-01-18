pragma solidity ^0.4.18;

import './TokenStorage.sol';
import './UpgradeabilityStorage.sol';

/**
 * @title UpgradeableTokenStorage
 * @dev This is the storage necessary to perform upgradeable token contracts
 * This means, required state variables for upgradeability purpose and those strictly related to token contracts
 */
contract UpgradeableTokenStorage is UpgradeabilityStorage, TokenStorage {}
