pragma solidity ^0.5.0;

contract Simple {
  uint256 private count;
  uint256 private local=564;
  string private hello    =     "hello";
  bool public test = true;
  uint constant const = 32**22 + 8;

  constructor(uint256 num) public {
    count = num;
  }

  function getHello() public view returns(string memory) {
    return hello;
  }
}


contract SimpleInheritanceA {
  uint256 private foo = 42;
  constructor() public {

  }
}

contract SimpleInheritanceB  is SimpleInheritanceA {
  bool private bar = false;
  constructor() public {

  }
}

contract SimpleInheritanceC is SimpleInheritanceB {
  bool private foo;

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