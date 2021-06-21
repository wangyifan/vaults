// test/allvaults.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const VaultX = artifacts.require('VaultX'); // vault contract
const VaultY = artifacts.require('VaultY'); // vault contract
const TestCoin = artifacts.require('XCoin'); // any other erc20 token
const sourceChainid = 110;
const mappedChainid = 110;
const sourceTokenSymbol = "abc";
const mappedTokenSymbol = "xyz";
const mappedTokenNativeSymbol = "xyzN";
const NATIVETOKEN = web3.utils.toChecksumAddress("0x" + web3.utils.soliditySha3(
    "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" + sourceChainid.toString()
).substring(26));
const gwei = 1000000000;
const gasPrice = 20 * gwei;

function calculateCost(receipt) {
    var gasCost = gasPrice * receipt['receipt']['gasUsed'];
    return [receipt['receipt']['gasUsed'], gasCost/1000000000000000000.0];
}

// Start test block
contract('VaultX & VaultY', function ([ owner, user, user2, user3, vaultxpool ]) {
    beforeEach(async function () {
        this.vaultx = await VaultX.new(NATIVETOKEN, {from: owner});
        this.vaulty = await VaultY.new({from: owner});
        this.sourceToken = await TestCoin.new(
            "SourceToken", sourceTokenSymbol, ether("1000000"), {from: owner}
        );
        this.mappedToken = await TestCoin.new(
            "MappedToken", mappedTokenSymbol, ether("1000000"), {from: owner}
        );
        this.mappedTokenNative = await TestCoin.new(
            "MappedTokenNative", mappedTokenNativeSymbol, ether("1000000"), {from: owner}
        );

        // #1 token mapping vaultx
        this.vaultx.setupTokenMapping(
            mappedChainid,
            NATIVETOKEN,
            this.mappedTokenNative.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            30
        );
        this.vaultx.unpauseTokenMapping(NATIVETOKEN, this.mappedTokenNative.address);
        // #2 token mapping vaultx
        this.vaultx.setupTokenMapping(
            mappedChainid,
            this.sourceToken.address,
            this.mappedToken.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            30
        );
        this.vaultx.unpauseTokenMapping(this.sourceToken.address, this.mappedToken.address);

        // #3 token mapping vaulty
        this.vaulty.setupTokenMapping(
            sourceChainid,
            NATIVETOKEN,
            this.mappedTokenNative.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            20
        );
        this.vaulty.unpauseTokenMapping(NATIVETOKEN, this.mappedTokenNative.address);

        // #4 token mapping vaulty
        this.vaulty.setupTokenMapping(
            sourceChainid,
            this.sourceToken.address,
            this.mappedToken.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            20
        );
        this.vaulty.unpauseTokenMapping(this.sourceToken.address, this.mappedToken.address);

        // #5 grant mint to vaulty contract
        this.mappedTokenNative.grantMinter(this.vaulty.address, {from: owner});
        this.mappedToken.grantMinter(this.vaulty.address, {from: owner});
    });

    it('full test native : deposit -> mint -> burn - > withdraw', async function () {
        //////////////////////////////////////////
        ////////////// DEPOSIT ///////////////////
        //////////////////////////////////////////
        const etherValue = ether("5");
        var receipt = await this.vaultx.depositNative(
            {from: user, value: etherValue}
        );
        //console.log("depositNative(): ", calculateCost(receipt));
        tip = (await this.vaultx.getTip(
            NATIVETOKEN,
            this.mappedTokenNative.address,
            etherValue));

        var tokenDepositEvent = {
                sourceToken: NATIVETOKEN,
                mappedToken: this.mappedTokenNative.address,
                from: user,
                amount: etherValue.toString(),
                tip: tip.toString(),
                nonce: "0"
        };

        expectEvent(receipt, 'TokenDeposit', tokenDepositEvent);

        var balancex = await web3.eth.getBalance(this.vaultx.address);
        expect(balancex.toString()).to.equal(etherValue.toString());
        // cashout balance
        var balanceowner = await this.vaultx.tipBalance(NATIVETOKEN);
        expect(balanceowner.toString()).to.equal(tip.toString());

        // owner cashout to user
        var balanceBefore = await web3.eth.getBalance(user);
        receipt = await this.vaultx.tipCashout(NATIVETOKEN, user, tip, {from: owner});
        //console.log("cashout(): ", calculateCost(receipt));
        var balanceAfter = await web3.eth.getBalance(user);
        // user balance increase
        expect((balanceAfter - balanceBefore).toString()).to.equal(tip.toString());
        balanceowner = await this.vaultx.tipBalance(NATIVETOKEN);
        expect(balanceowner.toString()).to.equal("0");
        // valutx balance decrease
        var balancexafter = await web3.eth.getBalance(this.vaultx.address);
        expect((balancex - balancexafter).toString()).to.equal(tip.toString());

        //////////////////////////////////////////
        //////////////   MINT  ///////////////////
        //////////////////////////////////////////
        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            tokenDepositEvent.nonce,
            {from: owner}
        );
        //console.log("mint(): ", calculateCost(receipt));
        // check cashout balance
        var amount = new BN(tokenDepositEvent.amount, 10);
        var tipX = new BN(tokenDepositEvent.tip, 10);
        var tipY = (await this.vaulty.getTip(
            NATIVETOKEN,
            this.mappedTokenNative.address,
            amount));
        var balance = await this.vaulty.tipBalance(this.mappedTokenNative.address);
        expect(balance.toString()).to.equal(tipY.toString());
        // check balance
        balance = await this.mappedTokenNative.balanceOf(user);
        expect(balance.toString()).to.equal(amount.sub(tipX).sub(tipY).toString());
        balance = await this.mappedTokenNative.balanceOf(owner);
        expect(balance.toString()).to.equal("0");

        // cashout
        receipt = await this.vaulty.tipCashout(this.mappedTokenNative.address, owner, tipY);
        //console.log("cashout(): ", calculateCost(receipt));

        // check cashout balance
        balance = await this.vaulty.tipBalance(this.mappedTokenNative.address);
        expect(balance.toString()).to.equal("0");
        balance = await this.vaulty.tipBalance(this.mappedTokenNative.address);
        expect(balance.toString()).to.equal("0");

        // check balance
        balance = await this.mappedTokenNative.balanceOf(user);
        expect(balance.toString()).to.equal(amount.sub(tipX).sub(tipY).toString());
        balance = await this.mappedTokenNative.balanceOf(owner);
        expect(balance.toString()).to.equal(tipY.toString());

        // check totalsupply
        var totalSupply = await this.mappedTokenNative.totalSupply();
        var balanceLocked = await web3.eth.getBalance(this.vaultx.address);
        expect(totalSupply.toString()).to.equal(balanceLocked.toString());

        //////////////////////////////////////////
        //////////////   BURN  ///////////////////
        //////////////////////////////////////////
        amount = ether("3");
        tipY = (await this.vaulty.getTip(
            NATIVETOKEN,
            this.mappedTokenNative.address,
            amount));
        ownerbalanceBefore = await this.mappedTokenNative.balanceOf(owner);
        // approve
        await this.mappedTokenNative.approve(this.vaulty.address, amount, {from: user});
        // burn
        receipt = await this.vaulty.burn(
            this.mappedTokenNative.address,
            amount,
            {from: user}
        );
        //console.log("burn(): ", calculateCost(receipt));
        tokenBurnEvent = {
            sourceToken: NATIVETOKEN,
            mappedToken: this.mappedTokenNative.address,
            from: user,
            amount: amount.toString(),
            tip: tipY.toString(),
            nonce: "0"
        };
        expectEvent(receipt, "TokenBurn", tokenBurnEvent);

        // check cashout balance
        balance = await this.vaulty.tipBalance(this.mappedTokenNative.address);
        expect(balance.toString()).to.equal("0");
        balance = await this.vaulty.tipBalance(this.mappedTokenNative.address);
        expect(balance.toString()).to.equal("0");

        // check balance
        ownerbalanceAfter = await this.mappedTokenNative.balanceOf(owner);
        expect(ownerbalanceAfter.sub(ownerbalanceBefore).toString()).to.equal(tipY.toString());
        // check totalsupply
        totalSupply = await this.mappedTokenNative.totalSupply();
        expect(totalSupply.toString()).to.equal(
            ether("5").sub(tipX).sub(ether("3")).add(tipY).toString()
        );
        userBalance = await this.mappedTokenNative.balanceOf(user);
        ownerBalance = await this.mappedTokenNative.balanceOf(owner);
        expect(totalSupply.toString()).to.equal(userBalance.add(ownerBalance).toString());

        //////////////////////////////////////////
        /////////////   WITHDRAW  ////////////////
        //////////////////////////////////////////
        balanceBefore = await web3.eth.getBalance(user);
        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            tokenBurnEvent.from,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            tokenBurnEvent.nonce
        );
        //console.log("withdraw(): ", calculateCost(receipt));
        // cashout balance
        tipY = new BN(tokenBurnEvent.tip, 10);
        tipX = (await this.vaultx.getTip(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            ether("3")
            ));

        balanceAfter = await web3.eth.getBalance(user);
        expect((balanceAfter - balanceBefore).toString()).to.equal(ether("3").sub(tipY).sub(tipX).toString());
        balance = await this.vaultx.tipBalance(NATIVETOKEN);
        expect(balance.toString()).to.equal(tipX.toString());
        receipt = await this.vaultx.tipCashout(NATIVETOKEN, owner, balance, {from: owner});
        //console.log("cashout(): ", calculateCost(receipt));

        // check totalsupply
        totalSupply = await this.mappedTokenNative.totalSupply();
        balanceLocked = await web3.eth.getBalance(this.vaultx.address);
        expect(totalSupply.toString()).to.equal(balanceLocked.toString());
    });

    it('full test erc20: deposit -> mint -> burn - > withdraw', async function () {
    });

    it('check token pair information', async function () {
        result = await this.vaultx.getTokenPairs();
        //console.log(result);
        expect(result.length).to.equal(2);
        result = await this.vaulty.getTokenPairs();
        //console.log(result);
        expect(result.length).to.equal(2);
    });
});
