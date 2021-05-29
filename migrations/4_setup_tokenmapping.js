const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const vaultxAddress = "0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0";
        vaultx = await vaultX.at(vaultxAddress);

        // setup token mapping
        const admin = accounts[0];
        const sourceToken = "0x91228250705AF76cB0f7EbC128d27d532F36cfF9";
        const mappedToken = "0x0000000000000000000000000000000000000001";
        const mappedChainid = 101;
        const mappedTokenSymbol = "xyz";
        const receipt1 = await vaultx.setupTokenMapping(
            sourceToken,
            mappedChainid,
            mappedToken,
            mappedTokenSymbol,
            {from: admin}
        );

        // unpause the token mapping
        const receipt2 = await vaultx.unpauseTokenMapping(
            sourceToken,
            mappedToken,
            {from: admin}
        );
    }
};
