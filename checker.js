import { createRequire } from "module";
import fetch from "node-fetch";
const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");

let url_api = 'https://api.whatsonchain.com/v1/bsv/test/address/';
let tx_address = "n3bpgiz5fNb5VwsNHD9SzmbiWSXxTGBRhZ";

// { confirmed: 199871, unconfirmed: 0 } 
// n1XUyyk3CwZ52TvuGDg1hn37ayjtk2Sr9c
// { confirmed: 923256, unconfirmed: 0 } 
//mu5bCTKn47rGPBSQ3akJaJa6XxCkCKkue9

async function fetch_api(url){
    const response = await fetch(url);
    var data = await response.json();
    // if(response) json_parse(data);
    if(response){
        console.log(data)
    }
}

fetch_api(url_api + tx_address + "/balance");