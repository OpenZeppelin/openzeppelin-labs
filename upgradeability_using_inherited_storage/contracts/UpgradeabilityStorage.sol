pragma solidity ^0.4.18;

import './IRegistry.sol';

contract UpgradeabilityStorage {
  IRegistry internal registry;
  address internal _implementation;
}
