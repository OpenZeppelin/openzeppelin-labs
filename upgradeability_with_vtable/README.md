# Upgradeability with vtables

This idea builds on _upgradeability using inherited storage_, but breaks the implementation contract in multiple contracts. The `Registry` contract keeps track of which contract satisfies _each function_ for a version, similar to a vtable, that maps function signatures to addresses with the actual implementations.

This allows to make a minor modification to a function in a contract without having to re-upload the entire code for all the contract, and just upgrade the contract that backs that particular function (see the `should upgrade single function test`). It also drops the limitation of a single contract having to fit within a block, since the actual implementation is spread among multiple contracts.

The main drawback is gas consumption, since now every call requires an additional call to the registry to retrieve the address that implements a particular function. Nevertheless, this could be solved by caching the vtable for a particular version from the registry to each proxy upon initialization.

This approach requires to define a base contract for the base storage and another for the full interface. All implementation contracts must inherit from the storage contract, and whenever a call needs to be made, `this` should be casted to the interface contract, which will go back to the proxy and re-routed via the vtable.