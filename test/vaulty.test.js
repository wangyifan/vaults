// test/vaulty.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const VaultY = artifacts.require('VaultY'); // vault contract
const TestCoin = artifacts.require('XCoin'); // any other erc20 token
const sourceChainid = 110;
const mappedChainid = 110;
const sourceTokenSymbol = "abc";
const mappedTokenSymbol = "xyz";


// Start test block
contract('VaultY', function ([ owner, user, user1, user2 ]) {
    beforeEach(async function () {
        this.vaulty = await VaultY.new({from: owner});
        this.sourceToken = await TestCoin.new("Source Token", sourceTokenSymbol, 1000000, {from: owner});
        this.mappedToken = await TestCoin.new("Mapped Token", mappedTokenSymbol, 1000000, {from: owner});

        // #1 token mapping
        this.vaulty.setupTokenMapping(
            sourceChainid,
            this.sourceToken.address,
            this.mappedToken.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            10
        );
        this.vaulty.unpauseTokenMapping(this.sourceToken.address, this.mappedToken.address);

        // #2 grant mint to vault contract
        this.mappedToken.grantMinter(this.vaulty.address, {from: owner});
    });

    it('Check if pause and unpause work', async function () {
        // pause if from owner
        expect(await this.vaulty.paused()).to.equal(false);
        this.vaulty.pauseAll({from: owner});
        expect(await this.vaulty.paused()).to.equal(true);
        this.vaulty.unpauseAll({from: owner});
        expect(await this.vaulty.paused()).to.equal(false);

        const result = await expectRevert(
            this.vaulty.pauseAll({from: user1}),
            "Caller is not a admin"
        );
        expect(await this.vaulty.paused()).to.equal(false);
    });

    it('Check if mint new mapped coin and cashout', async function () {
        var mintNonce = 0;
        var amount = new BN("10000", 10);
        var tip = new BN("10", 10);
        var receipt = await this.vaulty.mint(
            this.sourceToken.address,
            this.mappedToken.address,
            user1,
            amount,
            tip,
            mintNonce++,
            {from: owner},
        );
        expectEvent(
            receipt, 'TokenMint',
            {
                sourceToken: this.sourceToken.address,
                mappedToken: this.mappedToken.address,
                to: user1,
                amount: "10000",
                tip: "10",
                mintNonce: "0"
            }
        );

        // tip balance
        var balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toNumber()).to.equal(0);
        // user1 balance
        balance = await this.mappedToken.balanceOf(user1);
        expect(balance.toNumber()).to.equal(0);

        // cashout from user1
        var cashoutAmount = await this.vaulty.cashoutBalance(this.mappedToken.address, user1);
        expect(cashoutAmount.toNumber()).to.equal(9980);
        receipt = await this.vaulty.cashout(
            this.mappedToken.address,
            user1,
            cashoutAmount,
            {from: user1}
        );
        balance = await this.mappedToken.balanceOf(user1);
        expect(balance.toNumber()).to.equal(9980);
        // cashout amount should be 0 after cashout
        cashoutAmount = await this.vaulty.cashoutBalance(this.mappedToken.address, user1);
        expect(cashoutAmount.toNumber()).to.equal(0);

        // cashout balance for owner
        cashoutAmount = await this.vaulty.cashoutBalance(this.mappedToken.address, owner);
        expect(cashoutAmount.toNumber()).to.equal(10);
    });


    it('Check if mint works if there is gap in nonce', async function () {
        // call mint
        const amount = 1000;
        const tip = 1;
        for(i=0;i<3;i++){
            receipt = await this.vaulty.mint(
                this.sourceToken.address,
                this.mappedToken.address,
                user,
                amount,
                tip,
                i,
                {from: owner}
            );
        }
        watermark = await this.vaulty.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toNumber()).to.equal(3);

        //  skip 3, 4
        for(i=5;i<8;i++){
            receipt = await this.vaulty.mint(
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
            expect(await this.vaulty.tokenMappingMintdone(
                this.sourceToken.address, this.mappedToken.address, i)).to.equal(true);
        }

        // check cashout balance
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, user);
        expect(balance.toString()).to.equal((6000-12).toString());
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, owner);
        expect(balance.toString()).to.equal("6");
        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal("0");
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal("0");

        //cashout
        await this.vaulty.cashout(this.mappedToken.address, owner, 6);
        await this.vaulty.cashout(this.mappedToken.address, user, 6000 - 12, {from: user});

        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal((6000-12).toString());
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal("6");

        // check other variables
        watermark = await this.vaulty.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal("3");

        // call ignore and one more withdraw #8
        await this.vaulty.skipMintdone(
            this.sourceToken.address, this.mappedToken.address, 3, {from: owner}
        );
        await this.vaulty.skipMintdone(
            this.sourceToken.address, this.mappedToken.address, 4, {from: owner}
        );

        receipt = await this.vaulty.mint(
            this.sourceToken.address,
            this.mappedToken.address,
            user,
            amount,
            tip,
            8,
            {from: owner}
        );

        // check cashout balance
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, user);
        expect(balance.toString()).to.equal((1000-2).toString());
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, owner);
        expect(balance.toString()).to.equal("1");
        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal("5988");
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal("6");

        // cash out
        await this.vaulty.cashout(this.mappedToken.address, owner, 1);
        await this.vaulty.cashout(this.mappedToken.address, user, 998, {from: user});

        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal((7000-14).toString());
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal((6+1).toString());

        // check other variables
        watermark = await this.vaulty.tokenMappingWatermark(
            this.sourceToken.address, this.mappedToken.address
        );
        expect(watermark.toString()).to.equal("9");
    });

    it('Check if burn works normally', async function () {
        // setup: user has 50000 coins
        var amount = 50000;
        await this.mappedToken.mint(user, amount);

        // approve
        await this.mappedToken.approve(this.vaulty.address, 30000, {from: user});

        amount = 10000;
        var tipY = 10;
        var totalTipY = 0;
        var burnNonce = 0;
        for(i=0;i<3;i++){
            var receipt = await this.vaulty.burn(
                this.mappedToken.address,
                amount,
                {from: user}
            );
            expectEvent(
                receipt, "TokenBurn",
                {
                    sourceChainid: sourceChainid.toString(),
                    sourceToken: this.sourceToken.address,
                    mappedChainid: mappedChainid.toString(),
                    mappedToken: this.mappedToken.address,
                    account: user,
                    amount: amount.toString(),
                    tip: tipY.toString(),
                    burnNonce: burnNonce.toString()
                }
            );
            burnNonce += 1;
            tipY = (await this.vaulty.getTip(
                this.sourceToken.address,
                this.mappedToken.address,
                amount)).toNumber();
            totalTipY += tipY;
        }
        // check balance
        var balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal("20000");
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal(totalTipY.toString());

        // check total supply
        totalSupply = await this.mappedToken.totalSupply();
        expect(totalSupply.toString()).to.equal("20030");
    });

    it('Check full test: mint and burn', async function () {
        // mint 3 x 10000 coins
        var amount = 10000;
        const tipX = 10;
        var mintNonce = 0;
        for(i=0;i<3;i++){
            receipt = await this.vaulty.mint(
                this.sourceToken.address,
                this.mappedToken.address,
                user,
                amount,
                tipX,
                mintNonce++,
                {from: owner}
            );
        }

        // check cashout balance
        var balance = await this.vaulty.cashoutBalance(this.mappedToken.address, user);
        expect(balance.toString()).to.equal((30000-60).toString());
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, owner);
        expect(balance.toString()).to.equal("30");
        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal("0");
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal("0");

        // cash out
        await this.vaulty.cashout(this.mappedToken.address, owner, 30);
        await this.vaulty.cashout(this.mappedToken.address, user, 30000-60, {from: user});

        // check cashout balance
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, user);
        expect(balance.toString()).to.equal("0");
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, owner);
        expect(balance.toString()).to.equal("0");
        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal((30000-60).toString());
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal("30");

        // check total supply
        var totalSupply = await this.mappedToken.totalSupply();
        expect(totalSupply.toString()).to.equal((30000-30).toString());

        // burn 20000 coins
        amount = 20000;
        // approve
        await this.mappedToken.approve(this.vaulty.address, 20000, {from: user});
        var receipt = await this.vaulty.burn(
            this.mappedToken.address,
            amount,
            {from: user}
        );
        // check total supply
        totalSupply = await this.mappedToken.totalSupply();
        expect(totalSupply.toString()).to.equal((30000 - 30 - (20000 - 20)).toString());

        // check cashout balance
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, user);
        expect(balance.toString()).to.equal("0");
        balance = await this.vaulty.cashoutBalance(this.mappedToken.address, owner);
        expect(balance.toString()).to.equal("0");
        // check balance
        balance = await this.mappedToken.balanceOf(user);
        expect(balance.toString()).to.equal((30000 - 60 - 20000).toString());
        balance = await this.mappedToken.balanceOf(owner);
        expect(balance.toString()).to.equal((30+20).toString());
    });
});