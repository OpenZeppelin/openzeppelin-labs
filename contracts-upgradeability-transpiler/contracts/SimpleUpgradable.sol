pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract SimpleUpgradable is Initializable {
    uint256 private count;
    uint256 private local;
    string private hello;
    bool public test;
    uint256 constant const = 32**22 + 8;

    function initialize(uint256 num) public initializer {
        local = 564;
        hello = "hello";
        test = true;
        count = num;
    }

    function getHello() public view returns (string memory) {
        return hello;
    }
}

contract DiamondAUpgradable is Initializable {
    uint256 private foo;
    function initialize() public initializer {
        foo = 42;

    }
}

contract DiamondB1Upgradable is Initializable, DiamondAUpgradable {
    function initialize() public initializer {
        DiamondAUpgradable.initialize();

    }

}

contract DiamondB2Upgradable is Initializable, DiamondAUpgradable {
    function initialize() public initializer {
        DiamondAUpgradable.initialize();

    }

}

contract DiamondCUpgradable is
    Initializable,
    DiamondB2Upgradable,
    DiamondB1Upgradable
{
    function initialize() public initializer {
        DiamondB2Upgradable.initialize();
        DiamondB1Upgradable.initialize();

    }

}
