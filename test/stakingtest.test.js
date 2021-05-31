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

    it('advance block', async function () {
        //const startingBlock = await time.latestBlock();
        //await time.advanceBlock();
        //expect(await time.latestBlock()).to.be.bignumber.equal(startingBlock.add(new BN(1)));

        blockNumber = await time.latestBlock();
        console.log(blockNumber.toString(10));
        await time.advanceBlockTo(blockNumber.add(new BN("20", 10)));
        blockNumber = await time.latestBlock();
        console.log(blockNumber.toString(10));
    });
});
