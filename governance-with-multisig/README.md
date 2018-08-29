# Upgradeability governance via multisig

This project experiments with managing the upgradeability of a project via a multisig. Instead of a single Ethereum account having full control over when a contract should be upgraded, this responsibility is decentralized to multiple parties. In this scenario, these parties coordinate their actions via a multi-signature wallet. This allows for setups where a predefined group of accounts have to agree upon an upgrade before it can be actually executed.

This approach requires **no changes** at all on ZeppelinOS, and uses [the Gnosis MultiSig wallet implementation](https://github.com/gnosis/MultiSigWallet) for governance, already [audited by the Zeppelin team](https://blog.zeppelin.solutions/gnosis-multisig-wallet-audit-d702ff0e2b1e). The only caveat is that upgradeability must be managed manually by the MultiSig owners, altough all other operations (including the deployment of new logic contracts) are still managed via the ZeppelinOS CLI.

## About this project

You'll find two test contracts in this project: `EthBox` and `EthBoxV2`. The first has a single `deposit` method that stores ETH sent from an account. The latter extends the former, by adding a `getBalance` function to query the balance of an account. The goal will be to deploy an instance of `EthBox`, transfer upgradeability rights to a multisig wallet, and require the consensus of the multisig owners to upgrade it to `EthBoxV2`.

## About this guide

This guide will take you through the following steps:

1. Set up a new ZeppelinOS project
2. Register a contract and deploy it to a network
3. Create a new upgradeable instance of your contract
4. Create a multisig wallet and transfer upgradeability rights of the new contract instance to it
5. Register a new version of your logic contract and deploy it
6. Submit a request to the multisig wallet to upgrade the contract instance
7. Confirm the request and check the contract was upgraded

## Step by step

We'll begin by setting up the ZeppelinOS project. Clone this repository, install dependencies, and initialize the `zos` project to get started.

```bash
$ git clone https://github.com/zeppelinos/labs.git
$ cd labs/governance-with-multisig
$ npm install
$ npx zos init governance-with-multisig
```

Our first step will be to register the `EthBox` contract in our project, deploy the logic contract to the blockchain, and create a new instance. We'll be working on a local ganache instance (you can start one via `./ganache-sh`), though you can also run this on any real network.

```sh
$ npx zos add EthBox
$ npx zos push --skip-compile --network local
$ npx zos create EthBox --network local
```

We can test that the `EthBox` instance was correctly deployed by `deposit`ing some ETH on it from a `truffle console`. Replace `MY_ETHBOX_ADDRESS` with the address returned by the last command run above. 
```js
truffle(local)> EthBox.at(MY_ETHBOX_ADDRESS).deposit({ from: owner1, value: 1e18 })
```

_Throughout this example, we'll be using three Ethereum accounts (`owner1`, `owner2`, `owner3`) for sending transactions. You can set them to the first three elements of `web3.eth.accounts` for testing, or use any others available._

Up to this point, the `admin` of the `EthBox` instance we have just created is a ZeppelinOS `App`, which centralizes control of our project. This App, in turn, is controlled by the account we used from the CLI. This means that this single account has absolute control to register new logic contracts, create new instances, and upgrade any of the existing ones.

We will now create a multisig wallet, that will hold the keys to the upgreadeability of our new instance of `EthBox`. You can either create the wallet programatically from a `truffle console`, or use the Gnosis provided GUI, downloadeable from [here](https://github.com/gnosis/MultiSigWallet/releases). Take note of the multisig contract address.

```js
truffle(local)> MultiSigWallet.new([owner1, owner2, owner3], 2, { from: owner1 }).then(i => multisig = i)
```

To transfer ownership of the `EthBox` instance to the multisig, you can use the `change-admin` script provided here, by specifying the address of the multisig (make sure to replace `MULTISIG_ADDRESS` with the actual address).

```sh
$ npx truffle exec change-admin.js EthBox MULTISIG_ADDRESS --network local
```

Under the hood, the script is retrieving the `EthBox` instance address and the ZeppelinOS project `App` from the `zos.local.json` file, and using `zos-lib` to change the upgradeability admin of the instance:

```js
// Extract zOS App address and EthBox instance (proxy) address
const networkInfo = JSON.parse(fs.readFileSync(`zos.${networkName}.json`));
const appAddress = networkInfo.app.address;
const proxyAddress = networkInfo.proxies[contractName][0].address;

// Use the zos-lib App model and call changeProxyAdmin to set the new admin
const app = await App.fetch(appAddress);
await app.changeProxyAdmin(proxyAddress, newAdmin);
```

After this is run, the upgradeability admin of the `EthBox` instance is the multisig wallet itself. Nonetheless, keep in mind that **the owner of the ZeppelinOS App is still the original account**. This means that it is still possible to manage other contract instances (including other instances of `EthBox`, should you have created any), or deploy new logic contracts, from the CLI. Let's try the latter by registering an `EthBoxV2` and deploying the logic contract to the blockchain.

The following commands will register the contract `EthBoxV2` as the new implementation for `EthBox`, deploy it, and register it; all from the CLI.

```sh
$ npx zos add EthBoxV2:EthBox
$ npx zos push --skip-compile --network local
```

However, if we try to upgrade our existing `EthBox` instance to the new version, we'll get an error, since we no longer have permission to do so. This control has been transferred to the multisig.

```sh
$ npx zos update --all --network local
Upgrading EthBox proxy without running migrations...
Proxy EthBox at 0x6e14585e57504e89a82e3cd68c30c849bb7c3583 failed to upgrade
```

Indeed, if we try to call the `getBalance` function in the existing contract, we'll get zero as a response, since the function does not yet exist in this instance:

```js
truffle(local)> EthBoxV2.at(MY_ETHBOX_ADDRESS).getBalance(owner1).then(n => n.toNumber())
0
```

Let's use the multisig to upgrade our `EthBox` instance to V2. To do this, we need to first submit the transaction to the multisig, and wait for one of the other owners to approve it. The script `submit-upgrade` takes care of submitting the upgrade request to the multisig.

```sh
$ npx truffle exec submit-upgrade.js EthBox MULTISIG_ADDRESS --network local
```

The script will retrieve the address where the `EthBoxV2` logic contract was deployed, the address of our `EthBox` instance, and submit the transaction to the multisig. Note that this can also be done via the Gnosis MultiSigWallet GUI, the script is just provided for convenience.

```js
// Retrieve info from zos.local.json
const networkInfo = JSON.parse(fs.readFileSync(`zos.${networkName}.json`));
const proxyAddress = networkInfo.proxies[contractName][0].address;
const implementationAddress = networkInfo.contracts[contractName].address;

// Submit transaction to the multisig wallet, using zos-lib encodeCall helper
const multisig = MultiSigWallet.at(multisigAddress);
const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress]);
multisig.submitTransaction(proxyAddress, 0, upgradeCallData, { from: owner1 });
```

At this point, the upgrade request was just submitted to the multisig, but is awaiting approval by one of the other wallet owners (as we have a 2-out-of-3 setup). _This is key to the decentralization process, as it guarantees that no single account can decide when an instance is upgraded._

Indeed, if we try to query `getBalance`, we'll still get the old invalid result:
```js
truffle(local)> EthBoxV2.at(MY_ETHBOX_ADDRESS).getBalance(owner1).then(n => n.toNumber())
0
```

We can now move onto the last step, which is confirming the multisig transaction, which will trigger the update. We can do this either from the multisig GUI or from a console. Note that if you have submitted other transactions to this multisig, you'll need to replace `0` with the correct transaction id.
```js
truffle(local)> multisig.confirmTransaction(0, { from: owner2 })

```

If we now attempt to query `getBalance`, we'll get the correct result, as the contract was successfully upgraded and can now respond to the new function. 
```js
truffle(local)> EthBoxV2.at(MY_ETHBOX_ADDRESS).getBalance(owner1).then(n => n.toNumber())
1000000000000000000
```

We can also use the `query.js` script to check the address of the logic contract being used by our `EthBox` instance, which uses the [`Proxy#implementation`](https://github.com/zeppelinos/zos-lib/blob/master/src/utils/Proxy.js#L10-L13) method from `zos-lib`.

```bash
$ npx truffle exec query.js EthBox --network local
```

This should output the address of the `EthBoxV2` logic contract, which you can check against the file `zos.local.json`, ensuring that the upgrade was indeed successful.
