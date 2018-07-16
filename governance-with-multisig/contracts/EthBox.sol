pragma solidity ^0.4.23;

contract EthBox {
  mapping(address => uint256) balances;

  function deposit() public payable {
    balances[msg.sender] += msg.value;
  }
}

contract EthBoxV2 is EthBox {
  function getBalance(address owner) public view returns (uint256) {
    return balances[owner];
  }
}
