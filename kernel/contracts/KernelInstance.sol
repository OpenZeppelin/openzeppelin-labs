pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract KernelInstance is Ownable {
  string public name;
  string public version;
  address public developer;
  KernelInstance public parent;

  // TODO: we should add a frozen state to ensure an instance is not modifiable after certain point

  // Mapping from a contract name to its implementation address
  mapping(string => address) private implementations;

  function KernelInstance(string _name, string _version, KernelInstance _parent) public {
    name = _name;
    version = _version;
    parent = _parent;
    developer = msg.sender;
  }

  function getHash() public view returns(bytes32) {
    return keccak256(name, version);
  }

  function addImplementation(string contractName, address implementation) onlyOwner public {
    require(implementation != address(0));
    require(implementations[contractName] == address(0));
    implementations[contractName] = implementation;
  }

  function getImplementation(string contractName) public returns(address) {
    address implementation = implementations[contractName];
    if(implementation != address(0)) return implementation;
    require(parent != address(0));
    return parent.getImplementation(contractName);
  }
}
