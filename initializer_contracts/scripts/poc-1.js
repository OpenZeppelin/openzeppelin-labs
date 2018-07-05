function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTransactionReceipt(txid) {
  while (true) {
    const receipt = await pweb3.eth.getTransactionReceipt(txid);

    if (receipt) {
      return receipt;
    } else {
      await sleep(100);
    }
  }
}

async function deploy(bytecode) {
  const tx = await pweb3.eth.sendTransaction({
    from: (await pweb3.eth.getAccounts())[0],
    to: 0,
    value: 0,
    data: bytecode,
    gas: (await pweb3.eth.getBlock('latest')).gasLimit,
  });

  const receipt = await getTransactionReceipt(tx);

  return receipt.contractAddress;
}

async function main() {
  await run('compile');

  const Greeter = artifacts.require('Greeter');
  const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

  const implementation = await deploy(Greeter.bytecode);
  const constructor = await deploy(Greeter.bytecode.replace('0x', '0x600d80380380826000396000f3'));

  const admin = (await pweb3.eth.getAccounts())[1];
  const proxy = await AdminUpgradeabilityProxy.new(constructor, implementation, { from: admin });

  const greeter = new Greeter(proxy.address);

  console.log(`Greeting: ${ await greeter.greeting() }`);
  console.log(`Block Nr: ${ (await greeter.created()).toString() }`);
}

main().catch(console.error);
