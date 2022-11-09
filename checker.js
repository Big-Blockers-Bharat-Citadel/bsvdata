import { createRequire } from "module";
import fetch from "node-fetch";
const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");

// { confirmed: 134049, unconfirmed: 0 } 
// n1XUyyk3CwZ52TvuGDg1hn37ayjtk2Sr9c
// { confirmed: 1174412, unconfirmed: 0 } 
//mu5bCTKn47rGPBSQ3akJaJa6XxCkCKkue9

export async function fetch_balance(address){
    let url = 'https://api.whatsonchain.com/v1/bsv/test/address/' + address + "/balance";
  
    try {
        const response = await fetch(url);
        var data = await response.json();
        if(response) { 
            // console.log(data);
            return data.confirmed + data.unconfirmed };
    } 
    catch (error) {
        return 0;
    }
  }

// fetch_balance("mu5bCTKn47rGPBSQ3akJaJa6XxCkCKkue9");