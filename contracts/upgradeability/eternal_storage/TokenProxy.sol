pragma solidity ^0.4.18;

import './TokenStorage.sol';
import './UpgradeabilityProxy.sol';

contract TokenProxy is UpgradeabilityProxy, TokenStorage {}
