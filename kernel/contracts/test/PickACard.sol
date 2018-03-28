pragma solidity ^0.4.18;

import "./kernel_instance/ERC721Token.sol";

contract PickACard {
  uint256 public constant MAX_CARD = 10;

  ERC721Token public erc721;

  function PickACard(ERC721Token _erc721) public {
    erc721 = _erc721;
    erc721.initialize();
    for(uint256 i = 0; i <= MAX_CARD; i++) {
      erc721.mint(this, i);
    }
  }

  function pick(uint256 number) public {
    require(number < MAX_CARD);
    erc721.safeTransferFrom(this, msg.sender, number);
  }
}
