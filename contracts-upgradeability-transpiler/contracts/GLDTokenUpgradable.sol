pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract GLDTokenUpgradable is ERC20, ERC20Detailed {
    function initialize(uint256 initialSupply) ERC20Detailed("Gold", "GLD", 18) public {
        _mint(msg.sender, initialSupply);
    }
}