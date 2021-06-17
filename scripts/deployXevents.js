// Copyright 2017 https://tokenmarket.net - MIT licensed
//
// Run with Node 7.x as:
//
// node --harmony-async-await  deploy.js
//

let fs = require("fs");
var Web3 = require('web3');
var web3 = new Web3('http://localhost:18545');

let source = fs.readFileSync("../build/contracts/XEvents.json");
let abi = JSON.parse(source)["abi"];
let code = JSON.parse(source)["bytecode"].slice(2);
let xeventsContract = new web3.eth.Contract(abi);

// For deploy uniswap factory v2
function deployContract(account, contractBytecode, contract){
    return contract.deploy(
        {
            data: contractBytecode,
            arguments: []
        }
    ).send({
        from: account,
        gas: 9000000
    });
}

async function main() {
    // Unlock the coinbase account to make transactions out of it
    console.log("Unlocking install account");
    var password = "123456";
    var unlock_forever = 0;
    var install_account = "0xa35add395b804c3faacf7c7829638e42ffa1d051";
    try {
        await web3.eth.personal.unlockAccount(install_account, password, unlock_forever);
    } catch(e) {
        console.log(e);
    }

    console.log("Deploying the contract");
    try {
        console.log(abi);
        console.log(code);
        var contract = await deployContract(install_account, code, xeventsContract);
    } catch(e) {
        console.log(e);
    }
}

main();
