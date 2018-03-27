pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';

contract ZepToken is MintableToken, PausableToken, BurnableToken, DetailedERC20 {
  function ZepToken() DetailedERC20("Zep Token", "ZEP", 18) public {}
}
