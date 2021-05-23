const Web3 = require('web3');
const TruffleConfig = require('../truffle-config');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

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
    }
};
