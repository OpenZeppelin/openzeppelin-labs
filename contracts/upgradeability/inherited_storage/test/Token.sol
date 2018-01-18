pragma solidity ^0.4.18;

import '../Upgradeable.sol';

contract TokenV1_0 is Upgradeable {
  mapping (address => uint) balances;

  event Transfer(address indexed from, address indexed to, uint256 _value);

  function initialize(address sender) public payable {
    super.initialize(sender);
    mint(sender, 10000);
  }

  function balanceOf(address addr) public view returns (uint) {
    return balances[addr];
  }

  function transfer(address to, uint256 value) public {
    require(balances[msg.sender] >= value);
    balances[msg.sender] -= value;
    balances[to] += value;
    Transfer(msg.sender, to, value);
  }

  function mint(address to, uint256 value) public {
    balances[to] += value;
    Transfer(0x0, to, value);
  }

}

contract TokenV1_1 is TokenV1_0 {
  mapping (address => mapping (address => uint)) allowances;

  function transferFrom(address from, address to, uint256 value) public {
    require(allowances[from][msg.sender] >= value);
    allowances[from][msg.sender] -= value;
    balances[from] -= value;
    balances[to] += value;
    Transfer(from, to, value);
  }

  function approve(address spender, uint256 value) public {
    allowances[msg.sender][spender] = value;
  }
}
