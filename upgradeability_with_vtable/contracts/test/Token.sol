pragma solidity ^0.4.18;

import '../Upgradeable.sol';

contract TokenV1_Events {
  event Transfer(address indexed from, address indexed to, uint256 _value);
}

contract TokenV1_Storage is Upgradeable, TokenV1_Events {
  mapping (address => uint) balances;
}

contract TokenV1_Interface is TokenV1_Events {
  function initialize(address sender) public payable;
  function balanceOf(address addr) public view returns (uint);
  function transfer(address to, uint256 value) public;
  function mint(address to, uint256 value) public;
}

contract TokenV1_Init is TokenV1_Storage {
  function initialize(address sender) public payable {
    super.initialize(sender);
    (TokenV1_Interface(this)).mint(sender, 10000);
  }
}

contract TokenV1_Balance is TokenV1_Storage {
  function balanceOf(address addr) public view returns (uint) {
    return balances[addr];
  }
}

contract TokenV1_Transfer is TokenV1_Storage {
  function transfer(address to, uint256 value) public {
    require(balances[msg.sender] >= value);
    balances[msg.sender] -= value;
    balances[to] += value;
    Transfer(msg.sender, to, value);
  }
}

contract TokenV1_Mint is TokenV1_Storage {
  function mint(address to, uint256 value) public {
    balances[to] += value;
  }
}

contract TokenV1_1_Mint is TokenV1_Storage {
  function mint(address to, uint256 value) public {
    balances[to] += value;
    Transfer(0x0, to, value);
  }
}
