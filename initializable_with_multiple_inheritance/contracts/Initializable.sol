pragma solidity ^0.4.23;

contract Initializable {
  bool initialized = false;

  modifier initializer() {
    require(!initialized);
    _;
    initialized = true;
  }
}