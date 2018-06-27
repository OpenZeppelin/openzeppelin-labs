pragma solidity ^0.4.22;

import "openzeppelin-zos/contracts/math/SafeMath.sol";
import "openzeppelin-zos/contracts/token/ERC20/MintableToken.sol";

contract OldERC20 {
  function totalSupply() public returns (uint);
  function balanceOf(address who) constant returns (uint);
  function transfer(address to, uint value);
  function allowance(address owner, address spender) constant returns (uint);
  function transferFrom(address from, address to, uint value);
  function approve(address spender, uint value);
}

/**
 * @title MyToken V1
 */
contract MyToken_V1 is MintableToken {
  using SafeMath for uint256;

  string public name = "MyToken";
  string public symbol = "MTK";
  uint256 public decimals = 18;

  address public burnAddress;
  OldERC20 public legacyToken;

  function initialize(address _legacyToken, address _burnAddress) isInitializer("MyToken", "1.0.0")  public {
    MintableToken.initialize(this);
    burnAddress = _burnAddress;
    legacyToken = OldERC20(_legacyToken);
  }

  function migrateToken(uint _amount) public {
    migrateTokenTo(_amount, msg.sender);
  }

  function migrateTokenTo(uint _amount, address _to) public {
    legacyToken.transferFrom(msg.sender, burnAddress, _amount);
    require(this.mint(_to, _amount));
  }

  // these methods are just for testing purposes
  function safeApprove(address _spender, uint256 _value) public {
    require(super.approve(_spender, _value));
  }

  function safeTransfer(address _to, uint256 _value) public {
    require(super.transfer(_to, _value));
  }

  function safeTransferFrom(address _from, address _to, uint256 _value) public {
    require(super.transferFrom(_from, _to, _value));
  }
}
