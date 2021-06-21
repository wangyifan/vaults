var wToken = artifacts.require("WTOKEN");
var vaultX = artifacts.require("VaultX");
var vaultY = artifacts.require("VaultY");
var vssBase = artifacts.require("VssBase");
var xEvents = artifacts.require("XEvents");
var xcoin = artifacts.require("XCoin");


module.exports = function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        deployer.then(async () => {
            var sourceChainid = await web3.eth.getChainId();
            console.log(sourceChainid);
            var nativeToken = web3.utils.toChecksumAddress("0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" + sourceChainid.toString()).substring(26));
            await deployer.deploy(wToken);
            await deployer.deploy(vaultX, nativeToken);
            await deployer.deploy(vaultY);
            var threshold = 2;
            await deployer.deploy(vssBase, threshold);
            await deployer.deploy(xEvents);
            await deployer.deploy(xcoin, "xcoin", "xco", web3.utils.toWei("100000000", "ether"));

            //const xchainAddressPubkeys = [["0x1ad78b2e7c1825785eddf054f8c5830240852914", "0x5ef2aa0941d6421c83586c7e5a0bb433f76e6ef6051bf8506b45e08c29eb6683"]];
            const xchainAddressPubkeys = [
                ["0xc996264b44d35f9ae8291101760fb1ecffb445f5", "0x9045469e9cf0d49c4629df0221939cfd07e1719d969c26672262e5e596139ff0"],
                ["0x7a7643c48bafaed8640eb22da93931b54b7cc657", "0x07637aeee19f6bedb6736a62daff7abc72a8c369500ab3117c65b18a29ece60a"],
                ["0xf38562a301ddc57e7d2d3d22ab3a18352f60c66c", "0x2ada70e73403f64a6a62569125e3055582ba66a657f18296d514d0de60662661"],
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
                console.log("------------ node ", toAddress, " register status: ", status, "  -------------------");
            }

            // register close
            await vssBaseInstance.regClose();

            // grant vault y to mint
            const vaultxInstance = await vaultX.deployed();
            const vaultyInstance = await vaultY.deployed();
            const xcoinInstance = await xcoin.deployed();
            await xcoinInstance.grantMinter(vaultyInstance.address);
            console.log("Xcoin:", xcoinInstance.address);
            console.log("vaultY:", vaultyInstance.address);

            console.log("\n\n");
            console.log("Grant xchain address mint role on vault X");
            // grant xchainAddress on vault Y to mint
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                var addr = xchainAddressPubkeys[i][0];
                var result = await vaultxInstance.grantMinter(addr);
                console.log("Grant minter", addr, "result:", result["tx"], result["receipt"]["status"]);
            }

            console.log("\n\n");
            console.log("Grant xchain address mint role on vault Y");
            // grant xchainAddress on vault Y to mint
            for(i = 0; i < xchainAddressPubkeys.length; i++) {
                addr = xchainAddressPubkeys[i][0];
                result = await vaultyInstance.grantMinter(addr);
                console.log("Grant minter", addr, "result:", result["tx"], result["receipt"]["status"]);
            }
        });
    }
};
