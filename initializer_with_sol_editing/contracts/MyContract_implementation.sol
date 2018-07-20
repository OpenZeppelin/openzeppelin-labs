pragma solidity ^0.4.24;

contract Base1 {
}

contract Base2 is Base1 {
}

contract Base3 is Base1 {
}

contract MyContract_implementation is Base2, Base3 {
  uint256 public value;

  /**
  * @dev This is the constructor
  */
  

  function set(uint256 _value) {
    require (_value != 0);
    value = _value;
  }

  function version() public pure returns (string) {
    return "V1";
  }
}