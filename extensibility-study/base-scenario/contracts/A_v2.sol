pragma solidity ^0.4.21;

import "./Initializable.sol";

contract A_v2 is Initializable {
  uint256 public x;
  
  function initialize(uint256 value) public payable isInitializer {
    x = value;
  }

  function setx(uint256 _x) public {
    x = 100*_x;
  }

  function getDoublex() public view returns(uint256) {
    return 2*x;
  }

}

