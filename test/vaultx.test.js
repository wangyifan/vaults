// test/vaultx.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const VaultX = artifacts.require('VaultX'); // vault contract
const TestCoin = artifacts.require('XCoin'); // any other erc20 token
const sourceChainid = 110;
const mappedChainid = 110;
const sourceTokenSymbol = "abc";
const mappedTokenSymbol = "xyz";
const NATIVETOKEN = web3.utils.toChecksumAddress("0x" + web3.utils.soliditySha3(
    "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" + sourceChainid.toString()
).substring(26));
const gasPrice = 20000000000;

// Start test block
contract('VaultX', function ([ owner, user, user2, user3]) {
    beforeEach(async function () {
        this.vaultx = await VaultX.new(NATIVETOKEN, {from: owner});
        this.sourceToken = await TestCoin.new("Source Token", sourceTokenSymbol, 1000000, {from: owner});
        this.mappedToken = await TestCoin.new("Mapped Token", mappedTokenSymbol, 1000000, {from: owner});

        // #1 token mapping
        this.vaultx.setupTokenMapping(
            mappedChainid,
            NATIVETOKEN,
            this.mappedToken.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            10
        );
        this.vaultx.unpauseTokenMapping(NATIVETOKEN, this.mappedToken.address);
        // #2 token mapping
        this.vaultx.setupTokenMapping(
            mappedChainid,
            this.sourceToken.address,
            this.mappedToken.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            10
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

        const result = await expectRevert(
            this.vaultx.pauseAll({from: user}),
            "Caller is not a admin"
        );
        expect(await this.vaultx.paused()).to.equal(false);
    });

    it('Check if native token deposit works and its events', async function () {
        const etherValue = ether("1.23");
        // deposit nonce should be initialized to 0
        nonce = await this.vaultx.tokenMappingDepositNonce(NATIVETOKEN, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(0);

        // after depositing native token, it will be locked under the
        // control of the vault contract
        const receipt = await this.vaultx.depositNative(
            {from: user, value: etherValue}
        );

        expectEvent(
            receipt, 'TokenDeposit',
            {
                sourceChainid: sourceChainid.toString(),
                sourceToken: NATIVETOKEN,
                mappedChainid: mappedChainid.toString(),
                mappedToken: this.mappedToken.address,
                from: user,
                amount: etherValue.toString(),
                tip: ether("0.00123"),
                depositNonce: "0"
            }
        );

        balance = await web3.eth.getBalance(this.vaultx.address);
        expect(balance.toString()).to.equal(etherValue.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(NATIVETOKEN, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(1);
    });

    it('Check if native token deposit revert when contract is paused', async function () {
        const etherValue = ether("1.23");

        // deposit nonce should be initialized to 0, and paused flag to false
        nonce = await this.vaultx.tokenMappingDepositNonce(NATIVETOKEN, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(0);
        expect(await this.vaultx.paused()).to.equal(false);

        // pause the contract
        this.vaultx.pauseAll({from: owner});
        expect(await this.vaultx.paused()).to.equal(true);

        // deposit reverts if paused
        const result = await expectRevert(
            this.vaultx.depositNative({from: user, value: etherValue}),
            "Pausable: paused."
        );

        // balance should not change
        balance = await web3.eth.getBalance(this.vaultx.address);
        expect(balance.toString()).to.equal("0");

        // deposit nonce should not change
        nonce = await this.vaultx.tokenMappingDepositNonce(NATIVETOKEN, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(0);

        // unpause
        this.vaultx.unpauseAll({from: owner});

        // deposit again after unpause
        const receipt = await this.vaultx.depositNative({from: user, value: etherValue});

        // balance should increase
        balance = await web3.eth.getBalance(this.vaultx.address);
        expect(balance.toString()).to.equal(etherValue.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(NATIVETOKEN, this.mappedToken.address);
        expect(nonce.toNumber()).to.equal(1);
    });

    it('Check if erc20 token deposit works and its events', async function () {
        // mint test erc20 coin
        amount = 123000;
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
                sourceChainid: sourceChainid.toString(),
                sourceToken: this.sourceToken.address,
                mappedChainid: mappedChainid.toString(),
                mappedToken: this.mappedToken.address,
                from: user,
                amount: amount.toString(),
                tip: "123",
                depositNonce: "0"
            }
        );

        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal(amount.toString());

        // deposit nonce should increase by 1
        nonce = await this.vaultx.tokenMappingDepositNonce(
            this.sourceToken.address, this.mappedToken.address
        );
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

        // deposit reverts if paused
        const result = await expectRevert(
            this.vaultx.depositToken(
                this.sourceToken.address,
                amount,
                {from: user}
            ),
            "Pausable: paused."
        );

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
        const amountLocked = 30000;
        await this.sourceToken.mint(this.vaultx.address, amountLocked);

        // call withdraw
        const amount = 10000;
        const tipY = 10;
        var totalTip = 0;
        var tipX = 0;
        var totalTipX = 0;
        var totalTipY = 0;
        withdrawNonce = 0;
        for(i=0;i<3;i++){
            receipt = await this.vaultx.withdraw(
                this.sourceToken.address,
                this.mappedToken.address,
                user, amount, tipY, withdrawNonce
            );
            withdrawNonce += 1;
            totalTipY += tipY;
            tipX = (await this.vaultx.getTip(
                this.sourceToken.address,
                this.mappedToken.address,
                amount)).toNumber();
            totalTipX += tipX;
        }
        totalTip = totalTipX + totalTipY;

        // check balance before cashout
        var balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal(totalTip.toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((amountLocked - totalTip).toString());

        // check staging balance
        balance = await this.vaultx.cashoutBalance(this.sourceToken.address,owner);
        expect(balance.toString()).to.equal(totalTipX.toString());

        //cashout
        await this.vaultx.cashout(this.sourceToken.address, owner, totalTipX);

        // check balance after cashout
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        // what's left in the initial minted account should equal to tipy
        expect(balance.toString()).to.equal(totalTipY.toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((amountLocked-totalTip).toString());

        // check withdrawWatermark
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal(withdrawNonce.toString());
        expect(withdrawNonce).to.equal(3);
    });

    xit('Check if withdraw works when there is gap in nonce', async function () {
        // assume the vault has some erc20 token locked
        const amountLocked = 10000;
        await this.sourceToken.mint(this.vaultx.address, amountLocked);

        // call withdraw
        const amount = 1000;
        const tip = 1;
        for(i=0;i<3;i++){
            receipt = await this.vaultx.withdraw(
                this.sourceToken.address,
                this.mappedToken.address,
                user,
                amount,
                tip,
                i,
                {from: owner}
            );
        }
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toNumber()).to.equal(3);

        //  skip 3, 4
        for(i=5;i<8;i++){
            receipt = await this.vaultx.withdraw(
                this.sourceToken.address,
                this.mappedToken.address,
                user,
                amount,
                tip,
                i,
                {from: owner}
            );
        }
        // 0,1,2 has been deleted to false
        for(i=5;i<8;i++) {
            expect(await this.vaultx.tokenMappingWithdrawdone(this.sourceToken.address, this.mappedToken.address, i)).to.equal(true);
        }

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal("10000");
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal("0");

        //cashout
        await this.vaultx.cashout(this.sourceToken.address, owner, 6);
        await this.vaultx.cashout(this.sourceToken.address, user, 6000 - 12, {from: user});

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((4000+6).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((6000-12).toString());
        balance = await this.sourceToken.balanceOf(owner);
        expect(balance.toString()).to.equal("6");

        // check other variables
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal("3");

        // call ignore and one more withdraw #8
        await this.vaultx.skipWithdrawdone(
            this.sourceToken.address, this.mappedToken.address, 3, {from: owner}
        );
        await this.vaultx.skipWithdrawdone(
            this.sourceToken.address, this.mappedToken.address, 4, {from: owner}
        );

        receipt = await this.vaultx.withdraw(
            this.sourceToken.address,
            this.mappedToken.address,
            user,
            amount,
            tip,
            8,
            {from: owner}
        );

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((4000+6).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((6000-12).toString());

        // cash out
        await this.vaultx.cashout(this.sourceToken.address, owner, 1);
        await this.vaultx.cashout(this.sourceToken.address, user, 998, {from: user});

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((3000+7).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((7000-14).toString());

        // check other variables
        watermark = await this.vaultx.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal("9");
    });

    it('Check full test: deposit native and withdraw', async function () {
        // this test will deposit moac twice: 2 and 3 respectively
        // then withdaw once: 4
        const etherValue2 = ether("2");
        const etherValue3 = ether("3");
        const etherValue4 = ether("4");
        const etherValue5 = ether("5");

        // check balance
        var balance = await web3.eth.getBalance(this.vaultx.address);
        expect(balance.toString()).to.equal("0");
        var balanceUser = await web3.eth.getBalance(user);
        balanceUser = new BN(balanceUser, 10);

        // deposit native token 2
        var receipt = await this.vaultx.depositNative(
            {from: user, value: etherValue2}
        );

        // check balance
        balance = await web3.eth.getBalance(this.vaultx.address);
        expect(balance.toString()).to.equal(etherValue2.toString());
        balance = await web3.eth.getBalance(user);
        var gasCost = gasPrice * receipt['receipt']['gasUsed'];
        expect(balance.toString()).to.equal((Number(balanceUser) - etherValue2 - gasCost).toString());

        expectEvent(
            receipt, 'TokenDeposit',
            {
                sourceChainid: sourceChainid.toString(),
                sourceToken: NATIVETOKEN,
                mappedChainid: mappedChainid.toString(),
                mappedToken: this.mappedToken.address,
                from: user,
                amount: etherValue2.toString(),
                tip: ether("0.002"),
                depositNonce: "0"
            }
        );

        // deposit native token 3
        receipt = await this.vaultx.depositNative(
            {from: user, value: etherValue3}
        );

        expectEvent(
            receipt, 'TokenDeposit',
            {
                sourceChainid: sourceChainid.toString(),
                sourceToken: NATIVETOKEN,
                mappedChainid: mappedChainid.toString(),
                mappedToken: this.mappedToken.address,
                from: user,
                amount: etherValue3.toString(),
                tip: ether("0.003"),
                depositNonce: "1"
            }
        );

        balance = await web3.eth.getBalance(this.vaultx.address);
        expect(balance.toString()).to.equal(etherValue5.toString());

        // cashout
        var tipX = ether("0.005");
        var balanceBefore = await web3.eth.getBalance(user2);
        await this.vaultx.cashout(NATIVETOKEN, user2, tipX, {from: owner});
        var balanceAfter = await web3.eth.getBalance(user2);
        expect(Number(balanceAfter) - Number(balanceBefore)).to.equal(tipX.toNumber());

        vaultBalanceBefore = await web3.eth.getBalance(this.vaultx.address);
        // withdraw
        balanceBefore = await web3.eth.getBalance(user3);
        var amount = etherValue4;
        var tipY = ether("0.004");
        tipX = ether("0.004");
        receipt = await this.vaultx.withdraw(
            NATIVETOKEN,
            this.mappedToken.address,
            user3,
            amount,
            tipY,
            0
        );

        // cash out tip
        await this.vaultx.cashout(NATIVETOKEN, user2, tipX, {from: owner});
        expect((await this.vaultx.cashoutBalance(NATIVETOKEN, owner)).toString()).to.equal("0");

        // check balance
        balanceAfter = await web3.eth.getBalance(user3);
        var expectDiff = etherValue4.sub(tipX).sub(tipY);
        expect((Number(balanceAfter) - Number(balanceBefore)).toString()).to.equal(expectDiff.toString());

        vaultBalanceAfter = await web3.eth.getBalance(this.vaultx.address);
        expect((vaultBalanceBefore - vaultBalanceAfter).toString()).to.equal(
            etherValue4.sub(tipY).toString());
        // 5-0.005-0.004-(4-0.008) = 0.999
        expect(vaultBalanceAfter.toString()).to.equal(ether("0.999").toString());
    });

    it('Check full test: deposit erc20 and withdraw', async function () {
        // this test will deposit token twice: 2000 and 3000 respectively
        // then withdaw once: 4000
        var amount = 10000;
        await this.sourceToken.mint(user, amount);
        await this.sourceToken.approve(this.vaultx.address, 5000, {from: user});
        var allowance = await this.sourceToken.allowance(user, this.vaultx.address);
        expect(allowance.toString()).to.equal("5000");
        var receipt2000 = await this.vaultx.depositToken(this.sourceToken.address, 2000, {from: user});
        allowance = await this.sourceToken.allowance(user, this.vaultx.address);
        expect(allowance.toString()).to.equal("3000");
        var receipt3000 = await this.vaultx.depositToken(this.sourceToken.address, 3000, {from: user});

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((5000).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((5000).toString());

        // cashout
        var tipX = 5;
        await this.vaultx.cashout(this.sourceToken.address, owner, tipX);

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((5000 - tipX).toString());
        balance = await this.sourceToken.balanceOf(owner);
        expect(balance.toString()).to.equal((tipX).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((10000 - 2000 - 3000).toString());

        // withdraw
        amount = 4000;
        var tipY = 4;
        receipt = await this.vaultx.withdraw(
            this.sourceToken.address,
            this.mappedToken.address,
            user,
            amount,
            tipY,
            0
        );

        // cashout
        tipX = 4;
        await this.vaultx.cashout(this.sourceToken.address, owner, tipX, {from: owner});

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((4995 - amount + tipY).toString());
        balance = await this.sourceToken.balanceOf(owner);
        expect(balance.toString()).to.equal((5+4).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((5000+amount-8).toString());
    });
});
