pragma solidity ^0.4.18;

import "./ZepToken.sol";
import "./KernelInstance.sol";
import "./KernelRegistry.sol";
import "./KernelStakes.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ZepCore {
  using SafeMath for uint256;

  ZepToken private _token;
  KernelRegistry private _registry;
  KernelStakes private _stakes;

  uint256 public newVersionCost;
  uint256 public developerFraction;

  function ZepCore(uint256 _newVersionCost, uint256 _developerFraction) public {
    _registry = new KernelRegistry();
    _stakes = new KernelStakes();
    _token = new ZepToken();
    _token.transferOwnership(msg.sender);
    
    developerFraction = _developerFraction;
    newVersionCost = _newVersionCost;
    // TODO: we need to think how we are going to manage variable costs to propose new versions
  }

  function register(KernelInstance instance) public {
    _registry.addInstance(instance);
    
    // TODO: Update to burnFrom once https://github.com/OpenZeppelin/zeppelin-solidity/pull/870 is merged
    _token.transferFrom(msg.sender, this, newVersionCost);
    _token.burn(newVersionCost);
  }

  function getInstance(string name, string version) public view returns(KernelInstance) {
    return _registry.getInstance(name, version);
  }

  function stake(KernelInstance instance, uint256 amount, bytes data) public {
    _token.transferFrom(msg.sender, this, amount);
    uint256 developerPayout = amount.div(developerFraction);
    require(developerPayout > 0);
    // TODO: Think how we can manage remainders in a better way

    uint256 stakedAmount = amount.sub(developerPayout);
    _stakes.stake(msg.sender, instance, stakedAmount, data);
    _token.transfer(instance.developer(), developerPayout);
  }

  function unstake(KernelInstance instance, uint256 amount, bytes data) public {
    _stakes.unstake(msg.sender, instance, amount, data);
    _token.transfer(msg.sender, amount);    
  }

  function transferStake(KernelInstance from, KernelInstance to, uint256 amount, bytes data) public {
    _stakes.transferStake(msg.sender, from, to, amount, data);
  }

  function token() public view returns (ZepToken) {
    return _token;
  }

  function registry() public view returns (KernelRegistry) {
    return _registry;
  }

  function stakes() public view returns (KernelStakes) {
    return _stakes;
  }
}
