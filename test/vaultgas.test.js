// test/vaultgas.test.js
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
            0
        );
        this.vaulty.unpauseTokenMapping(NATIVETOKEN, this.mappedTokenNative.address);

        // #4 token mapping vaulty
        this.vaulty.setupTokenMapping(
            sourceChainid,
            this.sourceToken.address,
            this.mappedToken.address,
            sourceTokenSymbol,
            mappedTokenSymbol,
            0
        );
        this.vaulty.unpauseTokenMapping(this.sourceToken.address, this.mappedToken.address);

        // #5 grant mint to vaulty contract
        this.mappedTokenNative.grantMinter(this.vaulty.address, {from: owner});
        this.mappedToken.grantMinter(this.vaulty.address, {from: owner});
    });

    it('Gas benchmark: mint', async function () {
        const etherValue = ether("0.5");
        var nonce = 0;
        var tip = 1;
        var tokenDepositEvent = {
            //sourceChainid: sourceChainid.toString(),
            sourceToken: NATIVETOKEN,
            //mappedChainid: mappedChainid.toString(),
            mappedToken: this.mappedTokenNative.address,
            from: user,
            amount: etherValue.toString(),
            tip: tip.toString(),
            nonce: nonce
        };

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );

        console.log("mint(user): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );

        console.log("mint(user): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user2,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user2): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user2,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user2): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user2,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user2): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user3,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user3): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user3,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user3): ", calculateCost(receipt));

        receipt = await this.vaulty.mint(
            tokenDepositEvent.sourceToken,
            tokenDepositEvent.mappedToken,
            user3,
            tokenDepositEvent.amount,
            tokenDepositEvent.tip,
            nonce++,
            {from: owner}
        );
        console.log("mint(user3): ", calculateCost(receipt));
    });

    it('Gas benchmark: withdraw', async function () {
        var amount = 1000;
        var tipY = 1;
        var nonce = 0;

        // fund vaultx
        const etherValue = ether("1");
        var receipt = await this.vaultx.depositNative(
            {from: vaultxpool, value: etherValue}
        );

        var tokenBurnEvent = {
            sourceChainid: sourceChainid.toString(),
            sourceToken: NATIVETOKEN,
            mappedChainid: mappedChainid.toString(),
            mappedToken: this.mappedTokenNative.address,
            account: user,
            amount: amount.toString(),
            tip: tipY.toString(),
            burnNonce: nonce
        };

        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            user,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            nonce++
        );
        console.log("withdraw(user): ", calculateCost(receipt));

        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            user,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            nonce++
        );
        console.log("withdraw(user): ", calculateCost(receipt));

        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            user,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            nonce++
        );
        console.log("withdraw(user): ", calculateCost(receipt));

        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            user2,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            nonce++
        );
        console.log("withdraw(user2): ", calculateCost(receipt));

        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            user2,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            nonce++
        );
        console.log("withdraw(user2): ", calculateCost(receipt));

        receipt = await this.vaultx.withdraw(
            tokenBurnEvent.sourceToken,
            tokenBurnEvent.mappedToken,
            user2,
            tokenBurnEvent.amount,
            tokenBurnEvent.tip,
            nonce++
        );
        console.log("withdraw(user2): ", calculateCost(receipt));
    });
});
