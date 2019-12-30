pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";











contract DiamondAUpgradable is Initializable {
    function initialize(bool _bar) external initializer {
        __init(true, _bar);
    }

    function __init(bool callChain, bool _bar) internal {
        
        
        foo = 42;
        
        bar = _bar;
    
    }

    uint256 private foo ;
    bool public bar;
    
}

contract DiamondB1Upgradable is Initializable, DiamondAUpgradable {
    function initialize() external initializer {
        __init(true);
    }

    function __init(bool callChain) internal {
        if(callChain) {
            DiamondAUpgradable.__init(false);
        }
        
        
    }
}

contract DiamondB2Upgradable is Initializable, DiamondAUpgradable {
    function initialize(string memory _foo) external initializer {
        __init(true, _foo);
    }

    function __init(bool callChain, string memory _foo) internal {
        if(callChain) {
            DiamondAUpgradable.__init(false);
        }
        
        
        foo = _foo;
    
    }

    string public foo;
    

}

contract DiamondCUpgradable is Initializable, DiamondB1Upgradable, DiamondB2Upgradable {
    function initialize() external initializer {
        __init(true);
    }

    function __init(bool callChain) internal {
        if(callChain) {
            DiamondAUpgradable.__init(false, true);
            DiamondB1Upgradable.__init(false);
            DiamondB2Upgradable.__init(false, "hello");
        }
        
        

    
    }

    
}






