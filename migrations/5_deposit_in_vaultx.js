const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const vaultxAddress = "0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0";
        vaultx = await vaultX.at(vaultxAddress);

        // call depositNative
        const user = accounts[0];
        const etherValue = ether("1.23");
        const receipt = await vaultx.depositNative({from: user, value: etherValue});
    }
};
