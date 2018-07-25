import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract MyToken is StandardToken {
  string public name;
  string public symbol;
  uint8 public decimals;

  constructor(uint256 _initialSupply, string _name, string _symbol, uint8 _decimals) public {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;

    totalSupply_ = _initialSupply;
    balances[msg.sender] = _initialSupply;
    emit Transfer(address(0), msg.sender, _initialSupply);
  }
}