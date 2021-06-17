const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const vaultxAddress = "0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0";
        vaultx = await vaultX.at(vaultxAddress);

        // setup token mapping
        var sourceChainid = await web3.eth.getChainId();
        const admin = accounts[0];
        var nativeToken = web3.utils.toChecksumAddress("0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" + sourceChainid.toString()).substring(26));
        var sourceToken = nativeToken;
        const mappedToken = "0x0000000000000000000000000000000000000001";
        const mappedChainid = 101;
        const sourceTokenSymbol = "abc";
        const mappedTokenSymbol = "xyz";
        const tipRate = 10;
        const receipt1 = await vaultx.setupTokenMapping(
            mappedChainid,
            sourceToken,
            mappedToken,
            sourceTokenSymbol,
            mappedTokenSymbol,
            tipRate,
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
