# Migrating legacy (non-upgradeable) token to upgradeability with opt-in strategy

This idea builds on _upgradeability using unstructured storage_, and shows how one would migrate an existing non-upgradeable token into zOS for upgradeability support. This approach uses the opt-in strategy. For an alternative approach, see the `migrating_legacy_token_managed/` folder.

With the opt-in strategy, the migration of the token balances is optional and performed and paid for by the token holders. The new token contract starts with no initial supply and no balances. The only way to "mint" the new tokens is for users to "turn in" their old ones. This is done by first approving the amount they want to migrate via `OldERC20.approve(newTokenAddress, amountToMigrate)` and then calling a function in the new token called `migrateTokens`. The old tokens are sent to a burn address, and the holder receives an equal amount in the new contract.

Pros:
- Exchange of the legacy token can continue as before, so exchanges don't have to scramble to support the new token version
- Users (probably speculators) who don't need/aren't interested in the new functionality don't have to upgrade
- If the demand for the upgraded token becomes higher than the legacy token, the market will incentivize speculators to upgrade and exchanges to support the new token/drop support for the old one.
Onboarding becomes a more gradual and organic process

Cons:

- Assumes the old token contract is not buggy. Reason for upgrading is to add new functionality, not to fix critical issues in the old token.
- The token's supply is split amongst two contracts.
- Requires token users pay for migration gas costs.
