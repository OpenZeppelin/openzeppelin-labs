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

// This is EVM assembly that, when used at the beginning of a contract, will
// return all of the code that follows it.
// 
// operation | bytecode   | stack representation
// =================================================
// push1 0C  | 0x60 0x0D  | 0x0C
// dup1      | 0x80       | 0x0C 0x0C
// codesize  | 0x38       | 0x0C 0x0C 0xCS
// sub       | 0x03       | 0x0C 0xIS
// dup1      | 0x80       | 0x0C 0xIS 0xIS
// dup3      | 0x82       | 0x0C 0xIS 0xIS 0x0C
// push1 00  | 0x60 0x00  | 0x0C 0xIS 0xIS 0x0C 0x00
// codecopy  | 0x39       | 0x0C 0xIS
// push1 00  | 0x60 0x00  | 0x0C 0xIS 0x00
// return    | 0xf3
const ASM_RETURN_REST = '0x600d80380380826000396000f3';

async function main() {
  await run('compile');

  const Greeter = artifacts.require('Greeter');
  const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

  const implementation = await deploy(Greeter.bytecode);
  const constructor = await deploy(Greeter.bytecode.replace('0x', ASM_RETURN_REST));

  const admin = (await pweb3.eth.getAccounts())[1];
  const proxy = await AdminUpgradeabilityProxy.new(constructor, implementation, { from: admin });

  const greeter = new Greeter(proxy.address);

  console.log(`Greeting: ${ await greeter.greeting() }`);
  console.log(`Block Nr: ${ (await greeter.created()).toString() }`);
}

main().catch(console.error);
