pragma solidity ^0.4.18;

import './GES_Token_V0.sol';
import './GES_OwnedToken.sol';

/**
 * @title GES_Token_V1
 * @dev Version 1 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing a burn and onlyOwner mint functions as opposed to version 0
 */
contract GES_Token_V1 is GES_Token_V0, GES_OwnedToken {

  function initialize(address owner) public {
    setTokenOwner(owner);
  }

  function mint(address to, uint256 value) public onlyTokenOwner {
    super.mint(to, value);
  }

  function burn(uint256 value) public {
    bytes32 balanceSenderHash = keccak256("balance", msg.sender);
    bytes32 totalSupplyHash = keccak256("totalSupply");
    require(value <= uintStorage[balanceSenderHash]);
    uintStorage[balanceSenderHash] = uintStorage[balanceSenderHash].sub(value);
    uintStorage[totalSupplyHash] = uintStorage[totalSupplyHash].sub(value);
    Transfer(msg.sender, 0x0, value);
  }

}
