pragma solidity ^0.4.18;

import "./KernelInstance.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract KernelRegistry is Ownable {
  event NewInstance(KernelInstance indexed instance);

  mapping(bytes32 => address) private instances;

  function KernelRegistry() public {}

  function getInstance(string name, string version) public view returns(KernelInstance) {
    bytes32 hash = keccak256(name, version);
    return KernelInstance(instances[hash]);
  }

  function addInstance(KernelInstance _instance) onlyOwner public {
    bytes32 hash = _instance.getHash();
    require(instances[hash] == address(0));

    instances[hash] = _instance;
    NewInstance(_instance);
  }
}
