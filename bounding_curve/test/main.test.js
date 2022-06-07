const { ethers      } = require('hardhat');
const { deploy      } = require('@amxx/hre/scripts');
const { expect, use } = require('chai');
const { solidity    } = require('ethereum-waffle');
use(solidity);

describe('ERC4626BoundingCurve', function () {
    let admin;
    let token;
    let vault;

    beforeEach(async function() {
        [ admin, user ] = await ethers.getSigners();

        token = await deploy('ERC20Test', [
            'uName',
            'uSymbol',
        ]);
    });

    describe('with single curve', function () {
        beforeEach(async function() {
            vault = await deploy('ERC4626BoundingCurve', [
                'name',
                'symbol',
                token.address,
                ethers.utils.parseEther('0.80'),
                ethers.utils.parseEther('0.80'),
            ]);

            await token.mint(ethers.utils.parseEther('1000'));
            await token.approve(vault.address, ethers.constants.MaxUint256);

            await token.connect(user).mint(1_000_000_000);
            await token.connect(user).approve(vault.address, ethers.constants.MaxUint256);

            await vault.deposit(1_000_000_000, admin.address);
        });

        it('deposit', async function () {
            const assets = 1_000_000_000;

            for (const i of Array.range(3)) {
                await vault.previewDeposit(assets).then(value => console.log("[Before] previewDeposit: ", value.toString()));
                await vault.deposit(assets, admin.address);
                await vault.previewWithdraw(assets).then(value => console.log("[After ] previewWithdraw:", value.toString()));
                console.log('------------');
            };
        });

        it('mint', async function () {
            const shares = 1_000_000_000;

            for (const i of Array.range(3)) {
                await vault.previewMint(shares).then(value => console.log("[Before] previewMint:    ", value.toString()));
                await vault.mint(shares, admin.address);
                await vault.previewRedeem(shares).then(value => console.log("[After ] previewRedeem:  ", value.toString()));
                console.log('------------');
            };
        });

        it('deposit then redeem', async function() {
            await token.balanceOf(user.address).then(value => console.log("tokens deposited:", value.toString()));

            await vault.connect(user).deposit(1_000_000_000, user.address);
            const balance = vault.balanceOf(user.address);
            await vault.connect(user).redeem(balance, user.address, user.address);

            await token.balanceOf(user.address).then(value => console.log("tokens redeemed: ", value.toString()));
        });
    });

    describe('with dual curve', function () {
        beforeEach(async function() {
            vault = await deploy('ERC4626BoundingCurve', [
                'name',
                'symbol',
                token.address,
                ethers.utils.parseEther('0.80'),
                ethers.utils.parseEther('0.81'),
            ]);

            await token.mint(ethers.utils.parseEther('1000'));
            await token.approve(vault.address, ethers.constants.MaxUint256);

            await token.connect(user).mint(1_000_000_000);
            await token.connect(user).approve(vault.address, ethers.constants.MaxUint256);

            await vault.deposit(1_000_000_000, admin.address);
        });

        it('deposit', async function () {
            const assets = 1_000_000_000;

            for (const i of Array.range(3)) {
                await vault.previewDeposit(assets).then(value => console.log("[Before] previewDeposit: ", value.toString()));
                await vault.deposit(assets, admin.address);
                await vault.previewWithdraw(assets).then(value => console.log("[After ] previewWithdraw:", value.toString()));
                console.log('------------');
            };
        });

        it('mint', async function () {
            const shares = 1_000_000_000;

            for (const i of Array.range(3)) {
                await vault.previewMint(shares).then(value => console.log("[Before] previewMint:    ", value.toString()));
                await vault.mint(shares, admin.address);
                await vault.previewRedeem(shares).then(value => console.log("[After ] previewRedeem:  ", value.toString()));
                console.log('------------');
            };
        });

        it('deposit then redeem', async function() {
            await token.balanceOf(user.address).then(value => console.log("tokens deposited:", value.toString()));

            await vault.connect(user).deposit(1_000_000_000, user.address);
            const balance = vault.balanceOf(user.address);
            await vault.connect(user).redeem(balance, user.address, user.address);

            await token.balanceOf(user.address).then(value => console.log("tokens redeemed:  ", value.toString()));
        });
    });
});
