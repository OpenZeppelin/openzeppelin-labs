pragma solidity ^0.4.24;


import './ERC137/ERC137Registry.sol';

/**
 * @title Registry
 * @dev This contract provides an implementation of the ENS Registry standard EIP-137
 * This implementation was derived from Aragon's ENS registry implementation
 * see https://github.com/aragon/aragonOS/blob/dev/contracts/lib/ens/ENS.sol
 */
contract Registry is ERC137Registry {
  bytes32 constant public ENS_ROOT = bytes32(0);

  /**
   * @dev ENS registry record compound of an owner, a resolver and a TTL.
   */
  struct Record {
    address owner;
    address resolver;
    uint64 ttl;
  }

  /**
   * @dev Mapping associating names to ENS records.
   */
  mapping (bytes32 => Record) public records;

  /**
   * @dev Permits modifications only by the owner of the specified node.
   */
  modifier onlyOwner(bytes32 _node) {
    require(records[_node].owner == msg.sender);
    _;
  }

  /**
   * @dev Constructs a new ENS registry.
   */
  constructor() public {
    Record storage root = records[ENS_ROOT];
    root.owner = msg.sender;
  }

  /**
   * @dev Returns the address that owns the specified node.
   */
  function owner(bytes32 _node) public view returns (address) {
    return records[_node].owner;
  }

  /**
   * @dev Returns the address of the resolver for the specified node.
   */
  function resolver(bytes32 _node) public view returns (address) {
    return records[_node].resolver;
  }

  /**
   * @dev Returns the TTL of a node, and any records associated with it.
   */
  function ttl(bytes32 _node) public view returns (uint64) {
    return records[_node].ttl;
  }

  /**
   * @dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.
   * @param _node The node to transfer ownership of.
   * @param _owner The address of the new owner.
   */
  function setOwner(bytes32 _node, address _owner) onlyOwner(_node) public {
    records[_node].owner = _owner;
    emit Transfer(_node, _owner);
  }

  /**
   * @dev Transfers ownership of a subnode to a new address. May only be called by the owner of the parent node.
   * @param _node The parent node.
   * @param _label The hash of the label specifying the subnode.
   * @param _owner The address of the new owner.
   */
  function setSubnodeOwner(bytes32 _node, bytes32 _label, address _owner) onlyOwner(_node) public {
    bytes32 subnode = keccak256(abi.encodePacked(_node, _label));
    records[subnode].owner = _owner;
    emit NewOwner(_node, _label, _owner);
  }

  /**
   * @dev Sets the resolver address for the specified node.
   * @param _node The node to update.
   * @param _resolver The address of the resolver.
   */
  function setResolver(bytes32 _node, address _resolver) onlyOwner(_node) public {
    records[_node].resolver = _resolver;
    emit NewResolver(_node, _resolver);
  }

  /**
   * @dev Sets the TTL for the specified node.
   * @param _node The node to update.
   * @param _ttl The TTL in seconds.
   */
  function setTTL(bytes32 _node, uint64 _ttl) onlyOwner(_node) public {
    records[_node].ttl = _ttl;
    emit NewTTL(_node, _ttl);
  }
}
