pragma solidity ^0.4.24;


/**
 * @title ContentResolver
 * @dev Resolver interface for reverse resolution of bytes content using ENS.
 * WARN: Note that this resource type is not standardized, and will likely change in future to a resource type based on multihash.
 */
contract ContentResolver {
  /// The interface ID of this interface
  bytes4 public constant INTERFACE_ID = 0xd8389dc5;

  /**
   * Emitted when the content associated with an ENS node changes.
   */
  event ContentChanged(bytes32 indexed node, bytes32 hash);

  /**
   * @dev Returns the content hash associated with an ENS node.
   * @param _node The ENS node to query.
   * @return The associated content hash.
   */
  function content(bytes32 _node) public view returns (bytes32);
}
