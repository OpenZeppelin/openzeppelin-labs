pragma solidity ^0.4.21;

import './Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Token_V0
 * @dev Version 0 of a token to show upgradeability.
 */
contract Token_V0 is Ownable {
  using SafeMath for uint256;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  bool internal _initialized;
  uint256 internal _totalSupply;
  mapping (address => uint256) internal _balances;
  mapping (address => mapping (address => uint256)) internal _allowances;

  function initialize(address owner) public {
    require(!_initialized);
    setOwner(owner);
    _initialized = true;
  }

  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address owner) public view returns (uint256) {
    return _balances[owner];
  }

  function allowance(address owner, address spender) public view returns (uint256) {
    return _allowances[owner][spender];
  }

  function transfer(address to, uint256 value) public returns (bool) {
    require(to != address(0));
    require(value <= _balances[msg.sender]);
    
    _balances[msg.sender] = _balances[msg.sender].sub(value);
    _balances[to] = _balances[to].add(value);
    emit Transfer(msg.sender, to, value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    require(to != address(0));
    require(value <= _balances[from]);
    require(value <= _allowances[from][msg.sender]);

    _balances[from] = _balances[from].sub(value);
    _balances[to] = _balances[to].add(value);
    _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(value);
    emit Transfer(from, to, value);
    return true;
  }

  function approve(address spender, uint256 value) public {
    _allowances[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
  }

  function increaseApproval(address spender, uint256 addedValue) public {
    _allowances[msg.sender][spender] = _allowances[msg.sender][spender].add(addedValue);
    emit Approval(msg.sender, spender, _allowances[msg.sender][spender]);
  }

  function decreaseApproval(address spender, uint256 subtractedValue) public {
    uint oldValue = _allowances[msg.sender][spender];
    if (subtractedValue > oldValue) {
      _allowances[msg.sender][spender] = 0;
    } else {
      _allowances[msg.sender][spender] = oldValue.sub(subtractedValue);
    }
    emit Approval(msg.sender, spender, _allowances[msg.sender][spender]);
  }

  function mint(address to, uint256 value) public onlyOwner {
    _balances[to] = _balances[to].add(value);
    _totalSupply = _totalSupply.add(value);
    emit Transfer(0x0, to, value);
  }
}
