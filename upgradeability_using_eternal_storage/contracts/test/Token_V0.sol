pragma solidity ^0.4.18;

import '../EternalStorage.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Token_V0
 * @dev Version 0 of a token to show upgradeability.
 */
contract Token_V0 is EternalStorage {
  using SafeMath for uint256;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  function totalSupply() public view returns (uint256) {
    return uintStorage[keccak256("totalSupply")];
  }

  function balanceOf(address owner) public view returns (uint256) {
    return uintStorage[keccak256("balance", owner)];
  }

  function allowance(address owner, address spender) public view returns (uint256) {
    return uintStorage[keccak256("allowance", owner, spender)];
  }

  function transfer(address to, uint256 value) public {
    bytes32 balanceToHash = keccak256("balance", to);
    bytes32 balanceSenderHash = keccak256("balance", msg.sender);

    require(to != address(0));
    require(uintStorage[balanceSenderHash] >= value);

    uintStorage[balanceSenderHash] = balanceOf(msg.sender).sub(value);
    uintStorage[balanceToHash] = balanceOf(to).add(value);
    Transfer(msg.sender, to, value);
  }

  function transferFrom(address from, address to, uint256 value) public {
    bytes32 balanceToHash = keccak256("balance", to);
    bytes32 balanceFromHash = keccak256("balance", from);
    bytes32 allowanceFromToSenderHash = keccak256("allowance", from, msg.sender);

    require(to != address(0));
    require(uintStorage[balanceFromHash] >= value );
    require(uintStorage[allowanceFromToSenderHash] >= value);

    uintStorage[balanceFromHash] = balanceOf(from).sub(value);
    uintStorage[balanceToHash] = balanceOf(to).add(value);
    uintStorage[allowanceFromToSenderHash] = allowance(from, msg.sender).sub(value);
    Transfer(from, to, value);
  }

  function approve(address spender, uint256 value) public {
    bytes32 allowanceSenderToSpenderHash = keccak256("allowance", msg.sender, spender);
    uintStorage[allowanceSenderToSpenderHash] = value;
    Approval(msg.sender, spender, value);
  }

  function increaseApproval(address spender, uint256 addedValue) public {
    bytes32 allowanceSenderToSpenderHash = keccak256("allowance", msg.sender, spender);
    uintStorage[allowanceSenderToSpenderHash] = allowance(msg.sender, spender).add(addedValue);
    Approval(msg.sender, spender, allowance(msg.sender, spender));
  }

  function decreaseApproval(address spender, uint256 subtractedValue) public {
    uint256 oldValue = allowance(msg.sender, spender);
    bytes32 allowanceSenderToSpenderHash = keccak256("allowance", msg.sender, spender);
    if (subtractedValue > oldValue) {
      uintStorage[allowanceSenderToSpenderHash] = 0;
    } else {
      uintStorage[allowanceSenderToSpenderHash] = oldValue.sub(subtractedValue);
    }
    Approval(msg.sender, spender, allowance(msg.sender, spender));
  }

  function mint(address to, uint256 value) public {
    bytes32 balanceToHash = keccak256("balance", to);
    bytes32 totalSupplyHash = keccak256("totalSupply");

    uintStorage[balanceToHash] = balanceOf(to).add(value);
    uintStorage[totalSupplyHash] = totalSupply().add(value);
    Transfer(0x0, to, value);
  }
}
