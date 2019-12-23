pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract SimpleUpgradable is Initializable {
  uint256 private count;
  uint256 private local=564;
  string private hello    =     "hello";
  bool public test = true;
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






contract SimpleInheritanceCUpgradable is Initializable, SimpleInheritanceBUpgradable {
function initialize() public initializer {  }
  bool private foo;

}








contract DiamondDUpgradable is Initializable, DiamondBUpgradable, DiamondCUpgradable {
function initialize() public initializer {  }

}