const Web3 = require('web3');
const TruffleConfig = require('../truffle-config');
const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");
var vaultY = artifacts.require("VaultY");
var Xcoin = artifacts.require("XCoin");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const password = "123456";
        const config = TruffleConfig.networks[network];
        const accountNeeded = 5;
        let web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.host + ':' + config.port));
        for (let i = 0; i < accountNeeded && i < accounts.length; i++) {
            console.log('>> Unlocking account ' + accounts[i]);
            await web3.eth.personal.unlockAccount(accounts[i], password, 0);
        }
        console.log(">> Unlocking done");

        //////////////////////////////////////////////////////
        const vaultx = await vaultX.deployed();
        const vaulty = await vaultY.deployed();
        const xcoin = await Xcoin.deployed();

        // call depositNative
        const user = accounts[0];
        const etherValue = ether("0.01");

        // first sleep 120 seconds
        await sleep(60000);

        console.log("\n\n");
        // check xcoin
        totalSupplyBefore = await xcoin.totalSupply();
        console.log("Xcoin total supply before: ", totalSupplyBefore.toString(10));

        console.log("\n\n");
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        // deposit from Vault X
        var totalDeposit = 0;
        for(var i=0;i<7;i++) {
            var tx = await vaultx.depositNative({from: user, value: etherValue});
            console.log("Index:", i, "ether:", etherValue.toString(10), "tx:", tx);
            totalDeposit += etherValue;

            var rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 60 seconds, create a gap in events
                await sleep(60000);
            } else {
                await sleep(10000);
            }
        }

        console.log("\n\n");
        console.log("Sleep for 100 secs, waiting for xchain to mint");
        await sleep(100000);

        // check xcoin
        console.log("\n\n");
        var totalSupplyAfter = await xcoin.totalSupply();
        console.log("Xcoin total supply after: ", totalSupplyAfter.toString(10));
        var balance = await xcoin.balanceOf(user);
        console.log("Xcoin balance of user: ", balance.toString(10));


        console.log("\n\n");
        const etherValue2 = ether("0.005");
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        // burn from Vault Y
        for(i=0;i<5;i++) {
            await xcoin.approve(vaulty.address, etherValue2);
            tx = await vaulty.burn(xcoin.address, etherValue2, {from: user});
            console.log("Index:", i, "ether:", etherValue2.toString(10), "tx:", tx);

            rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 60 seconds, create a gap in events
                await sleep(60000);
            } else {
                await sleep(10000);
            }
        }

        // no wait, start deposit immedeiately
        console.log("\n\n");

        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        // deposit from Vault X
        for(i=0;i<6;i++) {
            tx = await vaultx.depositNative({from: user, value: etherValue});
            console.log("Index:", i, "ether:", etherValue.toString(10), "tx:", tx);
            totalDeposit += etherValue;

            rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 60 seconds, create a gap in events
                await sleep(60000);
            } else {
                await sleep(10000);
            }
        }

        console.log("\n\n");
        console.log("Sleep for 100 secs, waiting for xchain to mint");
        await sleep(100000);

        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        // burn from Vault Y
        for(i=0;i<10;i++) {
            await xcoin.approve(vaulty.address, etherValue2);
            tx = await vaulty.burn(xcoin.address, etherValue2, {from: user});
            console.log("Index:", i, "ether:", etherValue2.toString(10), "tx:", tx);

            rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 60 seconds, create a gap in events
                await sleep(60000);
            } else {
                await sleep(10000);
            }
        }

    }
};
