pragma solidity ^0.4.21;

contract Greeter {

  string public greeting;
  uint256 public created;

  constructor() public {
    greeting = "Hello world!";
    created = block.number;
  }

}
