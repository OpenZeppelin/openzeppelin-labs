# Extensibility Study

We address the problem of extending from an already deployed implementation. An example showcasing a partial solution that uses the proxying system of zeppelin_os is described here. 

We have a simple hierarchy of a parent contract `A` and a derived contract `B` (is `A`). We want to tackle the case in which an instance of `A` is already deployed, and we want to use its function implementations (_but not its storage_).

We introduce a mechanism that involves creating a `BFacade` contract that inherits from `AStor` and `OwnedUpgradeabilityProxy`, where `AStor` is a simple contract that mimicks the storage structure of `A`, and `OwnedUpgradeabilityProxy` comes from zeppelin_os.

The steps for usage are:
1) Deploy `A`
2) Deploy `BFacade`
3) Point `BFacade` to the `A` behavior, using `upgradeToAndCall`
4) For calling the contract (both from other contracts and externally), simply wrap `BFacade` in `B`.

This scheme exempts us from redeploying `A`, although we do need to deploy its storage `AStor` (through the inheritance in `BFacade`). Finally, note that the user contracts that call `BFacade` will need to import `B` instead of `BFacade`, we need to check whether there's gas savings in this case. Note that the `B` contract is only needed for matching interfaces, but is not actually needed in the extensibility scheme.

The implementation can be found under `base-scenario`.

## Upgradeability

### Parent upgradeability
This scheme allows for partial upgradeability of parent contracts. It transparently allows for internal changes in methods, while it allows for a change in interface if the derived class is rewrapped with the expected derived interface. This is expected in any upgradeability protocol, if the proxied interface changes, we will need to update our contracts accordingly.

An illustration of the mechanism is provided by which `A` is upgraded to `A_v2` (and, for testing purposes, `B` incorporates the changes in `B_Av2`).

### Child upgradeability
The basic scenario does not automatically allow for upgradeability of children. For this, we introduce an `ExtensibilityProxy`, which holds an extra `facadeImplementation` that points to the facade, while `implementation` still points to the behavior. 

We illustrate this case by upgrading `B` to `B_v2`, which adds a behavior. The corresponding facade upgrade is given in `B_v2Facade`. The implementation can be found under `child-upgradeability`.

## Caveats
The main caveat of this scheme is that `internal` members of parent contracts are not accessible from derived ones. This is due to the fact that we are not providing a true inheritance mechanism, but really simulating it via `delegatecall`s. Given that we want the parent contract to be already deployed, this looks like an insurmountable problem, so we might want to design our online libraries taking this limitation into account.

