pragma solidity 0.4.24;


import '../Registrar.sol';
import 'openzeppelin-zos/contracts/ownership/Ownable.sol';

contract ZeppelinRegistrar is Ownable, Registrar {

  function initialize(ERC137Registry _registry, bytes32 _rootNode) public {
    Ownable.initialize(msg.sender);
    Registrar.initialize(_registry, _rootNode);
  }

  function createName(bytes32 _label, address _owner) public onlyOwner returns (bytes32) {
    super.createName(_label, _owner);
  }

  function createNameAndPoint(bytes32 _label, address _target) public onlyOwner returns (bytes32) {
    super.createNameAndPoint(_label, _target);
  }

  function pointRootNode(address _target) public onlyOwner {
    super.pointRootNode(_target);
  }

  function deleteName(bytes32 _label) public onlyOwner {
    super.deleteName(_label);
  }
}
