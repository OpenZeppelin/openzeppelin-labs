pragma solidity ^0.4.18;


import '../Registrar.sol';
import '@aragon/os/contracts/apps/AragonApp.sol';

// Imports for testing
import '@aragon/os/contracts/apm/Repo.sol';
import '@aragon/os/contracts/apm/APMRegistry.sol';
import '@aragon/os/contracts/kernel/Kernel.sol';
import '@aragon/os/contracts/lib/ens/ENS.sol';
import '@aragon/os/contracts/factory/DAOFactory.sol';
import '@aragon/os/contracts/factory/ENSFactory.sol';
import '@aragon/os/contracts/factory/APMRegistryFactory.sol';

contract AragonRegistrar is AragonApp, Registrar {
  // bytes32 constant public CREATE_NAME_ROLE = keccak256("CREATE_NAME_ROLE");
  // bytes32 constant public DELETE_NAME_ROLE = keccak256("DELETE_NAME_ROLE");
  // bytes32 constant public POINT_ROOTNODE_ROLE = keccak256("POINT_ROOTNODE_ROLE");
  bytes32 constant public CREATE_NAME_ROLE = 0xf86bc2abe0919ab91ef714b2bec7c148d94f61fdb069b91a6cfe9ecdee1799ba;
  bytes32 constant public DELETE_NAME_ROLE = 0x03d74c8724218ad4a99859bcb2d846d39999449fd18013dd8d69096627e68622;
  bytes32 constant public POINT_ROOTNODE_ROLE = 0x9ecd0e7bddb2e241c41b595a436c4ea4fd33c9fa0caa8056acf084fc3aa3bfbe;

  function ens() public view returns(AbstractENS) {
    return AbstractENS(registry);
  }

  function initialize(ERC137Registry _registry, bytes32 _rootNode) public onlyInit {
    initialized();
    Registrar.initialize(_registry, _rootNode);
  }

  function createName(bytes32 _label, address _owner) public auth(CREATE_NAME_ROLE) returns (bytes32) {
    super.createName(_label, _owner);
  }

  function createNameAndPoint(bytes32 _label, address _target) public auth(CREATE_NAME_ROLE) returns (bytes32) {
    super.createNameAndPoint(_label, _target);
  }

  function pointRootNode(address _target) public auth(POINT_ROOTNODE_ROLE) {
    super.pointRootNode(_target);
  }

  function deleteName(bytes32 _label) public auth(DELETE_NAME_ROLE)  {
    super.deleteName(_label);
  }
}
