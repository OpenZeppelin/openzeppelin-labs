pragma solidity ^0.4.18;

import "./ERC721BasicToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ERC721Token is ERC721BasicToken, Ownable {
  bool private _initialized = false;

  function initialize() public {
    require(!_initialized);
    owner = msg.sender;
    _initialized = true;
  }

  function mint(address _to, uint256 _tokenId) onlyOwner public {
    _mint(_to, _tokenId);
  }
}
