pragma solidity ^0.4.21;
import "./AStor.sol";
import "./OwnedUpgradeabilityProxy.sol";

contract BFacade is AStor, OwnedUpgradeabilityProxy {
  uint256 public y;
  
  function sety(uint256 _y) public {
    y = _y;
  }
  
  function sum() public view returns(uint256) {
    return x+y;
  }
}
