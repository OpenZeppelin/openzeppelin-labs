pragma solidity ^0.4.11;

import "./zeppelin-solidity-1.1.0/math/SafeMath.sol";
import "./zeppelin-solidity-1.1.0/token/PausableToken.sol";
import "./zeppelin-solidity-1.1.0/token/MintableToken.sol";
import "./zeppelin-solidity-1.1.0/token/TokenTimelock.sol";

/**
 * @title MyToken V0
 */
contract MyToken_V0 is PausableToken, MintableToken {
  using SafeMath for uint256;

  string public name = "MyToken";
  string public symbol = "MTK";
  uint public decimals = 18;

  function mintTimelocked(address _to, uint256 _amount, uint256 _releaseTime) onlyOwner canMint returns (TokenTimelock) {
    TokenTimelock timelock = new TokenTimelock(this, _to, _releaseTime);
    mint(timelock, _amount);
    return timelock;
  }
}
