import fetch from "node-fetch";

export async function fetch_balance(address){
    let url = 'https://api.whatsonchain.com/v1/bsv/test/address/' + address + "/balance";
  
    try {
        const response = await fetch(url);
        var data = await response.json();
        if(response) { 
            const balance = data.confirmed + data.unconfirmed
            // console.log(`${address} -> ${balance} Satoshis`);
            return balance
        };
    } 
    catch (error) {
        return 0;
    }
  }

// await fetch_balance("mu5bCTKn47rGPBSQ3akJaJa6XxCkCKkue9");
// await fetch_balance("mzEDGhBYxWZxj3ACiSCJTRULxM5tnN8NAv");