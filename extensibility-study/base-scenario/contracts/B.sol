pragma solidity ^0.4.21;
import "./A.sol";

contract B is A {
  uint256 public y;
  
  function sety(uint256 _y) public {
    y = _y;
  }
  
  function sum() public view returns(uint256) {
    return x+y;
  }
}
