# Extensibility Study

We address the problem of extending from an already deployed implementation. An example showcasing a partial solution that uses the proxying system of zeppelin_os is described here. 

We have a simple hierarchy of a parent contract `A` and a derived contract `B` (is `A`). We want to tackle the case in which an instance of `A` is already deployed, and we want to use its function implementations (_but not its storage_).

We introduce a mechanism that involves creating a `BFacade` contract that inherits from `AStor` and `OwnedUpgradeabilityProxy`, where `AStor` is a simple contract that mimicks the storage structure of `A`, and `OwnedUpgradeabilityProxy` comes from zeppelin_os.

The steps for usage are:
1) Deploy `A`
2) Deploy `BFacade`
3) Point `BFacade` to the `A` behavior, using `upgradeToAndCall`
4) For calling the contract (both from other contracts and externally), simply wrap `BFacade` in `B`.

This scheme exempts us from redeploying `A`, although we do need to deploy its storage `AStor` (through the inheritance in `BFacade`). Finally, note that the user contracts that call `BFacade` will need to import `B` instead of `BFacade`, we need to check whether there's gas savings in this case.