pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/**
 * @title Token_V0
 * @dev Version 0 of a token to show upgradeability.
 */
contract Token_V0  {
  using SafeMath for uint256;

  // Tells whether the token has been initialized or not
  bool internal _initialized;

  // Total amount of tokens
  uint256 internal _totalSupply;

  //Address of old legacyToken contract
  address internal _legacyToken;

  //Address to send old tokens
  address internal _burnAddress;

  // Mapping from owner addresses to their balance amount
  mapping (address => uint256) internal _balances;

  // Mapping from owner addresses to a mapping of allowed amounts per owner addresses
  mapping (address => mapping (address => uint256)) internal _allowances;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  function initialize(address legacyToken, address burnAddress) public {
    require(!_initialized);
    _initialized = true;
    _legacyToken = legacyToken;
    _burnAddress = burnAddress; 
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
    Transfer(msg.sender, to, value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    require(to != address(0));
    require(value <= _balances[from]);
    require(value <= _allowances[from][msg.sender]);

    _balances[from] = _balances[from].sub(value);
    _balances[to] = _balances[to].add(value);
    _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(value);
    Transfer(from, to, value);
    return true;
  }

  function approve(address spender, uint256 value) public {
    _allowances[msg.sender][spender] = value;
    Approval(msg.sender, spender, value);
  }

  function increaseApproval(address spender, uint256 addedValue) public {
    _allowances[msg.sender][spender] = _allowances[msg.sender][spender].add(addedValue);
    Approval(msg.sender, spender, _allowances[msg.sender][spender]);
  }

  function decreaseApproval(address spender, uint256 subtractedValue) public {
    uint oldValue = _allowances[msg.sender][spender];
    if (subtractedValue > oldValue) {
      _allowances[msg.sender][spender] = 0;
    } else {
      _allowances[msg.sender][spender] = oldValue.sub(subtractedValue);
    }
    Approval(msg.sender, spender, _allowances[msg.sender][spender]);
  }

  function migrateToken(uint amount) public {
    require(ERC20(_legacyToken).transferFrom(msg.sender, _burnAddress, amount));
    _balances[msg.sender] = _balances[msg.sender].add(amount);
    _totalSupply = _totalSupply.add(amount);
  }

  function migrateTokenTo(uint amount, address to) public {
    require(ERC20(_legacyToken).transferFrom(msg.sender, _burnAddress, amount));
    _balances[to] = _balances[to].add(amount);
    _totalSupply = _totalSupply.add(amount);
  }
}
