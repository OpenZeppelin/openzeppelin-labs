const { ethers } = require('hardhat');
const { expect } = require('chai');
const { attach, deploy } = require('@amxx/hre/scripts');


const wait = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));


const ADDRESSES = {
    "Lib_AddressManager":                '0x5FbDB2315678afecb367f032d93F642f64180aa3', /* L1 & L2 */
    "ChainStorageContainer-CTC-batches": '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', /* L1      */
    "ChainStorageContainer-SCC-batches": '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', /* L1      */
    "CanonicalTransactionChain":         '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', /* L1 & L2 */
    "StateCommitmentChain":              '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', /* L1      */
    "BondManager":                       '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', /* L1      */
    "OVM_L1CrossDomainMessenger":        '0x0165878A594ca255338adfa4d48449f69242Eb8F', /* L1 & L2 */
    "Proxy__OVM_L1CrossDomainMessenger": '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318', /* L1 & L2 */
    "Proxy__OVM_L1StandardBridge":       '0x610178dA211FEF7D417bC0e6FeD39F05609AD788', /* L1      */
    "AddressDictator":                   '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e', /* L1      */
    "L2CrossDomainMessenger":            '0x4200000000000000000000000000000000000007', /*      L2 */
    "OVM_Sequencer":                     '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', /*         */
    "OVM_Proposer":                      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', /*         */
    "ChugSplashDictator":                '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1', /* L1      */
}


const MNEMONIC     = 'test test test test test test test test test test test junk';
const RELAYER_ROLE = ethers.utils.id('RELAYER_ROLE');
const L1           = {};
const L2           = {};


describe('Optimism Relay', function () {
    before(async function() {
        L1.provider  = ethers.getDefaultProvider('http://127.0.0.1:9545');
        L2.provider  = ethers.getDefaultProvider('http://127.0.0.1:8545');
        L1.signer    = ethers.Wallet.fromMnemonic(MNEMONIC).connect(L1.provider);
        L2.signer    = ethers.Wallet.fromMnemonic(MNEMONIC).connect(L2.provider);
        L1.messenger = await attach('L1CrossDomainMessenger',    ADDRESSES.Proxy__OVM_L1CrossDomainMessenger, { signer: L1.signer });
        L2.messenger = await attach('L2CrossDomainMessenger',    ADDRESSES.L2CrossDomainMessenger,            { signer: L2.signer });
        L1.manager   = await attach('Lib_AddressManager',        ADDRESSES.Lib_AddressManager,                { signer: L1.signer });
        L1.canonical = await attach('CanonicalTransactionChain', ADDRESSES.CanonicalTransactionChain,         { signer: L1.signer });
    });

    beforeEach(async function() {
        L1.instance  = await deploy('RelayOptimism', [ L1.messenger.address ], { signer: L1.signer });
        L2.instance  = await deploy('RelayOptimism', [ L2.messenger.address ], { signer: L2.signer });

        L1.instance.on(L1.instance.filters.CrossChainTxSent(), args => console.log('L1 CrossChainTxSent', args));
        L2.instance.on(L2.instance.filters.CrossChainTxSent(), args => console.log('L2 CrossChainTxSent', args));
        L1.instance.on(L1.instance.filters.CrossChainTxReceived(),  args => console.log('L1 CrossChainTxReceived', args));
        L2.instance.on(L2.instance.filters.CrossChainTxReceived(),  args => console.log('L2 CrossChainTxReceived', args));

        await L1.instance.setPair(L2.instance.address, { gasLimit: 100000 });
        await L2.instance.setPair(L1.instance.address, { gasLimit: 100000 });
        await L1.instance.grantRole(RELAYER_ROLE, L1.signer.address, { gasLimit: 100000 });
        await L2.instance.grantRole(RELAYER_ROLE, L2.signer.address, { gasLimit: 100000 });
    });

    // afterEach(() => wait(1000));

    it('sanity', async function () {
        const contracts = await Promise.all(Object.entries(ADDRESSES).map(
            ([ name, address ]) => Promise.all(
                [ L1, L2 ].map(chain => chain.provider.getCode(address).then(code => code.replace(/^0x/, '') != ''))
            ).then(([ isL1, isL2 ]) => [ name, { address, isL1, isL2 } ])
        )).then(Object.fromEntries);

        Object.entries(contracts).map(([ name, { address, isL1, isL2 } ]) => console.log(`[${address}] ${name.padEnd(36)} ${Number(isL1)} ${Number(isL2)}`));
    });

    describe('initial checks', function () {
        it('check state', async function () {
            expect(await L1.instance.pair()).to.be.equal(L2.instance.address);
            expect(await L2.instance.pair()).to.be.equal(L1.instance.address);
            expect(await L1.provider.getCode(L1.instance.address)).to.not.be.equal('0x');
            expect(await L2.provider.getCode(L2.instance.address)).to.not.be.equal('0x');
            expect(await L1.messenger.resolve('CanonicalTransactionChain')).to.be.equal(L1.canonical.address);

            console.log('L1.network:', await L1.provider.getNetwork().then(({ name, chainId }) => `${name}-${chainId}`));
            console.log('L2.network:', await L2.provider.getNetwork().then(({ name, chainId }) => `${name}-${chainId}`));
            console.log('L1.signer:',  L1.signer.address, await L1.provider.getBalance(L1.signer.address).then(ethers.utils.formatEther), ethers.constants.EtherSymbol);
            console.log('L2.signer:',  L2.signer.address, await L2.provider.getBalance(L2.signer.address).then(ethers.utils.formatEther), ethers.constants.EtherSymbol);
            console.log('L1.instance:', L1.instance.address);
            console.log('L2.instance:', L2.instance.address);
        });

        it.skip('check listeners', async function () {
            await L1.instance.emit(L1.instance.filters.CrossChainCallSubmitted(), 'test');
            await L2.instance.emit(L1.instance.filters.CrossChainCallSubmitted(), 'test');
            await L1.instance.emit(L1.instance.filters.CrossChainCallReceived(),  'test');
            await L2.instance.emit(L1.instance.filters.CrossChainCallReceived(),  'test');
        });
    });

    describe('cross chain calls', function () {
        it('L1 → L2', async function () {
            const target = ethers.constants.AddressZero;
            const value  = 0;
            const data   = '0x';
            const gas    = 1_000_000;

            const _message  = L1.instance.interface.encodeFunctionData('receiveCrossChainTx', [ target, value, data ]);
            const _nonce    = await L1.canonical.getQueueLength();
            const _gasLimit = 1_000_000; // hardcoded

            await expect(L1.instance.sendCrossChainTx(target, value, data, gas, { gasLimit: 1000000 }))
            .to.emit(L1.instance,  'CrossChainTxSent').withArgs(target, value, data)
            .to.emit(L1.messenger, 'SentMessage'     ).withArgs(L2.instance.address, L1.instance.address, _message, _nonce, _gasLimit)
        });

        it('L2 → L1', async function () {
            const target = ethers.constants.AddressZero;
            const value  = 0;
            const data   = '0x';
            const gas    = 1_000_000;

            const _message  = L2.instance.interface.encodeFunctionData('receiveCrossChainTx', [ target, value, data ]);
            const _nonce    = await L2.messenger.messageNonce();
            const _gasLimit = 1_000_000; // hardcoded

            await expect(L2.instance.sendCrossChainTx(target, value, data, gas, { gasLimit: 1000000 }))
            .to.emit(L2.instance,  'CrossChainTxSent').withArgs(target, value, data)
            .to.emit(L2.messenger, 'SentMessage'     ).withArgs(L1.instance.address, L2.instance.address, _message, _nonce, _gasLimit)
        });
    });
});