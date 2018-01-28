pragma solidity ^0.4.18;

import '../EternalStorage.sol';

/**
 * @title OwnedToken
 * @dev This contract has a token owner address providing basic authorization control
 */
contract OwnedToken is EternalStorage {
  /**
   * @dev Event to show ownership has been transferred
   * @param previousOwner representing the address of the previous owner
   * @param newOwner representing the address of the new owner
   */
  event TokenOwnershipTransferred(address previousOwner, address newOwner);

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyTokenOwner() {
    require(msg.sender == tokenOwner());
    _;
  }

  /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
  function tokenOwner() public view returns (address) {
    return addressStorage[keccak256("tokenOwner")];
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferTokenOwnership(address newOwner) public onlyTokenOwner {
    require(newOwner != address(0));
    setTokenOwner(newOwner);
  }

  /**
   * @dev Sets a new owner address
   */
  function setTokenOwner(address newOwner) internal {
    TokenOwnershipTransferred(tokenOwner(), newOwner);
    addressStorage[keccak256("tokenOwner")] = newOwner;
  }
}
