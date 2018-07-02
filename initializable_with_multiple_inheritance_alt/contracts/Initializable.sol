pragma solidity ^0.4.23;

contract Initializable {
  bool initialized = false;
  bool initializing = false;

  modifier initializer() {
    require(initializing || !initialized);

    bool wasInitializing = initializing;
    initializing = true;

    _;

    initialized = true;
    initializing = wasInitializing;
  }
}
