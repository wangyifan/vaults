const Web3 = require('web3');
const TruffleConfig = require('../truffle-config');
const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");

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

        const vaultxAddress = "0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0";
        vaultx = await vaultX.at(vaultxAddress);

        // call depositNative
        const user = accounts[0];
        const etherValue = ether("0.01");

        // first sleep 120 seconds
        await sleep(120000);

        for(var i=0;i<5000;i++) {
            tx = await vaultx.depositNative({from: user, value: etherValue});
            console.log("Index:", i, "ether:", etherValue, "tx:", tx);

            var rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 120 seconds, create a gap in events
                await sleep(120000);
            } else {
                await sleep(10000);
            }
        }
    }
};
