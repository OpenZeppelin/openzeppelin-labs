pragma solidity ^0.4.24;


import '../ERC165/ERC165.sol';

/**
 * @title ERC137Resolver
 * @dev Resolvers are responsible for performing resource lookups for a name - for instance, returning a contract
 * address, a content hash, or IP address(es) as appropriate. The resolver specification, defined here and extended in
 * other EIPs, defines what methods a resolver may implement to support resolving different types of records.
 */
contract ERC137Resolver is ERC165 {
  /// The interface ID of this interface
  bytes4 public constant INTERFACE_ID = 0x3b3b57de;

  /**
   * Emitted when the address associated with an ENS node changes.
   */
  event AddrChanged(bytes32 indexed node, address a);

  /**
  * @dev Returns the address associated with an ENS node.
  */
  function addr(bytes32 node) public view returns (address);
}
