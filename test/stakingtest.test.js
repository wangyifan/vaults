// test/stakingtest.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, time } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const StakingTest = artifacts.require('StakingTest'); // vault contract

// Start test block
contract('StakingTest', function ([ owner, staker1, staker2 ]) {
    beforeEach(async function () {
        this.stakingtest = await StakingTest.new(10, {from: owner});
    });

    xit('test update epochSize', async function () {
        var blockNumber = await time.latestBlock();
        var epochSize = await this.stakingtest.getEpochSize();
        console.log("1. block: ", blockNumber.toString(10), "epoch size: ", epochSize.toString(10));

        // mine 15 blocks
        var n = "15";
        var startingBlock = await time.latestBlock();
        var endBlock = startingBlock.add(new BN(n, 10));
        await time.advanceBlockTo(endBlock);

        for(var i=0;i<15;i++){
            await time.advanceBlock();
            var cc = await this.stakingtest.getBlockNumber();
            console.log("cc:" + cc.toString(10));
        }

        // epoch size
        blockNumber = await time.latestBlock();
        epochSize = await this.stakingtest.getEpochSize();
        var bb = await this.stakingtest.getBlockNumber();
        console.log(
            "2. block: ", blockNumber.toString(10),
            "epoch size: ", epochSize.toString(10),
            "bb: ", bb.toString(10),
            "end block: ", endBlock.toString(10),
        );

        // update epoch size to 8
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        await this.stakingtest.updateEpochSize(8);
        // mine 1 block
        await time.advanceBlock();
        console.log("updateEpochSize(8)");

        // epoch size
        blockNumber = await time.latestBlock();
        epochSize = await this.stakingtest.getEpochSize();
        nextEpochSize = await this.stakingtest.getNextEpochSize();
        console.log(
            "3. block: ", blockNumber.toString(10),
            "epoch size: ", epochSize.toString(10),
            "next epoch size:", nextEpochSize.toString(10),
        );

        // pivot
        var pivot = await this.stakingtest.getNextEpochPivot();
        console.log("4. block: ", blockNumber.toString(10), "pivot: ", pivot.toString(10));

        // mine 8 blocks
        n = "8";
        startingBlock = await time.latestBlock();
        endBlock = startingBlock.add(new BN(n, 10));
        await time.advanceBlockTo(endBlock);

        // epoch size
        blockNumber = await time.latestBlock();
        epochSize = await this.stakingtest.getEpochSize();
        console.log("5. block: ", blockNumber.toString(10), "epoch size: ", epochSize.toString(10));

        // call updateOnReadEpochSize()
        bb = await this.stakingtest.getBlockNumber();
        await this.stakingtest.updateOnReadEpochSize();
        console.log("updateOnReadEpochSize()");
        blockNumber = await time.latestBlock();
        epochSize = await this.stakingtest.getEpochSize();
        console.log(
            "6. block: ", blockNumber.toString(10),
            "epoch size: ", epochSize.toString(10),
            "bb: ", bb.toString(10),
        );

        const startingBlock = await time.latestBlock();
        const endBlock = startingBlock.addn(10);
        await time.advanceBlockTo(endBlock);

        blockNumber1 = await time.latestBlock();
        blockNumber2 = await this.stakingtest.getBlockNumber();
    });
});
