pragma solidity ^0.5.0;

import "./@openzeppelin/contracts/token/ERC20/ERC20Upgradable.sol";
import "./@openzeppelin/contracts/token/ERC20/ERC20DetailedUpgradable.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract GLDTokenUpgradable is Initializable, ERC20Upgradable, ERC20DetailedUpgradable {
    function initialize(uint256 initialSupply)  public initializer {
ERC20DetailedUpgradable.initialize("Gold","GLD",18);
ERC20Upgradable.initialize();
        _mint(msg.sender, initialSupply);
    }
}