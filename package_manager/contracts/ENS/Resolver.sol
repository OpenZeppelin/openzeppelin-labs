pragma solidity ^0.4.24;

import './ERC137/ERC137Registry.sol';
import './ERC137/ERC137Resolver.sol';
import './ERC181/ERC181Resolver.sol';

/**
 * @title Resolver
 * @dev This contract provides an implementation of the ENS Resolver standard ERC137 & ERC181
 * This implementation was derived from Aragon's ENS resolver implementation, but only considering ERC137 and ERC181
 * see https://github.com/aragon/aragonOS/blob/dev/contracts/lib/ens/PublicResolver.sol
 */
contract Resolver is ERC137Resolver, ERC181Resolver {

  /*
   * @dev ENS resolver record compound of an address and a name.
   */
  struct Record {
    address addr;
    string name;
  }

  /**
   * @dev ENS registry
   */
  ERC137Registry public registry;

  /**
   * @dev Mapping associating names to ENS records.
   */
  mapping (bytes32 => Record) public records;

  /**
   * @dev Permits modifications only by the owner of the specified node.
   */
  modifier onlyOwner(bytes32 _node) {
    require(registry.owner(_node) == msg.sender);
    _;
  }

  /**
   * @dev constructs an ENS resolver.
   * @param _registry the ENS registry contract.
   */
  constructor(ERC137Registry _registry) public {
    registry = _registry;
  }

  /**
   * @dev Query if a contract implements an interface
   * @param _interfaceID is the interface identifier.
   */
  function supportsInterface(bytes4 _interfaceID) public pure returns (bool) {
    return _interfaceID == ERC165.INTERFACE_ID ||
    _interfaceID == ERC137Resolver.INTERFACE_ID ||
    _interfaceID == ERC181Resolver.INTERFACE_ID;
  }

  /**
   * Returns the address associated with an ENS node.
   * @param _node The ENS node to query.
   * @return The associated address.
   */
  function addr(bytes32 _node) public view returns (address) {
    return records[_node].addr;
  }

  /**
   * @dev Returns the name associated with an ENS node, for reverse records.
   * @param _node The ENS node to query.
   * @return The associated name.
   */
  function name(bytes32 _node) public view returns (string) {
    return records[_node].name;
  }

  /**
   * @dev Sets the address associated with an ENS node.
   * May only be called by the owner of that node in the ENS registry.
   * @param _node The node to update.
   * @param _addr The address to set.
   */
  function setAddr(bytes32 _node, address _addr) public onlyOwner(_node) {
    records[_node].addr = _addr;
    emit AddrChanged(_node, _addr);
  }

  /**
   * @dev Sets the name associated with an ENS node, for reverse records.
   * May only be called by the owner of that node in the ENS registry.
   * @param _node The node to update.
   * @param _name The name to set.
   */
  function setName(bytes32 _node, string _name) public onlyOwner(_node) {
    records[_node].name = _name;
    emit NameChanged(_node, _name);
  }

  /**
   * @dev Resolvers MUST specify a fallback function that throws.
   */
  function () public {
    assert(false);
  }
}
