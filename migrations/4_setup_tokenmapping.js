const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");
var vaultY = artifacts.require("VaultY");
var xcoin = artifacts.require("XCoin");

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        const vaultx = await vaultX.at('0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0');
        const vaultx2 = await vaultX.at('0xD493f82ec6a0C36d78c03C886134F718874088c8');
        const vaulty = await vaultY.at('0xcCa8BAA2d1E83A38bdbcF52a9e5BbB530f50493A');
        const vaulty2 = await vaultY.at('0x58484ce21fb2Df4BeF146e65cd96e7f8E91E998E');

        const coin_set_1_vault_y_mapped_coin = await xcoin.at('0x8553cE822a9072b5fF0992Da9A61D5CE54a1F5Df');
        const coin_set_2_vault_y_mapped_coin = await xcoin.at('0xDE33f85C2E655FdF9Ab833DE7779E8eD66224ee2');
        const coin_set_1_erc20_source_x_coin = await xcoin.at('0x0454BC6DA193230c7c7C08c9F01Cf49f17e03aa9');
        const coin_set_1_erc20_mapped_y_coin = await xcoin.at('0x41c0f3518450b0e546671e5f61Ac50EEe61fa351');

        console.log("\n\n");
        console.log("* vault x", vaultx.address);
        console.log("* vault x2", vaultx2.address);
        console.log("* vault y", vaulty.address);
        console.log("* vault y2", vaulty2.address);

        console.log("* xcoin set 1 vault y mapped coin", coin_set_1_vault_y_mapped_coin.address);
        console.log("* xcoin set 2 vault y mapped coin", coin_set_2_vault_y_mapped_coin.address);
        console.log("* xcoin set 1 erc20 source coin", coin_set_1_erc20_source_x_coin.address);
        console.log("* xcoin set 1 erc20 mapped coin", coin_set_1_erc20_mapped_y_coin.address);
        console.log("\n\n");

        // setup token mapping
        var sourceChainid = await web3.eth.getChainId();
        const admin = accounts[0];
        var nativeToken = web3.utils.toChecksumAddress(
            "0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" +
                                           sourceChainid.toString()).substring(26));
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

        /////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////
        /////////// Vault X 2
        var sourceToken2 = nativeToken;
        const mappedToken2 = coin_set_2_vault_y_mapped_coin.address;
        const sourceChainid2 = await web3.eth.getChainId();
        const mappedChainid2 = 95125;
        const sourceTokenSymbol2 = "abc2";
        const mappedTokenSymbol2 = "xyz2";
        const tipRate2 = 10;

        const receipt5 = await vaultx2.setupTokenMapping(
            mappedChainid2,
            sourceToken2,
            mappedToken2,
            sourceTokenSymbol2,
            mappedTokenSymbol2,
            tipRate2,
            {from: admin}
        );

        // unpause the token mapping
        const receipt6 = await vaultx2.unpauseTokenMapping(
            sourceToken2,
            mappedToken2,
            {from: admin}
        );

        ///////////////////////////////////////
        //////////// Vault Y 2
        const receipt7 = await vaulty2.setupTokenMapping(
            sourceChainid2,
            sourceToken2,
            mappedToken2,
            sourceTokenSymbol2,
            mappedTokenSymbol2,
            tipRate2,
            {from: admin}
        );

        // unpause the token mapping
        const receipt8 = await vaulty2.unpauseTokenMapping(
            sourceToken2,
            mappedToken2,
            {from: admin}
        );

        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        console.log('\n\n');
        result = await vaultx.getTokenPairs();
        console.log(result);
        result = await vaulty.getTokenPairs();
        console.log(result);

        console.log('\n\n');
        result = await vaultx2.getTokenPairs();
        console.log(result);
        result = await vaulty2.getTokenPairs();
        console.log(result);
    }
};
