// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/contracts/token/ERC20/ERC20.sol";

contract ERC20Test is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol
    )
    ERC20(_name, _symbol)
    {}

    function mint(uint256 value) external {
        _mint(msg.sender, value);
    }
}
