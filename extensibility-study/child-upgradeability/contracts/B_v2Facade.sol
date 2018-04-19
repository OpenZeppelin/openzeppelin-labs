pragma solidity ^0.4.21;
import "./AStor.sol";
import "./upgradeability/OwnedUpgradeabilityProxy.sol";

contract B_v2Facade is AStor, OwnedUpgradeabilityProxy {
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
