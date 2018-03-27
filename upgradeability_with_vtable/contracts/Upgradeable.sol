pragma solidity ^0.4.18;

import './UpgradeabilityStorage.sol';

/**
 * @title Upgradeable
 * @dev This contract holds all the minimum required functionality for a behavior to be upgradeable.
 * This means, required state variables for owned upgradeability purpose and simple initialization validation.
 */
contract Upgradeable is UpgradeabilityStorage {
  /**
  * @dev Validates the caller is the versions registry.
  * THIS FUNCTION SHOULD BE OVERRIDDEN CALLING SUPER
  * @param sender representing the address deploying the initial behavior of the contract
  */
  function initialize(address sender) public payable {
    require(msg.sender == address(registry));
  }
}
