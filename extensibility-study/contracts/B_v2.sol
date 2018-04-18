pragma solidity ^0.4.21;
import "./A_v2.sol";

contract B_v2 is A_v2 {
  uint256 public y;
  
  function sety(uint256 _y) public {
    y = _y;
  }
  
  function sum() public view returns(uint256) {
    return x+y;
  }
}
