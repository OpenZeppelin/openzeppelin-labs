pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';

/**
 * @title Token_V1
 * @dev Version 1 of the token.
 * The idea here is to extend a token behaviour providing,
 * as an example, burnable functionalities,
 * and removing the minting capabilities. 
 * Note that the V1 implementation needs to share the same 
 * storage structure as the MigrationToken
 */
contract Token_V1 is BurnableToken {
}
