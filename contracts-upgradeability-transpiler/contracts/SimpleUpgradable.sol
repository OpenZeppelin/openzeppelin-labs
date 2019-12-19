pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract SimpleUpgradable is Initializable {
  uint256 private count;
  uint256 private local;
  string private hello    ;
  bool public test ;
  uint constant const = 32**22 + 8;

  function initialize(uint256 num) initializer public {
local =564;
hello =     "hello";
test = true;
    count = num;
  }

  function getHello() public view returns(string memory) {
    return hello;
  }
}


contract SimpleInheritanceAUpgradable is Initializable {
  uint256 private foo ;
  function initialize() initializer public {
foo = 42;

  }
}

contract SimpleInheritanceB  is SimpleInheritanceA {

}

contract SimpleInheritanceC is SimpleInheritanceB {

}


contract DiamondA {
  uint256 private foo = 42;
  constructor() public {

  }
}

contract DiamondB is DiamondA {

}

contract DiamondC is DiamondA {

}

contract DiamondD is DiamondB, DiamondC {

}