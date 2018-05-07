pragma solidity ^0.4.23;

contract Initializable {
  mapping (uint256 => bool) private initialized;

  modifier initializer() {
    uint256 _pc; 
    assembly { _pc := pc }

    require(!initialized[_pc]);

    _;

    initialized[_pc] = true;
  }
}
