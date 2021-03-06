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
        // vault x <--> vault y
        const vaultx1 = await vaultX.at('0xABE1A1A941C9666ac221B041aC1cFE6167e1F1D0');
        const vaulty1 = await vaultY.at('0xcCa8BAA2d1E83A38bdbcF52a9e5BbB530f50493A');
        // vault x 2 <--> vault y 2
        const vaultx2 = await vaultX.at('0xD493f82ec6a0C36d78c03C886134F718874088c8');
        const vaulty2 = await vaultY.at('0x58484ce21fb2Df4BeF146e65cd96e7f8E91E998E');

        // two mapped coins for native token
        const mapped_native_coin_1 = await Xcoin.at('0x8553cE822a9072b5fF0992Da9A61D5CE54a1F5Df');
        const mapped_native_coin_2 = await Xcoin.at('0xDE33f85C2E655FdF9Ab833DE7779E8eD66224ee2');
        // erc20 token pair 1
        const erc20_source_x_coin_1 = await Xcoin.at('0x0454BC6DA193230c7c7C08c9F01Cf49f17e03aa9');
        const erc20_mapped_y_coin_1 = await Xcoin.at('0x41c0f3518450b0e546671e5f61Ac50EEe61fa351');
        // erc20 token pair 2
        const erc20_source_x_coin_2 = await Xcoin.at('0xfb8ce4134b4030EcBfEFd2909314D520872656e6');
        const erc20_mapped_y_coin_2 = await Xcoin.at('0x1c436B435cCa513C8133DF5ED6b2CAFb460a6e04');

        // call depositNative
        const user = accounts[0];
        const etherValueN = 0.01;
        const etherValue = ether(etherValueN.toString());

        // first sleep 10 seconds
        await sleep(10000);

        console.log("\n\n");
        // check xcoin
        var totalSupplyBefore = await mapped_native_coin_1.totalSupply();
        console.log("mapped_native_coin_1 total supply before: ", totalSupplyBefore.toString(10));

        console.log("\n\n");
        /////////////////////////////////////////////////////////////////////
        // deposit everything
        var totalDeposit = 0;
        await erc20_source_x_coin_1.mint(user, ether("100"), {from: user});
        await erc20_source_x_coin_1.approve(
            vaultx1.address, ether("100"), {from: user}
        );
        await erc20_source_x_coin_2.mint(user, ether("100"), {from: user});
        await erc20_source_x_coin_2.approve(
            vaultx2.address, ether("100"), {from: user}
        );

        var depositCount = 0;
        for(var i=0;i<35;i++) {
            // deposit native vault x 1, one time
            var tx1 = vaultx1.depositNative({from: user, value: etherValue});
            /*console.log("[vaultx 1 native] Index:", i,
                        "ether:", etherValue.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            // deposit native vault x 2, two times
            var tx2 = vaultx2.depositNative({from: user, value: etherValue});
            /*console.log("[vaultx 2 native] Index:", i,
                        "ether:", etherValue.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            var tx3 = vaultx2.depositNative({from: user, value: etherValue});
            /*console.log("[vaultx 2 native] Index:", i,
                        "ether:", etherValue.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            // deposit erc20 vault x 1, two times
            var tx4 = vaultx1.depositToken(erc20_source_x_coin_1.address, etherValue, {from: user});
            /*console.log("[vaultx 1 erc20] Index:", i,
                        "ether:", etherValue.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            var tx5 = vaultx1.depositToken(erc20_source_x_coin_1.address, etherValue, {from: user});
            /*console.log("[vaultx 1 erc20] Index:", i,
                        "ether:", etherValue.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            // deposit erc20 vault x 2, one time
            var tx6 = vaultx2.depositToken(erc20_source_x_coin_2.address, etherValue, {from: user});
            /*console.log("[vaultx 2 erc20] Index:", i,
                        "ether:", etherValue.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                        );*/

            var txs = [tx1, tx2, tx3, tx4, tx5, tx6];
            for(var j=0;j<txs.length;j++) {
                var result = await txs[j];
                console.log(
                    "[deposit result await ", depositCount, "] block =",
                    result['receipt']['blockNumber'],
                    "index =", result['receipt']['transactionIndex'],
                    "status =", result['receipt']['status'],
                    "hash = ", result['tx']
                );
                depositCount++;
            }

            var rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 20 miliseconds, create a gap in events
                await sleep(20);
            } else {
                await sleep(5);
            }
        }

        console.log("\n\n");
        console.log("Sleep for 100 secs, waiting for xchain to mint");
        await sleep(100000);

        // check mapped coin
        console.log("\n\n");
        var totalSupplyAfter = await mapped_native_coin_1.totalSupply();
        console.log("mapped native coin 1 total supply after: ", totalSupplyAfter.toString(10));
        var balance = await mapped_native_coin_1.balanceOf(user);
        console.log("mapped native coin 1 balance of user: ", balance.toString(10));

        totalSupplyAfter = await mapped_native_coin_2.totalSupply();
        console.log("mapped native coin 2 total supply after: ", totalSupplyAfter.toString(10));
        balance = await mapped_native_coin_2.balanceOf(user);
        console.log("mapped native coin 2 balance of user: ", balance.toString(10));

        totalSupplyAfter = await erc20_mapped_y_coin_1.totalSupply();
        console.log("mapped erc20 coin 1 total supply after: ", totalSupplyAfter.toString(10));
        balance = await erc20_mapped_y_coin_1.balanceOf(user);
        console.log("mapped erc20 coin 1 balance of user: ", balance.toString(10));

        totalSupplyAfter = await erc20_mapped_y_coin_2.totalSupply();
        console.log("mapped erc20 coin 2 total supply after: ", totalSupplyAfter.toString(10));
        balance = await erc20_mapped_y_coin_2.balanceOf(user);
        console.log("mapped erc20 coin 2 balance of user: ", balance.toString(10));


        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        // burn from Vault Y
        const etherValueBurn = 0.003;
        const etherValueB = ether(etherValueBurn.toString());
        await mapped_native_coin_1.approve(
            vaulty1.address, ether("100"), {from: user}
        );
        await mapped_native_coin_2.approve(
            vaulty2.address, ether("100"), {from: user}
        );
        await erc20_mapped_y_coin_1.approve(
            vaulty1.address, ether("100"), {from: user}
        );
        await erc20_mapped_y_coin_2.approve(
            vaulty2.address, ether("100"), {from: user}
        );

        var burnCount = 0;
        for(i=0;i<35;i++) {
            tx1 = vaulty1.burn(mapped_native_coin_1.address, etherValueB, {from: user});
            /*console.log("[vaulty 1 native] Index:", i,
                        "ether:", etherValueB.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            tx2 = vaulty1.burn(erc20_mapped_y_coin_1.address, etherValueB, {from: user});
            /*console.log("[vaulty 1 erc20] Index:", i,
                        "ether:", etherValueB.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            tx3 = vaulty2.burn(mapped_native_coin_2.address, etherValueB, {from: user});
            /*console.log("[vaulty 2 native] Index:", i,
                        "ether:", etherValueB.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                       );*/
            tx4 = vaulty2.burn(erc20_mapped_y_coin_2.address, etherValueB, {from: user});
            /*console.log("[vaulty 2 erc20] Index:", i,
                        "ether:", etherValueB.toString(10),
                        "tx:", tx["tx"],
                        "block:", tx["receipt"]["blockNumber"]
                        );*/

            txs = [tx1, tx2, tx3, tx4];
            for(j=0;j<txs.length;j++) {
                result = await txs[j];
                console.log(
                    "[burn result await ", burnCount, "] block =",
                    result['receipt']['blockNumber'],
                    "index =", result['receipt']['transactionIndex'],
                    "status =", result['receipt']['status'],
                    "hash = ", result['tx']
                );
                burnCount++;
            }

            rndInt = Math.floor(Math.random() * 10) + 1;
            if (rndInt == 1 || rndInt == 2 ){
                // 20% chance, sleep 30 seconds, create a gap in events
                await sleep(30);
            } else {
                await sleep(5);
            }
        }
    }
};
