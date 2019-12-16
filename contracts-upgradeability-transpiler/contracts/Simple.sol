pragma solidity ^0.5.0;

contract Simple {
  uint256 private count;
  uint256 private local = 564;

  constructor(uint256 num) public {
    count = num;
  }
}