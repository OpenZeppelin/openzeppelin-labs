pragma solidity ^0.4.24;


/**
 * @title ERC137Registry
 * @dev The registry is a single contract that provides a mapping from any registered name to the resolver responsible
 * for it, and permits the owner of a name to set the resolver address, and to create subdomains, potentially with
 * different owners to the parent domain.
 */
contract ERC137Registry {

  /**
   * @dev Emitted when the owner of a node assigns a new owner to a subnode.
   */
  event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);

  /**
   * @dev Emitted when the owner of a node transfers ownership to a new account.
   */
  event Transfer(bytes32 indexed node, address owner);

  /**
   * @dev Emitted when the resolver for a node changes.
   */
  event NewResolver(bytes32 indexed node, address resolver);

  /**
   * @dev Emitted when the TTL of a node changes.
   */
  event NewTTL(bytes32 indexed node, uint64 ttl);

  /**
   * @dev Returns the owner (registrar) of the specified node.
   */
  function owner(bytes32 _node) public view returns (address);

  /**
   * @dev Returns the resolver for the specified node.
   */
  function resolver(bytes32 _node) public view returns (address);

  /**
   * @dev Returns the time-to-live of the node: the maximum duration for which a node's information may be cached.
   */
  function ttl(bytes32 _node) public view returns (uint64);

  /**
   * @dev Transfers ownership of a node to another registrar. This function may only be called by the current owner of
   * node. A successful call to this function emits a Transfer event.
   */
  function setOwner(bytes32 _node, address _owner) public;

  /**
   * @dev Creates a new node, sha3(node, label) and sets its owner to owner, or updates the node with a new owner if it
   * already exists. This function may only be called by the current owner of node. A successful call to this function
   * emits a NewOwner event.
   */
  function setSubnodeOwner(bytes32 _node, bytes32 label, address _owner) public;

  /**
   * @dev Sets the resolver address for node. This function may only be called by the owner of node. A successful call
   * to this function emits a NewResolver event.
   */
  function setResolver(bytes32 _node, address _resolver) public;

  /**
   * @dev Sets the TTL for a node. A node's TTL applies to the 'owner' and 'resolver' records in the registry, as well
   * as to any information returned by the associated resolver.
   */
  function setTTL(bytes32 _node, uint64 _ttl) public;
}
