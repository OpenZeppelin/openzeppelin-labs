pragma solidity ^0.4.18;

import './GES_Token_V0.sol';

/**
 * @title GES_Token_V1
 * @dev Version 1 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing a burn function as opposed to version 0
 */
contract GES_Token_V1 is GES_Token_V0 {

  function burn(uint256 value) public {
    bytes32 balanceSenderHash = keccak256("balance", msg.sender);
    bytes32 totalSupplyHash = keccak256("totalSupply");
    require(value <= uintStorage[balanceSenderHash]);
    uintStorage[balanceSenderHash] = uintStorage[balanceSenderHash].sub(value);
    uintStorage[totalSupplyHash] = uintStorage[totalSupplyHash].sub(value);
    Transfer(msg.sender, 0x0, value);
  }

}
