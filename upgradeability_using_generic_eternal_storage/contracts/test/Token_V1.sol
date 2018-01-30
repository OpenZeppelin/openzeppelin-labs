pragma solidity ^0.4.18;

import './Token_V0.sol';
import './Ownable.sol';

/**
 * @title Token_V1
 * @dev Version 1 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing mintable token functionalities
 * in addition to what's provided in version 0
 */
contract Token_V1 is Token_V0, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  modifier canMint() {
    require(!mintingFinished());
    _;
  }

  function initialize(address owner) public {
    require(!initialized());
    setOwner(owner);
    boolStorage[keccak256('token_v1_initialized')] = true;
  }

  function initialized() public view returns (bool) {
    return boolStorage[keccak256('token_v1_initialized')];
  }

  function mintingFinished() public view returns (bool) {
    return boolStorage[keccak256('mintingFinished')];
  }

  function mint(address to, uint256 value) public onlyOwner canMint {
    super.mint(to, value);
    Mint(to, value);
  }

  function finishMinting() public onlyOwner canMint {
    boolStorage[keccak256('mintingFinished')] = true;
    MintFinished();
  }
}
