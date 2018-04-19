pragma solidity ^0.4.21;
import "./A.sol";

contract B_v2 is A {
  uint256 public y;
  
  function sety(uint256 _y) public {
    y = _y;
  }
  
  function sum() public view returns(uint256) {
    return x+y;
  }

  function mult() public view returns(uint256) {
    return x*y;
  }
}
