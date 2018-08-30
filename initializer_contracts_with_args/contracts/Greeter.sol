pragma solidity ^0.4.21;

contract Greeter {

  string public greeting;
  uint256 public created;

  constructor(string _greeting) public {
    greeting = _greeting;
    created = block.number;
  }

}
