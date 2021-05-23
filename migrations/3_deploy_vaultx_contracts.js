var wToken = artifacts.require("WTOKEN");
var vaultX = artifacts.require("VaultX");

module.exports = function (deployer, network, accounts) {
    if (network == "vaultxdev") {
        deployer.then(async () => {
            await deployer.deploy(wToken);
            await deployer.deploy(vaultX, wToken.address);
        });
    }
};
