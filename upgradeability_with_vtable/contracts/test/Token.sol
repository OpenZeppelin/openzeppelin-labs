pragma solidity ^0.4.18;

import '../Upgradeable.sol';

// **************************************
// ****    V0 of a token behavior    ****
// **************************************

contract TokenV0_Events {
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract TokenV0_Storage is Upgradeable, TokenV0_Events {
  mapping (address => uint) balances;
}

contract TokenV0_Interface is TokenV0_Events {
  function initialize(address sender) public payable;
  function balanceOf(address addr) public view returns (uint);
  function transfer(address to, uint256 value) public;
  function mint(address to, uint256 value) public;
}

contract TokenV0_Init is TokenV0_Storage {
  function initialize(address sender) public payable {
    super.initialize(sender);
    (TokenV0_Interface(this)).mint(sender, 10000);
  }
}

contract TokenV0_Balance is TokenV0_Storage {
  function balanceOf(address addr) public view returns (uint) {
    return balances[addr];
  }
}

contract TokenV0_Transfer is TokenV0_Storage {
  function transfer(address to, uint256 value) public {
    require(balances[msg.sender] >= value);
    balances[msg.sender] -= value;
    balances[to] += value;
  }
}

contract TokenV0_Mint is TokenV0_Storage {
  function mint(address to, uint256 value) public {
    balances[to] += value;
  }
}


// **************************************
// ****    V1 of a token behavior    ****
// **************************************
// We are adding a Transfer event emission to the transfer and mint functions, plus a burn function
// We also rename transfer to safeTransfer (event though it is not)

contract TokenV1_Interface is TokenV0_Interface {
  function burn(address from, uint256 value) public;
  function safeTransfer(address to, uint256 value) public;
}

contract TokenV1_Transfer is TokenV0_Storage {
  function safeTransfer(address to, uint256 value) public {
    require(balances[msg.sender] >= value);
    balances[msg.sender] -= value;
    balances[to] += value;
    Transfer(msg.sender, to, value);
  }
}

contract TokenV1_Mint is TokenV0_Storage {
  function mint(address to, uint256 value) public {
    balances[to] += value;
    Transfer(0x0, to, value);
  }
}

contract TokenV1_Burn is TokenV0_Storage {
  function burn(address from, uint256 value) public {
    require(balances[from] >= value);
    balances[from] -= value;
    Transfer(from, 0x0, value);
  }
}


// **************************************
// ****    V2 of a token behavior    ****
// **************************************
// We are adding a fallback function

contract TokenV2_Fallback is TokenV0_Storage {
  function() payable public {
    (TokenV1_Interface(this)).mint(msg.sender, msg.value);
  }
}
