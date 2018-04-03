# Upgradeability ownership

This idea builds on _upgradeability using inherited storage_. In addition, it proposes an authorization control flow to 
restrict the access of the contract upgradeability mechanism.  

The approach consists in having a proxy that delegates calls to specific implementations which can be upgraded, without
changing the storage structure of the previous implementations, but having the chance to add new state variables. Given
the proxy uses `delegatecall` to resolve the requested behaviors, the upgradeable contract's state will be stored in 
the proxy contract itself. 

Since we have three really different kinds of data, one related to the upgradeability mechanism, another for the 
authorization process and the one strictly related to the token contract domain, naming was really important here to 
expressed correctly what's going on. This is the proposed model:

        -------     =======================     ============================   
       | Proxy |   ║ UpgradeabilityStorage ║ ← ║ OwnedUpgradeabilityStorage ║  
        -------     =======================     ============================   
             ↑               ↑                  ↑          ↑               ↑             
           ---------------------                |      ----------       ----------        
          | UpgradeabilityProxy |               |     | Token_V0 |  ←  | Token_V1 |       
           ---------------------                |      ----------       ----------   
                            ↑                   |
                         -------------------------- 
                        | OwnedUpgradeabilityProxy |
                         -------------------------- 

`Proxy`, `UpgradeabilityProxy` and `UpgradeabilityStorage` are generic contracts that can be used to implement
upgradeability through proxies. In this example we use all these contracts to implement an upgradeable ERC20 token. 

The `UpgradeabilityStorage` contract holds data needed for upgradeability, while the `OwnedUpgradeabilityStorage` 
provides the required state variables to track upgradeability ownership. 

The `OwnedUpgradeabilityProxy` combines proxy, upgradeability and ownable functionalities restricting version upgrade
functions to be accessible just from the declared proxy owner. This contract will delegate calls to specific 
implementations of the ERC20 token behavior. These behaviors are the code that can be upgraded by the token developer 
(e.g. `Token_V0` and `Token_V1`). `OwnedUpgradeabilityProxy` extends from `UpgradeabilityProxy` (which in turn extends 
from `UpgradeabilityStorage` and `OwnedUpgradeabilityStorage`). Notice that `Token_V0` and `Token_V1` must respect 
this storage structure (given we are using `delegatecall`).
