# Upgradeability using unstructured storage

This idea builds on _upgradeability using inherited storage_ but redefining the storage structure of the contracts
required for upgradeability purpose. The idea here is to use fixed storage slots to store the required data for
upgradeability purpose, this is the upgradeability owner and the implementation address.

We are using inline assembly to store and access mentioned variables in fixed storage positions indexing them
with custom keys using `keccak256`. Please take a look at the implementation provided in `UpgradeabilityProxy` 
and `OwnedUpgradeabilityProxy`.

This is the proposed model:

        -------                      ----------     ----------
       | Proxy |                    | Token_V0 | ← | Token_V1 |
        -------                      ----------     ----------
          ↑              
        --------------------- 
       | UpgradeabilityProxy |
        ---------------------    
          ↑                      
        -------------------------- 
       | OwnedUpgradeabilityProxy |            
        --------------------------        
