pragma solidity ^0.4.18;

import '../UpgradeableEternalStorage.sol';

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable is UpgradeableEternalStorage {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function initialize() public {
    super.initialize();
    addressStorage[keccak256("owner")] = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == addressStorage[keccak256("owner")]);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(addressStorage[keccak256("owner")], newOwner);
    addressStorage[keccak256("owner")] = newOwner;
  }

  function getOwner() public view returns(address) {
    return addressStorage[keccak256("owner")];
  }

}
