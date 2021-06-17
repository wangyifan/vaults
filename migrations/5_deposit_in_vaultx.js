const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const vaultxAddress = "0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0";
        vaultx = await vaultX.at(vaultxAddress);

        // call depositNative
        const user = accounts[0];
        const etherValue = ether("0.01");
        for(var i=0;i<5000;i++) {
            tx = await vaultx.depositNative({from: user, value: etherValue});
            console.log("Index:", i, "ether:", etherValue, "tx:", tx);
            await sleep(5000);
        }
    }
};
