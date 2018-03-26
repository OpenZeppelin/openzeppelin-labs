# zOS Kernel v1.0

Design for the zOS Kernel. Work in progress, all the specs below are subject to discussion (especially the names).

## ZepToken

ZepToken is a regular ERC20 token with the following additional behaviours, as described [here](https://github.com/zeppelinos/labs/issues/33):

* Burnable
* Pausable
* Mintable

## ZepCore

The Core supports [adding new versions](https://github.com/zeppelinos/labs/issues/38) and [vouching for existing ones](https://github.com/zeppelinos/labs/issues/35), and relies on the KernelRegistry to store all the available versions. It also definitely needs a better name.

### Staking interface

The Core has a staking interface for staking tokens for a particular version. Kernel versions are identified by their KernelInstance address. 

Consider reusing [ERC900](https://github.com/ethereum/EIPs/pull/910) for this, without supporting history (for now). The Core contract could either extend ERC900 or reuse it via composition, acting as a facade.

**stakeFor**

Locks the specified amount of ZepTokens for a particular version. Upon invoking this method, a fraction of the tokens are immediately sent to the Kernel's developer address as a [payout](https://github.com/zeppelinos/labs/issues/37). The data parameter is currently unused, and included only for compatibility with ERC900.

```solidity
function stakeFor(address kernel, uint256 amount, bytes data) public;
```

**unstakeFor**

Unlocks the tokens for a given version. No payouts are triggered upon calling this method. Also note that if 10 tokens were staked, only a 9 of them will be left to be unstaked (assuming a 10% payout to the developer).

```solidity
function unstakeFor(address kernel, uint256 amount, bytes data) public;
```

**totalStakedFor**

Returns the number of tokens staked for a specific version.

```solidity
function totalStakedFor(address kernel) public view returns (uint256);
```

### Adding versions

The Core also acts as a facade for adding new versions, burning tokens in the process. When submitting a new version given its address, the developer must also `approve` a certain amount of tokens to the Core contract, so it burns them as part of the process of creating the new version.

**register**

```solidity
function register(KernelInstance instance) public;
```

## KernelRegistry

Keeps track of all submitted Kernel versions.

**add**

Adds a new Kernel instance for a given distribution name and version, optionally specifying a parent version, identified by its instance address. This function should only be invokable from the Core contract.

```solidity
function add(string name, string version, KernelInstance instance, KernelInstance parent) public;
```

**get**

Returns a KernelInstance given a distribution name and a search string for the version. At the very least, it should accept an exact match for the version to retrieve; but other search strings could be supported, borrowing the [syntax from npm](https://docs.npmjs.com/getting-started/semantic-versioning#semver-for-consumers) (`~1.0.4`, `^1.0.4`, etc).

```solidity
function get(string name, string version) public onlyCore constant returns (KernelInstance);
```

## KernelInstance

A particular Kernel version from a distribution. Has an immutable reference to all contract implementations that comprise this version.

It is open to discussion _how_ the immutability of the implementation addresses can be enforced. Two immediate options arise:
- This is not enforced, but the kernel developers must ensure it holds. Given that the contract code should be verified, anyone who uses that kernel version should check that it is the case.
- Kernel instances can only be created through factory methods provided by zeppelin OS, which ensure that the implementation addresses are immutable.

### Public getters

**name** string

**version** string

**developer** address

**parent** address (optional)

### Methods

**get**

Returns the backing implementation for a contract given its name. A Kernel instance should **always** return the same address for the same contract name. May optionally query a parent kernel instance if this version does not modify that contract version.

```solidity
function get(string contractName) returns (address);
```

