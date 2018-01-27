pragma solidity ^0.4.18;

import '../OwnedUpgradeabilityStorage.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Token_V0
 * @dev Version 0 of a token to show upgradeability.
 */
contract Token_V0 is OwnedUpgradeabilityStorage {
  using SafeMath for uint256;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  function totalSupply() public view returns (uint256) {
    return uintStorage[keccak256("totalSupply")];
  }

  function balanceOf(address owner) public view returns (uint256) {
    return uintStorage[keccak256("balance", owner)];
  }

  function mint(address to, uint256 value) public {
    bytes32 balanceToHash = keccak256("balance", to);
    bytes32 totalSupplyHash = keccak256("totalSupply");

    uintStorage[balanceToHash] = uintStorage[balanceToHash].add(value);
    uintStorage[totalSupplyHash] = uintStorage[totalSupplyHash].add(value);
    Transfer(0x0, to, value);
  }

  function transfer(address to, uint256 value) public {
    bytes32 balanceToHash = keccak256("balance", to);
    bytes32 balanceSenderHash = keccak256("balance", msg.sender);

    require(uintStorage[balanceSenderHash] >= value);
    uintStorage[balanceSenderHash] = uintStorage[balanceSenderHash].sub(value);
    uintStorage[balanceToHash] = uintStorage[balanceToHash].add(value);
    Transfer(msg.sender, to, value);
  }

  function transferFrom(address from, address to, uint256 value) public {
    bytes32 allowanceFromToSenderHash = keccak256("allowance", from, msg.sender);
    bytes32 balanceToHash = keccak256("balance", to);
    bytes32 balanceFromHash = keccak256("balance", from);

    require(uintStorage[allowanceFromToSenderHash] >= value);
    uintStorage[allowanceFromToSenderHash] = uintStorage[allowanceFromToSenderHash].sub(value);
    uintStorage[balanceFromHash] = uintStorage[balanceFromHash].sub(value);
    uintStorage[balanceToHash] = uintStorage[balanceToHash].add(value);
    Transfer(from, to, value);
  }

  function approve(address spender, uint256 value) public {
    bytes32 allowanceSenderToSpenderHash = keccak256("allowance", msg.sender, spender);

    uintStorage[allowanceSenderToSpenderHash] = value;
    Approval(msg.sender, spender, value);
  }

}
