pragma solidity ^0.5.0;
import "@openzeppelin/upgrades/contracts/Initializable.sol";











contract DiamondAUpgradable is Initializable {
        function initialize() public initializer {
                __init(true);
              }
        
function __init(bool callChain) internal {
          if(callChain) {}
          
foo = 42;
          {}
        }
    uint256 private foo ;
    
}

contract DiamondB1Upgradable is Initializable, DiamondAUpgradable {
        function initialize() public initializer {
                __init(true);
              }
        
function __init(bool callChain) internal {
          if(callChain) {
DiamondAUpgradable.__init(false);}
          
          
        }}

contract DiamondB2Upgradable is Initializable, DiamondAUpgradable {
        function initialize() public initializer {
                __init(true);
              }
        
function __init(bool callChain) internal {
          if(callChain) {
DiamondAUpgradable.__init(false);}
          
          
        }}

contract DiamondCUpgradable is Initializable, DiamondB1Upgradable, DiamondB2Upgradable {
        function initialize() public initializer {
                __init(true);
              }
        
function __init(bool callChain) internal {
          if(callChain) {
DiamondAUpgradable.__init(false);
DiamondB1Upgradable.__init(false);
DiamondB2Upgradable.__init(false);}
          
          {

    }
        }
    
}






