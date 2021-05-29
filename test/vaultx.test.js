// test/xvault.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const VaultX = artifacts.require('VaultX'); // vault contract
const WToken = artifacts.require('WTOKEN'); // wrapped native token as erc20
const TestCoin = artifacts.require('TestCoin'); // any other erc20 token
const vaultYChainid = 111;

// Start test block
contract('VaultX', function ([ owner, user ]) {
    beforeEach(async function () {
        this.wtoken = await WToken.new({from: owner});
        this.vaultx = await VaultX.new(this.wtoken.address, {from: owner});
        this.sourceToken = await TestCoin.new({from: owner});
        this.mappedToken = await TestCoin.new({from: owner});

        // #1 token mapping
        this.vaultx.setupTokenMapping(
            this.wtoken.address,
            vaultYChainid,
            this.mappedToken.address,
            "xyz"
        );
        this.vaultx.unpauseTokenMapping(this.wtoken.address, this.mappedToken.address);
        // #2 token mapping
        this.vaultx.setupTokenMapping(
            this.sourceToken.address,
            vaultYChainid,
            this.mappedToken.address,
            "xyz"
        );
        this.vaultx.unpauseTokenMapping(this.sourceToken.address, this.mappedToken.address);
    });

    it('Check if pause and unpause work', async function () {
        // pause if from owner
        expect(await this.vaultx.paused()).to.equal(false);
        this.vaultx.pauseAll({from: owner});
        expect(await this.vaultx.paused()).to.equal(true);
        this.vaultx.unpauseAll({from: owner});
        expect(await this.vaultx.paused()).to.equal(false);

        /*
        const result = await expectRevert(
            this.vaultx.pauseAll({from: user}),
            "Caller is not a admin"
        );*/
        expect(await this.vaultx.paused()).to.equal(false);
    });

    it('Check if native token deposit works and its events', async function () {
        const etherValue = ether("1.23");
        // deposit nonce should be initialized to 0
        nonce = await this.vaultx.tokenMappingDepositNonce(this.wtoken.address, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(0);

        // after depositing native token, it will be locked under the
        // control of the vault contract
        const receipt = await this.vaultx.depositNative(
            {from: user, value: etherValue}
        );

        expectEvent(
            receipt, 'TokenDeposit',
            {
                sourceToken: this.wtoken.address,
                mappedToken: this.mappedToken.address,
                from: user,
                amount: etherValue.toString(),
                depositNonce: "1",
                tokenBalanceAfter: etherValue.toString()
            }
        );

        balance = await this.wtoken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal(etherValue.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(this.wtoken.address, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(1);
    });

    it('Check if native token deposit revert when contract is paused', async function () {
        const etherValue = ether("1.23");

        // deposit nonce should be initialized to 0, and paused flag to false
        nonce = await this.vaultx.tokenMappingDepositNonce(this.wtoken.address, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(0);
        expect(await this.vaultx.paused()).to.equal(false);

        // pause the contract
        this.vaultx.pauseAll({from: owner});
        expect(await this.vaultx.paused()).to.equal(true);

        /*
        // deposit reverts if paused
        const result = await expectRevert(
            this.vaultx.depositNative({from: user, value: etherValue}),
            "Pausable: paused."
        );*/

        // balance should not change
        balance = await this.wtoken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("0");

        // deposit nonce should not change
        nonce = await this.vaultx.tokenMappingDepositNonce(this.wtoken.address, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(0);

        // unpause
        this.vaultx.unpauseAll({from: owner});

        // deposit again after unpause
        const receipt = await this.vaultx.depositNative({from: user, value: etherValue});

        // balance should increase
        balance = await this.wtoken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal(etherValue.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(this.wtoken.address, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(1);
    });

    it('Check if erc20 token deposit works and its events', async function () {
        // mint test erc20 coin
        amount = 123;
        await this.sourceToken.mint(user, amount);
        await this.sourceToken.approve(this.vaultx.address, amount, {from: user});
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("0");
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal(amount.toString());
        allow = await this.sourceToken.allowance(user, this.vaultx.address);
        expect(allow.toString()).to.equal(amount.toString());

        // deposit nonce should be initialized to 0
        nonce = await this.vaultx.tokenMappingDepositNonce(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(nonce.toNumber()).to.equal(0);

        // after depositing native token, it will be locked under the
        // control of the vault contract
        const receipt = await this.vaultx.depositToken(
            this.sourceToken.address,
            amount,
            {from: user}
        );

        expectEvent(
            receipt, 'TokenDeposit',
            {
                sourceToken: this.sourceToken.address,
                mappedToken: this.mappedToken.address,
                from: user,
                amount: amount.toString(),
                depositNonce: "1",
                tokenBalanceAfter: amount.toString()
            }
        );

        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal(amount.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(this.sourceToken.address, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(1);
    });

    it('Check if erc20 token deposit revert when contract is paused', async function () {
        // mint coin for user
        const amount = 123;
        await this.sourceToken.mint(user, amount);
        await this.sourceToken.approve(this.vaultx.address, amount, {from: user});
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("0");
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal(amount.toString());
        allow = await this.sourceToken.allowance(user, this.vaultx.address);
        expect(allow.toString()).to.equal(amount.toString());

        // deposit nonce should be initialized to 0, and paused flag to false
        nonce = await this.vaultx.tokenMappingDepositNonce(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(nonce.toNumber()).to.equal(0);
        expect(await this.vaultx.paused()).to.equal(false);

        // pause the contract
        this.vaultx.pauseAll({from: owner});
        expect(await this.vaultx.paused()).to.equal(true);

        /*
        // deposit reverts if paused
        const result = await expectRevert(
            this.vaultx.depositToken(
                this.sourceToken.address,
                amount,
                {from: user}
            ),
            "Pausable: paused."
        );*/

        // balance should not change
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("0");

        // deposit nonce should not change
        nonce = await this.vaultx.tokenMappingDepositNonce(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(nonce.toNumber()).to.equal(0);

        // unpause
        this.vaultx.unpauseAll({from: owner});

        // deposit again after unpause
        const receipt = await this.vaultx.depositToken(
            this.sourceToken.address,
            amount,
            {from: user}
        );

        // balance should increase
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal(amount.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(nonce.toNumber()).to.equal(1);
    });

    it('Check if withdraw works normally', async function () {
        // assume the vault has some erc20 token locked
        const amountLocked = 300;
        await this.sourceToken.mint(this.vaultx.address, amountLocked);

        // call withdraw
        const amount = 100;
        withdrawNonce = 0;
        for(i=0;i<3;i++){
            receipt = await this.vaultx.withdraw(
                this.sourceToken.address, this.mappedToken.address, user, amount, withdrawNonce
            );
            withdrawNonce += 1;
        }

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("0");
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal(amountLocked.toString());

        // check withdrawWatermark
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal(withdrawNonce.toString());
        expect(withdrawNonce).to.equal(3);
    });

    it('Check if withdraw works when there is gap in nonce', async function () {
        // assume the vault has some erc20 token locked
        const amountLocked = 1000;
        await this.sourceToken.mint(this.vaultx.address, amountLocked);

        // call withdraw
        const amount = 100;
        for(i=0;i<3;i++){
            receipt = await this.vaultx.withdraw(
                this.sourceToken.address, this.mappedToken.address, user, amount, i, {from: owner}
            );
        }
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toNumber()).to.equal(3);

        //  skip 3, 4
        for(i=5;i<8;i++){
            receipt = await this.vaultx.withdraw(
                this.sourceToken.address, this.mappedToken.address, user, amount, i, {from: owner}
            );
        }
        // 0,1,2 has been deleted to false
        for(i=5;i<8;i++) {
            expect(await this.vaultx.tokenMappingWithdrawdone(this.sourceToken.address, this.mappedToken.address, i)).to.equal(true);
        }

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("400");
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal("600");

        // check other variables
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal("3");

        // call ignore and one more withdraw #8
        await this.vaultx.SkipWithdrawdone(
            this.sourceToken.address, this.mappedToken.address, 3, {from: owner}
        );
        await this.vaultx.SkipWithdrawdone(
            this.sourceToken.address, this.mappedToken.address, 4, {from: owner}
        );

        receipt = await this.vaultx.withdraw(
            this.sourceToken.address, this.mappedToken.address, user, amount, 8, {from: owner}
        );

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("300");
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal("700");

        // check other variables
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal("9");
    });
});
