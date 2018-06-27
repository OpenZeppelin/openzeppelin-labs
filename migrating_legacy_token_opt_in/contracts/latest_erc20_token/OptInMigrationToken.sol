pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/**
 * @title OptInMigrationToken
 * @dev migration version of the token, used for migrating balances
 * Uses the opt-in migration strategy
 */
contract OptInMigrationToken is MintableToken {

  // Tells whether the token has been initialized or not
  bool internal initialized;

  //Address of old token contract
  ERC20 internal legacyToken;

  //Address where we're sending old tokens to burn them
  address internal burnAddress;

  function initialize(address _legacyToken, address _burnAddress) public {
    require(!initialized);
    owner = this;
    initialized = true;
    legacyToken = ERC20(_legacyToken);
    burnAddress = _burnAddress; 
  }

  function migrateToken(uint _amount) public {
    migrateTokenTo(_amount, msg.sender);
  }

  function migrateTokenTo(uint _amount, address _to) public {
    require(legacyToken.transferFrom(msg.sender, burnAddress, _amount));
    this.mint(_to, _amount);
  }
}
