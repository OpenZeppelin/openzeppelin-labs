pragma solidity ^0.4.18;

import './Token_V2.sol';

/**
 * @title Token_V2
 * @dev Version 2 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing pausable functionalities
 * in addition to what's provided in version 2
 */
contract Token_V3 is Token_V2 {
  event Pause();
  event Unpause();

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused());
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused());
    _;
  }

  /**
   * @dev tells whether the token is paused or not
   */
  function paused() public view returns (bool) {
    return boolStorage['paused'];
  }

  /**
   * @dev called by the owner to pause the token, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    boolStorage['paused'] = true;
    Pause();
  }

  /**
   * @dev called by the owner to unpause the tokn, returns to normal state
   */
  function unpause() public onlyOwner whenPaused {
    boolStorage['paused'] = false;
    Unpause();
  }

  /**
   * @dev transfer function with not-paused guard
   */
  function transfer(address to, uint256 value) public whenNotPaused {
    return super.transfer(to, value);
  }

  /**
   * @dev transferFrom function with not-paused guard
   */
  function transferFrom(address from, address to, uint256 value) public whenNotPaused {
    return super.transferFrom(from, to, value);
  }

  /**
   * @dev approve function with not-paused guard
   */
  function approve(address spender, uint256 value) public whenNotPaused {
    return super.approve(spender, value);
  }

  /**
   * @dev increaseApproval function with not-paused guard
   */
  function increaseApproval(address spender, uint256 addedValue) public whenNotPaused {
    return super.increaseApproval(spender, addedValue);
  }

  /**
   * @dev decreaseApproval function with not-paused guard
   */
  function decreaseApproval(address spender, uint256 subtractedValue) public whenNotPaused {
    return super.decreaseApproval(spender, subtractedValue);
  }
}
