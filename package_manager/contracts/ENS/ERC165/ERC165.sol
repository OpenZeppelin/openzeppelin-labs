pragma solidity ^0.4.24;


/**
 * @title ERC165
 * @dev Standard method to publish and detect what interfaces a smart contract implements.
 */
contract ERC165 {
  /// The interface ID of this interface
  bytes4 public constant INTERFACE_ID = 0x01ffc9a7;

  /**
   * @dev Query if a contract implements an interface
   * @param interfaceID is the interface identifier. It consists of the XOR of the function signature hashes of the
   * functions provided by that interface; in the degenerate case of single-function interfaces, it is simply equal to
   * the signature hash of that function. If a resolver returns true for supportsInterface(), it must implement the
   * functions specified in that interface.
   * @return true if the contract implements interfaceID and interfaceID is not 0xffffffff, or false otherwise
   */
  function supportsInterface(bytes4 interfaceID) public pure returns (bool);
}
