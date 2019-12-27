pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract SimpleUpgradable is Initializable {
    // Auto generated code. Do not edit.
    function initialize(uint256 num) public initializer {
        __init(true, num);
    }

    // Auto generated code. Do not edit.
    function __init(bool callChain, uint256 num) internal {
        if (callChain) {}

        local = 564;
        hello = "hello";
        test = true;
        {
            count = num;
        }
    }
    uint256 public count;
    uint256 private local;
    string private hello;
    bool public test;
    uint256 constant const = 32**22 + 8;

    function getHello() public view returns (string memory) {
        return hello;
    }
}

contract DiamondAUpgradable is Initializable {
    // Auto generated code. Do not edit.
    function initialize() public initializer {
        __init(true);
    }

    // Auto generated code. Do not edit.
    function __init(bool callChain) internal {
        if (callChain) {}

        foo = 42;
        {}
    }
    uint256 private foo;

}

contract DiamondB1Upgradable is Initializable, DiamondAUpgradable {
    // Auto generated code. Do not edit.
    function initialize() public initializer {
        __init(true);
    }

    // Auto generated code. Do not edit.
    function __init(bool callChain) internal {
        if (callChain) {
            DiamondAUpgradable.__init(false);
        }

    }
}

contract DiamondB2Upgradable is Initializable, DiamondAUpgradable {
    // Auto generated code. Do not edit.
    function initialize() public initializer {
        __init(true);
    }

    // Auto generated code. Do not edit.
    function __init(bool callChain) internal {
        if (callChain) {
            DiamondAUpgradable.__init(false);
        }

    }
}

contract DiamondCUpgradable is
    Initializable,
    DiamondB2Upgradable,
    DiamondB1Upgradable
{
    // Auto generated code. Do not edit.
    function initialize() public initializer {
        __init(true);
    }

    // Auto generated code. Do not edit.
    function __init(bool callChain) internal {
        if (callChain) {
            DiamondB2Upgradable.__init(false);
            DiamondB1Upgradable.__init(false);
        }

    }
}
