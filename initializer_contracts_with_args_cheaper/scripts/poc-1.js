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
    to: null,
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
// push1 0D  | 0x60 0x0D  | 0x0D
// dup1      | 0x80       | 0x0D 0x0D
// codesize  | 0x38       | 0x0D 0x0D 0xCS
// sub       | 0x03       | 0x0D 0xIS
// dup1      | 0x80       | 0x0D 0xIS 0xIS
// swap2     | 0x91       | 0xIS 0xIS 0x0D
// push1 00  | 0x60 0x00  | 0xIS 0xIS 0x0D 0x00
// codecopy  | 0x39       | 0xIS
// push1 00  | 0x60 0x00  | 0xIS 0x00
// return    | 0xf3
const ASM_RETURN_REST = '0x600d80380380916000396000f3';

function getArgs(contract, args) {
  return web3.eth.contract(contract.abi).new.getData(...args, { data: '0x' });
}

function prepareBytecode(bytecode) {
  return bytecode
    // Deploy the constructor itself
    .replace('0x', ASM_RETURN_REST)

    // Replace:
    //   60 40                   push1 40
    //   51                      mload
    //   61 02 e7                push2 02e7
    //   38                      codesize
    //   03                      sub
    //   80                      dup1
    //   61 02 e7                push2 02e7
    //   83                      dup4
    //   39                      codecopy
    // With:
    //   60 40                   push1 40
    //   51                      mload
    //  <61 00 00>               push2 0000
    //  <36>                     calldatasize
    //   03                      sub
    //   80                      dup1
    //  <61 00 00>               push2 0000
    //   83                      dup4
    //  <37>                     calldatacopy
    .replace('6040516102e73803806102e78339', '6040516100003603806100008337');
}

async function main() {
  await run('compile');

  const Greeter = artifacts.require('Greeter');
  const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

  const bytecode = {
    implementation: Greeter.bytecode,
    constructor: prepareBytecode(Greeter.bytecode),
  }

  const implementation = await deploy(bytecode.implementation);
  const constructor = await deploy(bytecode.constructor);

  const args = getArgs(Greeter, ["Hello world!"]);

  const admin = (await pweb3.eth.getAccounts())[1];
  const proxy = await AdminUpgradeabilityProxy.new(constructor, implementation, args, { from: admin });

  const greeter = new Greeter(proxy.address);

  console.log(`Greeting: ${ await greeter.greeting() }`);
  console.log(`Block Nr: ${ (await greeter.created()).toString() }`);
}

main().catch(console.error);
