pragma solidity ^0.4.24;


contract DummyImplementation {
  uint256 public value;

  function initialize(uint256 _value) public {
    value = _value;
  }
}
