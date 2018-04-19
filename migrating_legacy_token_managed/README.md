# Migrating legacy (non-upgradeable) token to upgradeability with managed strategy

This idea builds on _upgradeability using unstructured storage_, and shows how one would migrate an existing non-upgradeable token into zOS for upgradeability support. This approach uses the managed strategy. For an alternative approach, see the `migrating_legacy_token_opt_in/` folder.

With the managed strategy, the migration is fully controlled and paid for by the development team. In this case, the dev team deploys an upgradeable plain `MintableToken` instance, and migrate the token balances of all users in a single event, centralized way.
During said migration event, the new upgradeable token will not have any additional functionality the legacy token might have had, as it's just a plain vanilla `MintableToken`.
Once the balance migration is over, the devs can upgrade the token to a new implementation, which contains the (optionally modified) full behavior of the legacy token. At this point, the token is migrated to an upgradeable version with the same functionality as the legacy token.


Pros: 
- The upside of this approach is that users don't need to pay the migration gas costs
- Migration to new token code happens in a single event, meaning users need notworry about if/when/how to upgrade their balances.

Cons: 
- Requires more control from the devs, and may not be desirable for all projects (for legal, community concerns, or project management reasons).
- Requires coordinating with exchanges, wallets and other software providers and ecosystem players to update their references to the token address on the switch date.
