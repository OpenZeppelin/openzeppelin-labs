pragma solidity ^0.4.18;

import './Token_V1.sol';

/**
 * @title Token_V2
 * @dev Version 2 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing burnable functionalities
 * in addition to what's provided in version 1
 */
contract Token_V2 is Token_V1 {
  event Burn(address indexed burner, uint256 value);

  function burn(uint256 value) public {
    require(balanceOf(msg.sender) >= value);
    bytes32 totalSupplyHash = keccak256("totalSupply");
    bytes32 balanceSenderHash = keccak256("balance", msg.sender);
    uintStorage[totalSupplyHash] = totalSupply().sub(value);
    uintStorage[balanceSenderHash] = balanceOf(msg.sender).sub(value);
    Burn(msg.sender, value);
  }
}
