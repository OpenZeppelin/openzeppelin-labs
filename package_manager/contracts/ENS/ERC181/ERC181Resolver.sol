pragma solidity ^0.4.24;


/**
 * @title ERC181Resolver
 * @dev Resolver interface for reverse resolution of Ethereum addresses using ENS. This permits associating a
 * human-readable name with any Ethereum blockchain address.
 */
contract ERC181Resolver {
  /// The interface ID of this interface
  bytes4 public constant INTERFACE_ID = 0x691f3431;

  /**
   * Emitted when the name associated with an ENS node changes.
   */
  event NameChanged(bytes32 indexed node, string name);

  /**
   * @dev Resolvers that implement this interface must return a valid ENS name for the requested node, or the empty
   * string if no name is defined for the requested node.
   */
  function name(bytes32 node) public view returns (string);
}
