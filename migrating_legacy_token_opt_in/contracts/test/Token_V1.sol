pragma solidity ^0.4.18;

import './Token_V0.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';

/**
 * @title Token_V1
 * @dev Version 1 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing burnable functionalities
 * in addition to what's provided in version 0
 */
contract Token_V1 is Token_V0, BurnableToken {
}
