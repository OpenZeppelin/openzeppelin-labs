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
  console.log("Deploy cost", receipt.gasUsed);
  return {
    address: receipt.contractAddress,
    tx: receipt.transactionHash,
  };
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
    
    // Handle different contract sizes
    .replace(/60405161([0-9a-fA-F]{4})38038061(\1)8339/, '6040516100003603806100008337')
    .replace(/60405162([0-9a-fA-F]{6})38038062(\1)8339/, '60405162000000360380620000008337')

    // Optimize by removing everything after the ctor, including the codecopy that loads the runtime code into memory
    .replace(/6000396000f300.+/, '00')
}

async function gasUsedByTx(txHash) {
  return (await pweb3.eth.getTransactionReceipt(txHash)).gasUsed;
}

async function main() {
  await run('compile');

  const Contract = artifacts.require('MyToken');
  const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

  const bytecode = {
    implementation: Contract.bytecode,
    constructor: prepareBytecode(Contract.bytecode),
  }

  const implementation = await deploy(bytecode.implementation);
  const constructor = await deploy(bytecode.constructor);

  const args = getArgs(Contract, [100, "FooToken", "FOO", 8]);

  const admin = (await pweb3.eth.getAccounts())[1];
  const proxy = await AdminUpgradeabilityProxy.new(constructor.address, implementation.address, args, { from: admin });
  console.log(`Gas used by proxy: ${await gasUsedByTx(proxy.transactionHash)}`);

  const token = new Contract(proxy.address);
  console.log(`Name: ${ await token.name() }`);
}

main().catch(console.error);
