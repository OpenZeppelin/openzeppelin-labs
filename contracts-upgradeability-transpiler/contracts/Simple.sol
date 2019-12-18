pragma solidity ^0.5.0;

contract Simple {
  uint256 private count;
  uint256 private local=564;
  string private hello    =     "hello";
  bool public test = true;
  uint constant const = 32**22 + 8;

  constructor(uint256 num) public {
    count = num;
  }

  function getHello() public view returns(string memory) {
    return hello;
  }
}


contract A {

}