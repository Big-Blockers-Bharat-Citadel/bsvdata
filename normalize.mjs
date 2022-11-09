import { createRequire } from "module";
import { fetch_balance } from "./checker.mjs";
import { send_money } from "./send.mjs";
const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");
const json = require('./secrets.json'); // use your own relative path here
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var fs = require('fs');


// TODO: check balance in the addresses of secrets.json - Done
async function get_balance(state){
    console.log(state)
    for(let i=0; i<json.table.length; i++){
        const cur = await fetch_balance(json.table[i].address);
        console.log(json.table[i].address + " -> " + cur);
    }
    console.log("\n");
}

await get_balance("Before Normalization")

// TODO: Throw error if individual amount is less than 2000 satoshis - Done. 
async function min_balance(cur_balance, min_limit){
    if(cur_balance < min_limit) {
        throw new Error(`${address} has less than ${limit} satoshis`);
    }
}

// TODO: Take one input private key, spread out the amount evenly - Done. 

rl.question("Enter Private Key\n", async function(private_key) {
    let len = json.table.length;
    const privateKey = new bsv.PrivateKey.fromWIF(private_key);
    const address = `${privateKey.toAddress()}`

    const cur_balance = await fetch_balance(address);
    await min_balance(cur_balance, 2000);
    const amount = (cur_balance - cur_balance%len - 25*len) / len;
    if(amount <= 0){
        throw new Error(`sending amount not a positive integer.\n please fund your address, ${address}`);
    }
    const reciever_addresses = [];
    for(let i=0; i<len; i++){
        reciever_addresses.push(json.table[i].address);
    }
    send_money(private_key, reciever_addresses, amount);
    console.log(`\n${amount} satoshis sent to all ${len} addresses`)

    rl.close();
});


