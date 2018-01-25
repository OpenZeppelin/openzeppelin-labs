pragma solidity ^0.4.18;

import './TokenStorage.sol';
import './UpgradeabilityProxy.sol';

/**
 * @title TokenProxy
 * @dev This holds the storage of the token contract and delegates every call to the current implementation set.
 * Besides, it allows to upgrade the token's behaviour towards further implementations.
 */
contract TokenProxy is UpgradeabilityProxy, TokenStorage {
  address public proxyOwner;

  function TokenProxy() {
    proxyOwner = msg.sender;
  }

  modifier onlyProxyOwner() {
    require(msg.sender == proxyOwner);
    _;
  }

  function transferProxyOwnership(address _newOwner) public onlyProxyOwner {
    require(_newOwner != proxyOwner);
    proxyOwner = _newOwner;
  }

  function upgradeTo(string version, address implementation) public onlyProxyOwner {
    _upgradeTo(version, implementation);
  }
}
