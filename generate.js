import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");

export let rand_address = [];
export let private_key = [];

function genPrivKey() {
    const newPrivKey = new bsv.PrivateKey.fromRandom('testnet')
    rand_address.push(`${newPrivKey.toAddress()}`);
    private_key.push(`${newPrivKey.toWIF()}`);
}

for(let i=0; i<1000; i++){
    genPrivKey();
    // console.log(i + "\nAddress -> " + rand_address[i] + "\nPrivate Key -> " + private_key[i] + "\n");
}

