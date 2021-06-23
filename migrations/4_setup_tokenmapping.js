const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");
var vaultY = artifacts.require("VaultY");

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const vaultx = await vaultX.deployed();
        const vaulty = await vaultY.deployed();

        // setup token mapping
        var sourceChainid = await web3.eth.getChainId();
        const admin = accounts[0];
        var nativeToken = web3.utils.toChecksumAddress("0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" + sourceChainid.toString()).substring(26));
        console.log("Native token:", nativeToken);
        var sourceToken = nativeToken;
        const mappedToken = "0x8553cE822a9072b5fF0992Da9A61D5CE54a1F5Df";
        const mappedChainid = 95125;
        const sourceTokenSymbol = "abc";
        const mappedTokenSymbol = "xyz";
        const tipRate = 10;

        //////////////////////////////////////
        /////////// Vault X
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

        ///////////////////////////////////////
        //////////// Vault Y
        const receipt3 = await vaulty.setupTokenMapping(
            sourceChainid,
            sourceToken,
            mappedToken,
            sourceTokenSymbol,
            mappedTokenSymbol,
            tipRate,
            {from: admin}
        );

        // unpause the token mapping
        const receipt4 = await vaulty.unpauseTokenMapping(
            sourceToken,
            mappedToken,
            {from: admin}
        );
    }
};
