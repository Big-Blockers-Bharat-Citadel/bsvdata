import { createRequire } from "module";
import { fetch_balance } from "./checker.mjs";
import { send_money } from "./send.mjs";
const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");
let json = require("./secrets.json"); // use your own relative path here

export async function get_balance() {
  let balance_table = [];

  for (let i = 0; i < json.table.length; i++) {
    const cur = await fetch_balance(json.table[i].address);
    const ind = `${json.table[i].address} -> ${cur} satoshis`;
    console.log(ind);
    balance_table.push(ind);
  }

  return balance_table;
}

export async function min_balance(cur_balance, min_limit, address) {
  if (cur_balance < min_limit) {
    throw new Error(`${address} has less than ${min_limit} satoshis`);
  }
  return true;
}

export async function transfer(private_key) {
  let len = json.table.length;
  const privateKey = new bsv.PrivateKey.fromWIF(private_key);
  const address = `${privateKey.toAddress()}`;

  const cur_balance = await fetch_balance(address);
  await min_balance(cur_balance, 2000, address);
  const amount = (cur_balance - (cur_balance % len) - 25 * len) / len;
  if (amount <= 0) {
    throw new Error(
      `sending amount not a positive integer.\n please fund your address, ${address}`
    );
  }
  const reciever_addresses = [];
  for (let i = 0; i < len; i++) {
    reciever_addresses.push(json.table[i].address);
  }
  return await send_money(private_key, reciever_addresses, amount);
}


