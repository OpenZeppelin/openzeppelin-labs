pragma solidity ^0.4.18;

import './TokenStorage.sol';
import './OwnedUpgradeabilityProxy.sol';

/**
 * @title TokenProxy
 * @dev This proxy holds the storage of the token contract and delegates every call to the current implementation set.
 * Besides, it allows to upgrade the token's behaviour towards further implementations.
 */
contract TokenProxy is OwnedUpgradeabilityProxy, TokenStorage {}
