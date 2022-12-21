import { fetch_balance } from './checker.mjs';
import { send_money } from './send.mjs';
import { bsv } from 'scryptlib';
import { genHDPrivKey } from './generate.mjs';
import { config } from "dotenv";
config();

let json = genHDPrivKey();

export async function get_balance() {
  let balance_table = [];
  for (let i = 0; i < json.table.length; i++) {
    const cur = await fetch_balance(json.table[i].address);
    const balance = `${json.table[i].address} -> ${cur} satoshis`;
    balance_table.push(balance);
  }
  return balance_table;
}

async function min_balance(cur_balance, min_limit, address) {
  if (cur_balance < min_limit) {
    console.log(`${address} has less than ${min_limit} satoshis`)
    throw new Error("Insufficient Balance to Normalize");
  }
  return true;
}

export async function collect(address){
  let len = json.table.length;
  const reciever_addresses = [];
  reciever_addresses.push(address);
  for(let i=0; i<len; i++) {
    const cur_balance = await fetch_balance(json.table[i].address);
    const minerfee = 150;
    if(cur_balance > minerfee){
      await send_money(json.table[i].private_key, reciever_addresses, cur_balance-minerfee);
    }
  }
}

export async function transfer(private_key) {
  let len = json.table.length;
  const privateKey = new bsv.PrivateKey.fromWIF(private_key);
  const address = `${privateKey.toAddress()}`;

  const cur_balance = await fetch_balance(address);
  await min_balance(cur_balance, 2000, address);

  const amount = (cur_balance - (cur_balance % len) - 25 * len) / len;

  if (amount <= 0) {
    console.log(`Please fund your address, ${address}`);
    throw new Error("Please fund your address");
  }

  const reciever_addresses = [];
  for (let i = 0; i < len; i++) {
    reciever_addresses.push(json.table[i].address);
  }
  
  return await send_money(private_key, reciever_addresses, amount);
}