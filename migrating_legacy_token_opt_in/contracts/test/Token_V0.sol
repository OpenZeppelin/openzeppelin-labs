pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/**
 * @title MigrationToken
 * @dev migration version of the token, used for migrating balances
 */
contract MigrationToken is MintableToken {

  // Tells whether the token has been initialized or not
  bool internal _initialized;

  //Address of old token contract
  address internal _legacyToken;

  //Address where we're sending old tokens to burn them
  address internal _burnAddress;

  function initialize(address legacyToken, address burnAddress) public {
    require(!_initialized);
    owner = this;
    _initialized = true;
    _legacyToken = legacyToken;
    _burnAddress = burnAddress; 
  }

  function migrateToken(uint amount) public {
    migrateTokenTo(amount, msg.sender);
  }

  function migrateTokenTo(uint amount, address to) public {
    require(ERC20(_legacyToken).transferFrom(msg.sender, _burnAddress, amount));
    this.mint(to, amount);
  }
}
