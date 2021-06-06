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

function calculateCost(receipt) {
    var gasCost = gasPrice * receipt['receipt']['gasUsed'];
    return [receipt['receipt']['gasUsed'], gasCost/1000000000000000000.0];
}

// Start test block
contract('VaultX', function ([ owner, user, user1, user2, user3, user4, user5]) {
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
                sourceToken: NATIVETOKEN,
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
                sourceToken: this.sourceToken.address,
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

        // tip cashout
        var balance = await this.vaultx.tipBalance(this.sourceToken.address);
        expect(balance.toString()).to.equal("123");
        await this.vaultx.tipCashout(this.sourceToken.address, user3, balance);
        balance = await this.sourceToken.balanceOf(user3);
        expect(balance.toString()).to.equal("123");
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
        balance = await this.vaultx.tipBalance(this.sourceToken.address);
        expect(balance.toString()).to.equal(totalTipX.toString());

        //cashout
        await this.vaultx.tipCashout(this.sourceToken.address, owner, totalTipX);

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
        await this.vaultx.tipCashout(this.sourceToken.address, owner, 6);
        await this.vaultx.tipCashout(this.sourceToken.address, user, 6000 - 12, {from: user});

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
        await this.vaultx.tipCashout(this.sourceToken.address, owner, 1);
        await this.vaultx.tipCashout(this.sourceToken.address, user, 998, {from: user});

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
                sourceToken: NATIVETOKEN,
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
                sourceToken: NATIVETOKEN,
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
        await this.vaultx.tipCashout(NATIVETOKEN, user2, tipX, {from: owner});
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
        await this.vaultx.tipCashout(NATIVETOKEN, user2, tipX, {from: owner});
        expect((await this.vaultx.tipBalance(NATIVETOKEN)).toString()).to.equal("0");

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
        await this.vaultx.tipCashout(this.sourceToken.address, owner, tipX);

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
        await this.vaultx.tipCashout(this.sourceToken.address, owner, tipX, {from: owner});

        // check balance
        balance = await this.sourceToken.balanceOf(this.vaultx.address);
        expect(balance.toString()).to.equal((4995 - amount + tipY).toString());
        balance = await this.sourceToken.balanceOf(owner);
        expect(balance.toString()).to.equal((5+4).toString());
        balance = await this.sourceToken.balanceOf(user);
        expect(balance.toString()).to.equal((5000+amount-8).toString());
    });

    it('Check role access functions', async function () {
        var omitNonces = [0, 1, 2];
        var skip = 3;
        var result = await expectRevert(
            this.vaultx.addNoncesToOmit(omitNonces, {from: user}),
            "Caller is not a nonce op"
        );

        result = await expectRevert(
            this.vaultx.removeNoncesToOmit(omitNonces, {from: user}),
            "Caller is not a nonce op"
        );

        result = await expectRevert(
            this.vaultx.skipWithdrawWatermark(
                this.sourceToken.address, this.mappedToken.address, skip, {from: user}),
            "Caller is not a nonce op"
        );

        result = await expectRevert(
            this.vaultx.refund(this.mappedToken.address, user, 10000, {from: user}),
            "Caller is not a refund op"
        );

        result = await this.vaultx.getRoles();
        var roleMap = new Map();
        for(var i=0;i<result.length;i++){
            roleMap[result[i].describe] = result[i].role;
        }

        // grant all roles to user
        result = await this.vaultx.addRoleMember(roleMap["refund op"], user);
        result = await this.vaultx.addRoleMember(roleMap["nonce op"], user);

        // check nonces functions
        expect(await this.vaultx.omitNonces.call(0)).to.equal(false);
        expect(await this.vaultx.omitNonces.call(1)).to.equal(false);
        expect(await this.vaultx.omitNonces.call(2)).to.equal(false);
        await this.vaultx.addNoncesToOmit(omitNonces, {from: user});
        expect(await this.vaultx.omitNonces.call(0)).to.equal(true);
        expect(await this.vaultx.omitNonces.call(1)).to.equal(true);
        expect(await this.vaultx.omitNonces.call(2)).to.equal(true);
        await this.vaultx.removeNoncesToOmit(omitNonces, {from: user});
        expect(await this.vaultx.omitNonces.call(0)).to.equal(false);
        expect(await this.vaultx.omitNonces.call(1)).to.equal(false);
        expect(await this.vaultx.omitNonces.call(2)).to.equal(false);

        // check watermark function
        var receipt = await this.vaultx.skipWithdrawWatermark(
            this.sourceToken.address, this.mappedToken.address, skip, {from: user}
        );
        expectEvent(
            receipt, "SkipNonce",
            {
                start: "0",
                step: "3"
            }
        );

        // check refund
        var amount = 10000;
        await this.sourceToken.mint(user, amount);
        await this.sourceToken.approve(this.vaultx.address, amount, {from: user});
        await this.vaultx.depositToken(
            this.sourceToken.address,
            amount,
            {from: user}
        );

        // tip has not been cashout yet, so the contract has all the token.
        var balanceBefore = await this.sourceToken.balanceOf(user);
        this.vaultx.refund(this.sourceToken.address, user, amount, {from: user});
        var balanceAfter = await this.sourceToken.balanceOf(user);
        expect(balanceAfter.sub(balanceBefore).toString()).to.equal(amount.toString());
    });

    it('check batch withdraw', async function () {
        await this.sourceToken.mint(this.vaultx.address, 100000);
        var typesArray = ["tuple(address, address, address, uint256, uint256, uint256)[]"];
        var parameters = [
            [
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user1,
                    10000,
                    10,
                    0
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user2,
                    10000,
                    10,
                    1
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user3,
                    10000,
                    10,
                    2
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user4,
                    10000,
                    10,
                    3
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user5,
                    10000,
                    10,
                    4
                ]
            ]
        ];
        var signature = Buffer.from("fake signature", "latin1");
        var tokenWithdraws = web3.eth.abi.encodeParameters(typesArray, parameters);
        var receipt = await this.vaultx.batchWithdraw(signature, tokenWithdraws);
        console.log("batchWithdraw() for [0, 1, 2, 3, 4]", calculateCost(receipt));
        expect((await this.sourceToken.balanceOf(user1)).toString()).to.equal((10000-10-10).toString());
        var tipBalance = await this.vaultx.tipBalance(this.sourceToken.address);
        expect(tipBalance.toString()).to.equal((50).toString());

        parameters = [
            [
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user1,
                    10000,
                    10,
                    5
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user2,
                    10000,
                    10,
                    6
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user3,
                    10000,
                    10,
                    7
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user4,
                    10000,
                    10,
                    8
                ],
                [
                    this.sourceToken.address,
                    this.mappedToken.address,
                    user5,
                    10000,
                    10,
                    9
                ]
            ]
        ];
        tokenWithdraws = web3.eth.abi.encodeParameters(typesArray, parameters);
        receipt = await this.vaultx.batchWithdraw(signature, tokenWithdraws);
        console.log("batchMint() for [5, 6, 7, 8, 9]", calculateCost(receipt));
    });
});
