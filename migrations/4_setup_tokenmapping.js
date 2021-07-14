const { BN, ether} = require('@openzeppelin/test-helpers');

var vaultX = artifacts.require("VaultX");
var vaultY = artifacts.require("VaultY");
var xcoin = artifacts.require("XCoin");

module.exports = async function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        /////////////////////////////////////////////////////////////
        // Setup[4]
        // 1. native    --- vault X 1  <-->  vault Y 1 --- mapped native coin
        // 2. native    --- vault X 2  <-->  vault Y 2 --- mapped native coin
        // 3. erc20 src --- vault X 1  <-->  vault Y 1 --- erc20 mapped
        // 4. erc20 src --- vault X 2  <-->  vault Y 2 --- erc20 mapped

        // vault x <--> vault y
        const vaultx1 = await vaultX.at('0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0');
        const vaulty1 = await vaultY.at('0xcCa8BAA2d1E83A38bdbcF52a9e5BbB530f50493A');
        // vault x 2 <--> vault y 2
        const vaultx2 = await vaultX.at('0xD493f82ec6a0C36d78c03C886134F718874088c8');
        const vaulty2 = await vaultY.at('0x58484ce21fb2Df4BeF146e65cd96e7f8E91E998E');

        // two mapped coins for native token
        const mapped_native_coin_1 = await xcoin.at('0x8553cE822a9072b5fF0992Da9A61D5CE54a1F5Df');
        const mapped_native_coin_2 = await xcoin.at('0xDE33f85C2E655FdF9Ab833DE7779E8eD66224ee2');
        // erc20 token pair 1
        const erc20_source_x_coin_1 = await xcoin.at('0x0454BC6DA193230c7c7C08c9F01Cf49f17e03aa9');
        const erc20_mapped_y_coin_1 = await xcoin.at('0x41c0f3518450b0e546671e5f61Ac50EEe61fa351');
        // erc20 token pair 2
        const erc20_source_x_coin_2 = await xcoin.at('0xfb8ce4134b4030EcBfEFd2909314D520872656e6');
        const erc20_mapped_y_coin_2 = await xcoin.at('0x1c436B435cCa513C8133DF5ED6b2CAFb460a6e04');

        console.log("\n\n");
        console.log("* vault x", vaultx1.address);
        console.log("* vault x2", vaultx2.address);
        console.log("* vault y", vaulty1.address);
        console.log("* vault y2", vaulty2.address);

        console.log("* mapped native coin 1", mapped_native_coin_1.address);
        console.log("* mapped native coin 2", mapped_native_coin_2.address);
        console.log("* erc20 source x coin 1", erc20_source_x_coin_1.address);
        console.log("* erc20 mapped x coin 1", erc20_mapped_y_coin_1.address);
        console.log("* erc20 source x coin 2", erc20_source_x_coin_2.address);
        console.log("* erc20 mapped x coin 2", erc20_mapped_y_coin_2.address);
        console.log("\n\n");

        // setup token mapping
        var sourceChainid = await web3.eth.getChainId();
        const admin = accounts[0];
        var nativeToken = web3.utils.toChecksumAddress(
            "0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" +
                                           sourceChainid.toString()).substring(26));
        console.log("Native token:", nativeToken);
        var sourceToken = nativeToken;
        var mappedToken = mapped_native_coin_1.address;
        var mappedChainid = 95125;
        var sourceTokenSymbol = "abc";
        var mappedTokenSymbol = "xyz";
        var tipRate = 10;

        //////////////////////////////////////
        /////////// vault X 1: native
        const receipt1 = await vaultx1.setupTokenMapping(
            mappedChainid,
            nativeToken,
            mappedToken,
            sourceTokenSymbol,
            mappedTokenSymbol,
            tipRate,
            {from: admin}
        );

        // unpause the token mapping
        const receipt2 = await vaultx1.unpauseTokenMapping(
            nativeToken,
            mappedToken,
            {from: admin}
        );

        ///////////////////////////////////////
        //////////// Vault Y 1: native
        const receipt3 = await vaulty1.setupTokenMapping(
            sourceChainid,
            nativeToken,
            mappedToken,
            sourceTokenSymbol,
            mappedTokenSymbol,
            tipRate,
            {from: admin}
        );

        // unpause the token mapping
        const receipt4 = await vaulty1.unpauseTokenMapping(
            nativeToken,
            mappedToken,
            {from: admin}
        );

        /////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////
        /////////// Vault X 1: erc20
        var sourceToken2 = erc20_source_x_coin_1.address;
        var mappedToken2 = erc20_mapped_y_coin_1.address;
        var sourceChainid2 = await web3.eth.getChainId();
        var mappedChainid2 = 95125;
        var sourceTokenSymbol2 = "abc2";
        var mappedTokenSymbol2 = "xyz2";
        var tipRate2 = 10;

        const receipt5 = await vaultx1.setupTokenMapping(
            mappedChainid2,
            sourceToken2,
            mappedToken2,
            sourceTokenSymbol2,
            mappedTokenSymbol2,
            tipRate2,
            {from: admin}
        );

        // unpause the token mapping
        const receipt6 = await vaultx1.unpauseTokenMapping(
            sourceToken2,
            mappedToken2,
            {from: admin}
        );

        ///////////////////////////////////////
        //////////// Vault Y 1: erc20
        const receipt7 = await vaulty1.setupTokenMapping(
            sourceChainid2,
            sourceToken2,
            mappedToken2,
            sourceTokenSymbol2,
            mappedTokenSymbol2,
            tipRate2,
            {from: admin}
        );

        // unpause the token mapping
        const receipt8 = await vaulty1.unpauseTokenMapping(
            sourceToken2,
            mappedToken2,
            {from: admin}
        );

        //////////////////////////////////////////////////////////////////
        /////////// vault X 2: native
        sourceToken = nativeToken;
        mappedToken = mapped_native_coin_2.address;
        mappedChainid = 95125;
        sourceTokenSymbol = "usa";
        mappedTokenSymbol = "cny";
        tipRate = 10;

        const receipt2_1 = await vaultx2.setupTokenMapping(
            mappedChainid,
            nativeToken,
            mappedToken,
            sourceTokenSymbol,
            mappedTokenSymbol,
            tipRate,
            {from: admin}
        );

        // unpause the token mapping
        const receipt2_2 = await vaultx2.unpauseTokenMapping(
            nativeToken,
            mappedToken,
            {from: admin}
        );

        ///////////////////////////////////////
        //////////// Vault Y 2: native
        const receipt2_3 = await vaulty2.setupTokenMapping(
            sourceChainid,
            nativeToken,
            mappedToken,
            sourceTokenSymbol,
            mappedTokenSymbol,
            tipRate,
            {from: admin}
        );

        // unpause the token mapping
        const receipt2_4 = await vaulty2.unpauseTokenMapping(
            nativeToken,
            mappedToken,
            {from: admin}
        );

        //////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////
        sourceToken2 = erc20_source_x_coin_2.address;
        mappedToken2 = erc20_mapped_y_coin_2.address;
        sourceChainid2 = await web3.eth.getChainId();
        mappedChainid2 = 95125;
        sourceTokenSymbol2 = "usa2";
        mappedTokenSymbol2 = "cny2";
        tipRate2 = 10;

        const receipt2_5 = await vaultx2.setupTokenMapping(
            mappedChainid2,
            sourceToken2,
            mappedToken2,
            sourceTokenSymbol2,
            mappedTokenSymbol2,
            tipRate2,
            {from: admin}
        );

        // unpause the token mapping
        const receipt2_6 = await vaultx2.unpauseTokenMapping(
            sourceToken2,
            mappedToken2,
            {from: admin}
        );

        ///////////////////////////////////////
        //////////// Vault Y 1: erc20
        const receipt2_7 = await vaulty2.setupTokenMapping(
            sourceChainid2,
            sourceToken2,
            mappedToken2,
            sourceTokenSymbol2,
            mappedTokenSymbol2,
            tipRate2,
            {from: admin}
        );

        // unpause the token mapping
        const receipt2_8 = await vaulty2.unpauseTokenMapping(
            sourceToken2,
            mappedToken2,
            {from: admin}
        );

        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        console.log('\n\n');
        result = await vaultx1.getTokenPairs();
        console.log(result);
        result = await vaulty1.getTokenPairs();
        console.log(result);

        console.log('\n\n');
        result = await vaultx2.getTokenPairs();
        console.log(result);
        result = await vaulty2.getTokenPairs();
        console.log(result);
    }
};
