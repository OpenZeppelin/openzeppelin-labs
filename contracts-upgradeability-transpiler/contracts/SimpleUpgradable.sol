pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract SimpleUpgradable is Initializable {
  uint256 private count;
  uint256 private local;
  string private hello    ;
  bool public test ;
  uint constant const = 32**22 + 8;

  function initialize(uint256 num) public initializer {
local =564;
hello =     "hello";
test = true;
    count = num;
  }

  function getHello() public view returns(string memory) {
    return hello;
  }
}






















