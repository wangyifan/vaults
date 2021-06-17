var wToken = artifacts.require("WTOKEN");
var vaultX = artifacts.require("VaultX");
var vssBase = artifacts.require("VssBase");
var xEvents = artifacts.require("XEvents");

module.exports = function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        deployer.then(async () => {
            var sourceChainid = await web3.eth.getChainId();
            console.log(sourceChainid);
            var nativeToken = web3.utils.toChecksumAddress("0x" + web3.utils.soliditySha3("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF@" + sourceChainid.toString()).substring(26));
            await deployer.deploy(wToken);
            await deployer.deploy(vaultX, nativeToken);
            var threshold = 2;
            await deployer.deploy(vssBase, threshold);
            await deployer.deploy(xEvents);

            //const xchainAddressPubkeys = [["0x1ad78b2e7c1825785eddf054f8c5830240852914", "0x5ef2aa0941d6421c83586c7e5a0bb433f76e6ef6051bf8506b45e08c29eb6683"]];
            const xchainAddressPubkeys = [
                ["0xdd4f327fb8cae03783a1e012178fd307024d2aae", "0x7fa28872def4b556af1f06ee2a4c9dbb1599e6c96f79194ce72c46bcc2c9547a"],
                ["0x936b1fae5f26598515ae5ed916c9808a3da9f866", "0x74d3178b74b4d99cc6d85b3866366b885139bdf853ebd709ee6b7bc219111e3c"],
                ["0x59b8c6d40a38ac6dfd1d611e779cb5a989c92555", "0xe3d7308877b33ad077c558efd992752cd9efb6cd9f2e3a743174f8e9bd547d9a"],
            ];

            const vssBaseInstance = await vssBase.deployed();
            // register open
            await vssBaseInstance.regOpen();

            // send some ether to xchain accounts and register them
            const admin = accounts[0];
            const amount = "10";
            const amountToSend = web3.utils.toWei(amount, "ether"); // Convert to wei value
            for(var i = 0; i < xchainAddressPubkeys.length; i++) {
                var toAddress = xchainAddressPubkeys[i][0];
                var pubkey = xchainAddressPubkeys[i][1];
                await web3.eth.sendTransaction({from: admin, to: toAddress, value: amountToSend});
                await vssBaseInstance.registerVSS(toAddress, pubkey);
                await vssBaseInstance.activateVSS(toAddress);
                var status = await vssBaseInstance.vssNodeMemberships.call(toAddress);
                console.log("------------ status: ", status, "  -------------------");
            }

            // register close
            await vssBaseInstance.regClose();
        });
    }
};
