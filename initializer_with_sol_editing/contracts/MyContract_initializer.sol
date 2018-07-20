pragma solidity ^0.4.24;

contract Base1 {
}

contract Base2 is Base1 {
}

contract Base3 is Base1 {
}

contract MyContract_initializer is Base2, Base3 {
  uint256 public value;

  /**
  * @dev This is the constructor
  */
  function initializer(uint256 _value) {
    value = _value;
  }

  function set(uint256 _value) {
    require (_value != 0);
    value = _value;
  }

  function version() public pure returns (string) {
    return "V1";
  }
}