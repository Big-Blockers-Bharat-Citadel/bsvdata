export let src = "testnet";
export let total = 50;
export let key = "";
import fetch from "node-fetch";

export function set_global(src, total, key){
  src = src, total = total, key = key;
}

export async function fetch_balance(address) {
  let url = `https://api.whatsonchain.com/v1/bsv/${src.slice(0,4)}/address/${address}/balance`;

  try {
    const response = await fetch(url);
    var data = await response.json();
    if (response) {
      const balance = data.confirmed + data.unconfirmed;
      return balance;
    }
  } catch (error) {
    return 0;
  }
}