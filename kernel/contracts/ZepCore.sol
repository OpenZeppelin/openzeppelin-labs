pragma solidity ^0.4.18;

import "./ZepToken.sol";
import "./KernelInstance.sol";
import "./KernelRegistry.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ZepCore {
  using SafeMath for uint256;

  event Staked(address indexed user, KernelInstance instance, uint256 amount, uint256 total, bytes data);
  event Unstaked(address indexed user, KernelInstance instance, uint256 amount, uint256 total, bytes data);

  uint256 public newVersionCost;
  uint256 public developerFraction;

  ZepToken private _token;
  KernelRegistry private _registry;
  uint256 private _totalStaked;
  mapping(address => uint256) private _instanceVouches;
  mapping(address => mapping (address => uint256)) private _userVouches;

  function ZepCore(uint256 _newVersionCost, uint256 _developerFraction) public {
    _token = new ZepToken();
    _registry = new KernelRegistry();
    developerFraction = _developerFraction;
    newVersionCost = _newVersionCost;
    // TODO: we need to think how we are going to manage variable costs to propose new versions
  }

  function register(KernelInstance instance) public {
    registry().addInstance(instance);
    token().transferFrom(msg.sender, this, newVersionCost);
    token().burn(newVersionCost);
    // TODO: should we build a burnFrom or sth like that?
  }

  function transferStake(KernelInstance from, KernelInstance to, uint256 amount, bytes data) public {
    // TODO: an unstake followed by a stake call won't work
    require(false);
  }

  function stake(KernelInstance instance, uint256 amount, bytes data) public {
    token().transferFrom(msg.sender, this, amount);
    uint256 developerPayout = amount.div(developerFraction);
    require(developerPayout > 0);
    // TODO: check how we can manage remainders in a better way

    uint256 stakedAmount = amount.sub(developerPayout);
    _totalStaked = totalStaked().add(stakedAmount);
    _instanceVouches[instance] = totalStakedFor(instance).add(stakedAmount);
    _userVouches[msg.sender][instance] = _userVouches[msg.sender][instance].add(stakedAmount);
    token().transfer(instance.developer(), developerPayout);

    Staked(msg.sender, instance, stakedAmount, totalStakedFor(instance), data);
  }

  function unstake(KernelInstance instance, uint256 amount, bytes data) public {
    uint256 currentStake = _userVouches[msg.sender][instance];
    require(currentStake >= amount);

    _totalStaked = totalStaked().sub(amount);
    _instanceVouches[instance] = totalStakedFor(instance).sub(amount);
    _userVouches[msg.sender][instance] = currentStake.sub(amount);
    token().transfer(msg.sender, amount);
    
    Unstaked(msg.sender, instance, amount, totalStakedFor(instance), data);
  }

  function totalStakedFor(KernelInstance instance) public view returns (uint256) {
    return _instanceVouches[instance];
  }

  function totalStaked() public view returns (uint256) {
    return _totalStaked;
  }

  function token() public view returns (ZepToken) {
    return _token;
  }

  function registry() public view returns (KernelRegistry) {
    return _registry;
  }
}
