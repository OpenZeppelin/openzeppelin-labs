pragma solidity ^0.4.18;

import './TokenStorage.sol';
import './UpgradeabilityStorage.sol';

contract UpgradeableTokenStorage is UpgradeabilityStorage, TokenStorage {}
