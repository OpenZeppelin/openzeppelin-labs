# Upgradeability using fixed storage

This idea builds on _upgradeability using inherited storage_ but redefining the storage structure of the contracts
required for upgradeability purpose.  

The approach consists in having a proxy that delegates calls to specific implementations which can be upgraded, without
changing the storage structure of the previous implementations, but having the chance to add new state variables. Given
the proxy uses `delegatecall` to resolve the requested behaviors, the upgradeable contract's state will be stored in 
the proxy contract itself. 

Since we have three really different kinds of data, one related to the upgradeability mechanism, another for the 
authorization process and the one strictly related to the token contract domain, naming was really important here to 
expressed correctly what's going on. This is the proposed model:

        -------             =======================                   ----------     ----------
       | Proxy |           ║ UpgradeabilityStorage ║                 | Token_V0 | ← | Token_V1 |
        -------             =======================                   ----------     ----------
              ↑              ↑            
           ---------------------     ============================ 
          | UpgradeabilityProxy |   ║ OwnedUpgradeabilityStorage ║
           ---------------------     ============================
                   ↑                      ↑
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
(e.g. `Token_V0` and `Token_V1`). 

Notice that `Token_V0` and `Token_V1` are not aware of the storage structure required for the upgradeability contracts, 
this is because we are using fixed memory positions for its required storage, sufficiently specifics so the behaviors 
state variables won't overwrite them.
