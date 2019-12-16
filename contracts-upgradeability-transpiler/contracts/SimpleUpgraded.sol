pragma solidity ^0.5.0;

contract SimpleUpgradable {
  uint256 private count;
  uint256 private local = 564;

  function initialize(uint256 num) public {
    count = num;
  }
}