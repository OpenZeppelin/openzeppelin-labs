# Upgradeability using generic Eternal Storage

The idea of this approach is to allow us to upgrade a contract's behavior, assuming that the storage structure won't
change and that it will use a set of mappings for each type of variable to store, this mappings will be internal variables that can be only modified inside the contract.

The contract developer shoudl work only with this internal storage of mappings and add the necessary get functions to it.

The approach consists in having a proxy that delegates calls to specific implementations which can be upgraded,
leaving the storage structure immutable. Given the proxy uses `delegatecall` to resolve the requested behaviors,
the upgradeable contract's state will be stored in the proxy contract itself.
The upgradebale contract can be initialized only once by a contract owner.

Since we have two really different kinds of data, one related to the upgradeability mechanism and another
strictly related to the token contract domain, naming was really important here to expressed correctly what's
going on. This is the proposed model:

        -------            =======================            ========================
       | Proxy |          ║ UpgradeabilityStorage ║          ║      EternalStorage     ║
        -------            =======================            ========================
             ↑              ↑                   ↑              ↑            ↑
           ---------------------            =========================       |
          | UpgradeabilityProxy |          ║ UpgradeableEternalStorage ║    |
           ---------------------            =========================       |
                             ↑                    ↑           ↑             |
                             |               ----------   ----------        |         
                             |              | Token_V0 | | Token_V1 |       |                    
                             |               ----------   ----------        |                               
                         --------------  ___________________________________|
                        |  TokenProxy  |
                         --------------

`Proxy`, `UpgradeabilityProxy` and `UpgradeabilityStorage` are generic contracts that can be used to implement
upgradeability through proxies. In this example we use them to implement an upgradeable ERC20 token. `EternalStorage`
defines the token-specific storage, which combined with the generic `UpgradeabilityProxy` results in `TokenProxy`.
`TokenProxy` is the contract that will delegate calls to specific implementations of the ERC20 token behavior. These
behaviors are the code that can be upgraded by the token developer (e.g. `Token_V0` and `Token_V1`).

The `EternalStorage` contract holds token-related information, while the `UpgradeabilityStorage` contract holds data
needed for upgradeability. All this information is contained in the `UpgradeableEternalStorage` contract, which every
implementation of the upgradeable behavior needs.

On the other hand, `TokenProxy` extends from `UpgradeabilityProxy` (which in turn extends from `UpgradeabilityStorage`),
and then from the `EternalStorage` contract. Notice that inheritance order in `TokenProxy` needs to be the same as the
one in `UpgradeableEternalStorage`, to respect storage structure (given we are using `delegatecall`).

Notice that we are not defining any new state variables in the token behavior implementation contracts. This is a
requirement of the proposed approach to ensure the proxy storage is not messed up.
