pragma solidity ^0.4.18;

import './UpgradeabilityStorage.sol';

contract Upgradeable is UpgradeabilityStorage {
  function initialize(address sender) public payable {
    require(msg.sender == address(registry));
  }
}
