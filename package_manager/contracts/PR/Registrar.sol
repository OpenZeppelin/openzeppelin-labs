pragma solidity ^0.4.24;

import '../ENS/ENSResolver.sol';
import '../ENS/ERC137/ERC137Resolver.sol';
import '../ENS/ERC137/ERC137Registry.sol';

/**
 * @title Registrar
 * @dev Registrars are responsible for allocating domain names to users of the system, and are the only entities
 * capable of updating the ENS; the owner of a node in the ENS registry is its registrar. Registrars may be contracts
 * or publicly owned accounts, though it is expected that the root and top-level registrars, at a minimum, will be
 * implemented as contracts.
 *
 * This implementation was derived from Aragon's ENS registrar implementation
 * see https://github.com/aragon/aragonOS/blob/dev/contracts/ens/ENSSubdomainRegistrar.sol
 */
contract Registrar {
  bytes32 constant public ENS_ROOT = bytes32(0);
  bytes32 constant public ETH_TLD_LABEL = keccak256("eth");
  bytes32 constant public ETH_TLD_NODE = keccak256(abi.encodePacked(ENS_ROOT, ETH_TLD_LABEL));
  bytes32 constant public PUBLIC_RESOLVER_LABEL = keccak256("resolver");
  bytes32 constant public PUBLIC_RESOLVER_NODE = keccak256(abi.encodePacked(ETH_TLD_NODE, PUBLIC_RESOLVER_LABEL));

  bytes32 public rootNode;
  ERC137Registry public registry;

  event NewName(bytes32 indexed node, bytes32 indexed label);
  event DeleteName(bytes32 indexed node, bytes32 indexed label);

  function initialize(ERC137Registry _registry, bytes32 _rootNode) public {
    require(_registry.owner(_rootNode) == address(this));
    registry = _registry;
    rootNode = _rootNode;
  }

  function createName(bytes32 _label, address _owner) public returns (bytes32) {
    bytes32 node = getNodeID(_label);
    require(registry.owner(node) == address(0)); //avoid name reset

    registry.setSubnodeOwner(rootNode, _label, _owner);
    emit NewName(node, _label);
    return node;
  }

  function createNameAndPoint(bytes32 _label, address _target) public returns (bytes32) {
    bytes32 node = createName(_label, this);
    _pointToResolverAndResolve(node, _target);
    // TODO: shouldn't it transfer the control of the node to an owner?
    return node;
  }

  function pointRootNode(address _target) public {
    _pointToResolverAndResolve(rootNode, _target);
  }

  function deleteName(bytes32 _label) public {
    bytes32 node = getNodeID(_label);
    address currentOwner = registry.owner(node);
    require(currentOwner != address(0)); // fail if deleting unset name

    registry.setSubnodeOwner(rootNode, _label, this);
    registry.setTTL(node, uint64(0));
    registry.setResolver(node, address(0));
    registry.setOwner(node, address(0));
    emit DeleteName(node, _label);
  }

  function _pointToResolverAndResolve(bytes32 _node, address _target) internal {
    address resolver = getAddr(PUBLIC_RESOLVER_NODE);
    registry.setResolver(_node, resolver);
    ENSResolver(resolver).setAddr(_node, _target);
  }

  function getAddr(bytes32 node) internal view returns (address) {
    ERC137Resolver nodeResolver = ERC137Resolver(registry.resolver(node));
    return nodeResolver.addr(node);
  }

  function getNodeID(bytes32 _label) internal view returns (bytes32) {
    return keccak256(abi.encodePacked(rootNode, _label));
  }
}
