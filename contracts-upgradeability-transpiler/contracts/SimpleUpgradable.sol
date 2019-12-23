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


contract SimpleInheritanceAUpgradable is Initializable {
  uint256 private foo = 42;
  function initialize() public initializer {
foo = 42;

  }
}

contract SimpleInheritanceBUpgradable  is Initializable, SimpleInheritanceAUpgradable {
  bool private bar = false;
  function initialize() public initializer {
SimpleInheritanceAUpgradable.initialize();
bar = false;

  }
}

contract SimpleInheritanceCUpgradable is Initializable, SimpleInheritanceBUpgradable {
function initialize() public initializer {
          
SimpleInheritanceBUpgradable.initialize();
          
        }
  bool private foo;

}


contract DiamondAUpgradable is Initializable {
  uint256 private foo = 42;
  function initialize() public initializer {
foo = 42;

  }
}

contract DiamondBUpgradable is Initializable, DiamondAUpgradable {
function initialize() public initializer {
          
DiamondAUpgradable.initialize();
          
        }

}

contract DiamondCUpgradable is Initializable, DiamondAUpgradable {
function initialize() public initializer {
          
DiamondAUpgradable.initialize();
          
        }

}

contract DiamondDUpgradable is Initializable, DiamondBUpgradable, DiamondCUpgradable {
function initialize() public initializer {
          
DiamondBUpgradable.initialize();
DiamondCUpgradable.initialize();
          
        }

}


contract InheritanceWithParamsParentUpgradable is Initializable {
  function initialize(bool foo, uint256 bar) public initializer {

  }
}

contract InheritanceWithParamsConstructorChildUpgradable is Initializable, InheritanceWithParamsParentUpgradable {
  function initialize()  public initializer {
InheritanceWithParamsParentUpgradable.initialize(true,564);

  }
}

contract InheritanceWithParamsClassChildUpgradable is Initializable, InheritanceWithParamsParentUpgradable {
  function initialize() public initializer {
InheritanceWithParamsParentUpgradable.initialize(false,87);

  }
}