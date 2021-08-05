const { ether} = require('@openzeppelin/test-helpers');

var wToken = artifacts.require("WTOKEN");
var vaultX = artifacts.require("VaultX");
var vaultX2 = artifacts.require("VaultX");
var vaultY = artifacts.require("VaultY");
var vaultY2 = artifacts.require("VaultY");
var vssBase = artifacts.require("VssBase");
var xEvents = artifacts.require("XEvents");
var mappedNativeCoin1 = artifacts.require("XCoin");
var mappedNativeCoin2 = artifacts.require("XCoin");
var erc20SourceCoin1 = artifacts.require("XCoin");
var erc20MappedCoin1 = artifacts.require("XCoin");
var erc20SourceCoin2 = artifacts.require("XCoin");
var erc20MappedCoin2 = artifacts.require("XCoin");

module.exports = function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        deployer.then(async () => {
            var sourceChainid = await web3.eth.getChainId();
            console.log(sourceChainid);
            var nativeToken = web3.utils.toChecksumAddress(
                "0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" +
                                               sourceChainid.toString()).substring(26));

            ////////////////////////////////////////
            await deployer.deploy(wToken);
            await deployer.deploy(vaultX, nativeToken);
            await deployer.deploy(vaultY);
            var threshold = 2;
            await deployer.deploy(vssBase, threshold);
            await deployer.deploy(xEvents);
            await deployer.deploy(mappedNativeCoin1,
                                  "xcoin1", "xco1", web3.utils.toWei("100000000", "ether"));

            /*
            const xchainAddressPubkeys = [
                ["0xc996264b44d35f9ae8291101760fb1ecffb445f5",
                 "0x9045469e9cf0d49c4629df0221939cfd07e1719d969c26672262e5e596139ff0"],
                ["0x7a7643c48bafaed8640eb22da93931b54b7cc657",
                 "0x07637aeee19f6bedb6736a62daff7abc72a8c369500ab3117c65b18a29ece60a"],
                ["0xf38562a301ddc57e7d2d3d22ab3a18352f60c66c",
                 "0x2ada70e73403f64a6a62569125e3055582ba66a657f18296d514d0de60662661"],
            ];*/

            const xchainAddressPubkeys = [
                ["0x40ca9bdd3e744a9d5bc5b78808741926d1864a8a",
                 "0x95d8f57561d79db0e25712f6ebd06c062ee64ddefd4e6ec29e01375a007d86b0"],
                ["0x7d3ea2daa415738ea34c32fcdc1eb30bddfa4dcb",
                 "0x1a89634b17812df55bacc1735f058eda5c653b9a03f176c216bfec908371fdd0"],
                ["0xde75e1d5b49e08ae5d841a026cfc420b95b89d4b",
                 "0x37e35dbb6e64cc69afa17f77358b3df6b8501e9b6d1c4b01ddb6f50be28be79b"],
            ];


            const vssBaseInstance = await vssBase.deployed();
            // register open
            await vssBaseInstance.regOpen();

            // send some ether to xchain accounts and register them
            var i;
            const admin = accounts[0];
            const amount = "10";
            const amountToSend = web3.utils.toWei(amount, "ether"); // Convert to wei value
            console.log("Wait until all nodes to register before start xchain nodes");
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                var toAddress = xchainAddressPubkeys[i][0];
                var pubkey = xchainAddressPubkeys[i][1];
                await web3.eth.sendTransaction({from: admin, to: toAddress, value: amountToSend});
                await vssBaseInstance.registerVSS(toAddress, pubkey);
                await vssBaseInstance.activateVSS(toAddress);
                var status = await vssBaseInstance.vssNodeMemberships.call(toAddress);
                console.log(
                    "------------ node ", toAddress,
                    " register status: ", status, "  -------------------");
            }

            // register close
            await vssBaseInstance.regClose();

            //////////////////////////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////////////////////////
            //////////// native token mapping from the 1st set of vaults
            // xcoin grant vault Y to mint
            const vaultx1 = await vaultX.deployed();
            const vaulty1 = await vaultY.deployed();
            const grantAmount = ether("1000000");
            const mapped_native_coin_1 = await mappedNativeCoin1.deployed();

            // mapped_native_coin_1 grant minter to vault Y
            await mapped_native_coin_1.grantMinter(vaulty1.address, grantAmount);

            console.log("Xcoin:", mapped_native_coin_1.address);
            console.log("vaultY:", vaulty1.address);

            console.log("\n\n");
            console.log("Grant xchain nodes mint role on vault X");
            // grant xchain nodes on vault X to withdraw
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                var addr = xchainAddressPubkeys[i][0];
                var result = await vaultx1.grantMinter(addr);
                console.log(
                    "Grant minter", addr, "result tx:", result["tx"],
                    "status", result["receipt"]["status"]);
            }

            console.log("\n\n");
            console.log("Grant xchain nodes mint role on vault Y");
            // grant xchainAddress on vault Y to mint
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                addr = xchainAddressPubkeys[i][0];
                result = await vaulty1.grantMinter(addr);
                console.log(
                    "Grant minter", addr, "result tx:", result["tx"],
                    "status", result["receipt"]["status"]);
            }
            console.log("\n\n");

            //////////////////////////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////////////////////////
            //////////// native token mapping from the 2nd set of vaults
            // second set of vaultx, vaulty and xcoin
            await deployer.deploy(vaultX2, nativeToken);
            await deployer.deploy(vaultY2);
            await deployer.deploy(mappedNativeCoin2,
                                  "xcoin2", "xco2", web3.utils.toWei("100000000", "ether"));

            // erc20 token pair 1
            await deployer.deploy(
                erc20SourceCoin1, "xcoinsource1", "xcosrc1", web3.utils.toWei("100000000", "ether"));
            await deployer.deploy(
                erc20MappedCoin1, "xcoinmapped1", "xcomapped1", web3.utils.toWei("100000000", "ether"));

            // erc20 token pair 2
            await deployer.deploy(
                erc20SourceCoin2, "xcoinsource2", "xcosrc2", web3.utils.toWei("100000000", "ether"));
            await deployer.deploy(
                erc20MappedCoin2, "xcoinmapped2", "xcomapped2", web3.utils.toWei("100000000", "ether"));

            const vaultx2 = await vaultX2.at('0xD493f82ec6a0C36d78c03C886134F718874088c8');
            const vaulty2 = await vaultY2.at('0x58484ce21fb2Df4BeF146e65cd96e7f8E91E998E');
            const mapped_native_coin_2 = await mappedNativeCoin2.at(
                '0xDE33f85C2E655FdF9Ab833DE7779E8eD66224ee2');

            // grant xcoin minter to vault Y 2
            await mapped_native_coin_2.grantMinter(vaulty2.address, grantAmount);

            console.log("\n\n");
            console.log("Grant xchain address mint role on vault X 2");
            // grant xchainAddress on vault X 2 to mint
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                addr = xchainAddressPubkeys[i][0];
                result = await vaultx2.grantMinter(addr);
                console.log(
                    "Grant minter", addr, "result tx:", result["tx"],
                    "status", result["receipt"]["status"]);
            }

            console.log("\n\n");
            console.log("Grant xchain address mint role on vault Y 2");
            // grant xchainAddress on vault Y 2 to mint
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                addr = xchainAddressPubkeys[i][0];
                result = await vaulty2.grantMinter(addr);
                console.log(
                    "Grant minter", addr, "result tx:", result["tx"],
                    "status", result["receipt"]["status"]);
            }

            ////////////////////////////////////////////////////////
            // grant erc20 1
            const erc20_mapped_y_coin_1 = await erc20MappedCoin1.at(
                "0x41c0f3518450b0e546671e5f61Ac50EEe61fa351"
            );
            await erc20_mapped_y_coin_1.grantMinter(vaulty1.address, grantAmount);

            // grant erc20 2
            const erc20_mapped_y_coin_2 = await erc20MappedCoin1.at(
                "0x1c436B435cCa513C8133DF5ED6b2CAFb460a6e04"
            );
            await erc20_mapped_y_coin_2.grantMinter(vaulty2.address, grantAmount);
        });
    }
};
