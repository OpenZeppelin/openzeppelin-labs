pragma solidity ^0.4.18;

import './GES_EternalStorage.sol';
import './GES_UpgradeabilityProxy.sol';

/**
 * @title GES_TokenProxy
 * @dev This holds the storage of the token contract and delegates every call to the current implementation set.
 * Besides, it allows to upgrade the token's behaviour towards further implementations.
 */
contract GES_TokenProxy is GES_UpgradeabilityProxy, GES_EternalStorage {}
