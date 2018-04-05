pragma solidity ^0.4.18;

import "./ZepToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract KernelStakes is  Ownable {
  using SafeMath for uint256;

  event Staked(address indexed user, address instance, uint256 amount, uint256 total, bytes data);
  event Unstaked(address indexed user, address instance, uint256 amount, uint256 total, bytes data);

  uint256 private _totalStaked;

  mapping(address => uint256) private _instanceVouches;
  mapping(address => mapping (address => uint256)) private _userVouches;

  function KernelStakes() public { }

  function stake(address staker, address instance, uint256 amount, bytes data) public onlyOwner {
    _totalStaked = _totalStaked.add(amount);
    _instanceVouches[instance] = _instanceVouches[instance].add(amount);
    _userVouches[staker][instance] = _userVouches[staker][instance].add(amount);

    Staked(staker, instance, amount, _instanceVouches[instance], data);
  }

  function unstake(address staker, address instance, uint256 amount, bytes data) public onlyOwner {
    uint256 currentStake = _userVouches[staker][instance];
    require(currentStake >= amount);

    _totalStaked = totalStaked().sub(amount);
    _instanceVouches[instance] = _instanceVouches[instance].sub(amount);
    _userVouches[staker][instance] = currentStake.sub(amount);
    
    Unstaked(staker, instance, amount, _instanceVouches[instance], data);
  }

  function stakedFor(address staker, address instance) public view returns (uint256) {
    return _userVouches[staker][instance];
  }

  function totalStakedFor(address instance) public view returns (uint256) {
    return _instanceVouches[instance];
  }

  function totalStaked() public view returns (uint256) {
    return _totalStaked;
  }
}
