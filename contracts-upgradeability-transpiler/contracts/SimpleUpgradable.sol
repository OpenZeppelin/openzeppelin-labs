pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract NoInheritanceUpgradable is Initializable {
    function initialize() external initializer {
        __init(true);
    }

    function __init(bool callChain) internal {
        
        
        
    }


}

contract SimpleUpgradable is Initializable {
    function initialize(uint256 num) external initializer {
        __init(true, num);
    }

    function __init(bool callChain, uint256 num) internal {
        
        
        local = 564;
        hello = "hello";
        test = true;
        
        count = num;
    
    }

    uint256 public count;
    uint256 private local ;
    string private hello ;
    bool public test ;
    uint256 constant const = 32**22 + 8;

    

    function getHello() public view returns (string memory) {
        return hello;
    }
}







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

    function __init(bool callChain) internal {
        
        
        
    }
}

contract DiamondB2Upgradable is Initializable, DiamondAUpgradable {

    function __init(bool callChain, string memory _foo) internal {
        
        
        
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

contract InheritanceWithParamsParentUpgradable is Initializable {
    function initialize(bool foo, uint256 bar) external initializer {
        __init(true, foo,bar);
    }

    function __init(bool callChain, bool foo, uint256 bar) internal {
        
        
        
    }

    
}

contract InheritanceWithParamsConstructorChildUpgradable is Initializable, InheritanceWithParamsParentUpgradable {
    function initialize() external initializer {
        __init(true);
    }

    function __init(bool callChain) internal {
        if(callChain) {
            InheritanceWithParamsParentUpgradable.__init(false, true, 564);
        }
        
        
    }

    
}

contract InheritanceWithParamsClassChildUpgradable is Initializable,
    InheritanceWithParamsParentUpgradable
{
    function initialize() external initializer {
        __init(true);
    }

    function __init(bool callChain) internal {
        if(callChain) {
            InheritanceWithParamsParentUpgradable.__init(false, false, 87);
        }
        
        
    }

    
}
