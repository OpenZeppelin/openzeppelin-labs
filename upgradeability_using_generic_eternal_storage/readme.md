# Upgradeability using generic Eternal Storage

The idea of this approach is to allow us to upgrade a contract's behavior, using the same generic storage structure 
for any contract. This is a set of mappings for each type variable which could be accessed or modified inside the 
upgradeable contract. Notice that the contract developer should work only following this storage structure of mappings.

The approach consists in having a proxy that delegates calls to specific implementations which can be upgraded,
leaving the storage structure immutable. Given the proxy uses `delegatecall` to resolve the requested behaviors,
the upgradeable contract's state will be stored in the proxy contract itself.
The upgradeable contract can be initialized only once by a contract owner.

Since we have two really different kinds of data, one related to the upgradeability mechanism and another
strictly related to the token contract domain, naming was really important here to expressed correctly what's
going on. This is the proposed model:

        -------      =======================     ============================      =========================
       | Proxy |    ║ UpgradeabilityStorage ║   ║ UpgradeabilityOwnerStorage ║    ║      EternalStorage     ║
        -------      =======================     ============================      =========================
             ↑              ↑            ↑        ↑    ↑                           ↑        ↑
           ---------------------         |_______ | __ ==============================       |
          | UpgradeabilityProxy |                └|┘  ║  OwnedUpgradeabilityStorage  ║      |
           ---------------------                  |    ==============================       | 
                   ↑                              |           ↑              ↑              |
                  -------------------------- _____|           |              |              |
                 | OwnedUpgradeabilityProxy |            ----------      ----------         |
                  --------------------------            | Token_V0 |    | Token_V1 |        | 
                             ↑                           ----------      ----------         |         
                         ---------------------  ____________________________________________|
                        | EternalStorageProxy |
                         ---------------------

`Proxy`, `UpgradeabilityProxy` and `UpgradeabilityStorage` are generic contracts that can be used to implement
upgradeability through proxies. In this example we use all these contracts to implement an upgradeable ERC20 token. 

The `UpgradeabilityStorage` contract holds data needed for upgradeability, while the `UpgradeabilityOwnerStorage` 
provides the required state variables to track upgradeability ownership. `EternalStorage` defines the generic storage 
structure, which in this example will be used to store token specific data. The `OwnedUpgradeabilityStorage` contract 
combines all the mentioned storage contracts, which every implementation of the upgradeable behavior needs.

The `OwnedUpgradeabilityProxy` combines proxy, upgradeability and ownable functionalities restricting version upgrade
functions to be accessible just from the declared proxy owner.

`EternalStorageProxy` is the contract that will delegate calls to specific implementations of the ERC20 token behavior. 
These behaviors are the code that can be upgraded by the token developer (e.g. `Token_V0` and `Token_V1`). 
`EternalStorageProxy` extends from `OwnedUpgradeabilityProxy` (which in turn extends from `UpgradeabilityStorage` and 
`UpgradeabilityOwnerStorage`), and then from the `EternalStorage` contract. Notice that inheritance order needs to be 
the same as the one in `OwnedUpgradeabilityStorage`, to respect storage structure (given we are using `delegatecall`).

In addition, we are not defining any new state variables in the token behavior implementation contracts, we are just
using the generic storage structure. This is a requirement of the proposed approach to ensure the proxy storage 
is not messed up.
