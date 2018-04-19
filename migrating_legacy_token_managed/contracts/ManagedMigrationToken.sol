pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/**
 * @title ManagedMigrationToken
 * @dev migration version of the token, used for migrating balances
 * Uses the managed migration strategy
 */
contract ManagedMigrationToken is MintableToken, PausableToken {

  // Tells whether the token has been initialized or not
  bool internal initialized;

  //Address of old token contract
  ERC20 internal legacyToken;

  function initialize(address _owner, address _legacyToken) public {
    require(!initialized);
    owner = this;
    this.pause();
    owner = _owner;
    initialized = true;
    legacyToken = ERC20(_legacyToken);
  }

  /**
   * @dev Copies the balance of a batch of addresses from the legacy contract
   * @param _holders Array of addresses to migrate balance
   */
  function migrateBalances(address[] _holders) onlyOwner public {
    for (uint256 i = 0; i < _holders.length; i++) {
      migrateBalance(_holders[i]);
    }
  }

  /**
   * @dev Copies the balance of a single addresses from the legacy contract
   * @param _holder Address to migrate balance
   */
  function migrateBalance(address _holder) onlyOwner public {
    require(balances[_holder] == 0);

    uint256 amount = legacyToken.balanceOf(_holder);
    require(amount > 0);

    mint(_holder, amount);
  }

}
