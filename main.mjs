import { buildContractClass, Bytes, compileContract, Int } from "scryptlib";
import { fetch_balance } from "./checker.mjs";
import { createRequire } from "module";
import fetch from "node-fetch";

const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");
const axios = require("axios");
const API_PREFIX = "https://api.whatsonchain.com/v1/bsv/test";

// assigning varibles
var i = 0;
var pre_tx = "This is the first row";
var last_row_index = 0;
const json = require("./secrets.json"); // use your own relative path here
var rand_address = [];
var private_key = [];

// fill in private key on testnet in WIF here
var privKey = ""; // Ayush Private Key
var address = ""; // Ayush Public Key
export var privateKey;

// makes the process sleep
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Converts ascii to hexa
export function ascii_to_hexa(str) {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}

let MyContract;
let instance;

export function compile(path){
  MyContract = buildContractClass(
    compileContract(path) // compiles contract
  );

  //To create an instance of the contract class
  instance = new MyContract(new Bytes("00"));
}

// assigns the instance with the required data
export function assign_msg(message) {
  message = ascii_to_hexa(message);
  instance.message = new Bytes(message);
}

export async function fetchUtxos(address) {
  // step 1: fetch utxos
  let { data: utxos } = await axios
    .get(`${API_PREFIX}/address/${address}/unspent`)
    .catch(async (err) => {
      await sleep(1000);
      throw Error(`api rate limit reached`);
    });
  return utxos.map((utxo) => ({
    txId: utxo.tx_hash,
    outputIndex: utxo.tx_pos,
    satoshis: utxo.value,
    script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
  }));
}

// Broadcast Transaction and return Txid
export async function sendTx(tx, address, data_json) {
  const hex = tx.toString();

  if (!tx.checkFeeRate(50)) {
    throw new Error(`checkFeeRate fail, transaction fee is too low`);
  }
  let { data: txid } = "";
  try {
    ({ data: txid } = await axios
      .post(`${API_PREFIX}/tx/raw`, { txhex: hex })
      .catch(async (err) => {
        i = i - 1;
        console.log("Txn-Mempool-Conflict");
        return { data: "" };
      }));

    if (txid.length == 64) {
      pre_tx = txid;
      console.log("Current Address -> " + address + "\n" + i + " -> " + txid);
    }

    if (i < last_row_index - 1) {
      i = i + 1;
      update(create_msg(data_json, i), data_json);
    }

    return txid;
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data === "66: insufficient priority") {
      throw new Error(
        `Rejected by miner. Transaction with fee is too low: expected Fee is ${expectedFee}, but got ${fee}, hex: ${hex}`
      );
    }
    throw error;
  }
}

// generates random array index
export function generate_random() {
  let x = Math.floor(Math.random() * 100000000 + 1);
  x = x % rand_address.length;
  return x;
}

export async function get_address() {
  let x = generate_random();
  let itr = 0;
  address = rand_address[x];
  privKey = private_key[x];

  while ((await fetch_balance(address)) < 500 && itr < 5) {
    x = generate_random();
    address = rand_address[x];
    privKey = private_key[x];
    itr = itr + 1;
  }

  if (itr == 5 && (await fetch_balance(address)) < 500) {
    throw new Error(`insufficient balance for last 5 addresses`);
  }

  return;
}

// deploys any type of contracts
export async function deployContract(contract, amount, data_json) {
  let start = new Date().getTime();
  let cur = new Date().getTime();
  let time = [];
  let x = generate_random();

  await get_address();

  cur = new Date().getTime() - start;
  start = new Date().getTime();
  time.push(cur);

  privateKey = new bsv.PrivateKey.fromWIF(privKey);

  let utxos = "";
  try {
    utxos = await fetchUtxos(address);
  } catch (error) {
    await sleep(1000);
    utxos = await fetchUtxos(address);
  }
  cur = new Date().getTime() - start;
  start = new Date().getTime();
  time.push(cur);

  const tx = new bsv.Transaction();
  tx.from(utxos)
    .addOutput(
      new bsv.Transaction.Output({
        script: contract.lockingScript,
        satoshis: 0,
      })
    )
    .change(address)
    .sign(privateKey);

  await sendTx(tx, address, data_json); // Broadcast transaction

  cur = new Date().getTime() - start;
  start = new Date().getTime();
  time.push(cur);

  console.log(time);
  console.log("\n");

  return tx;
}

// deploys each row
export async function update(message, data_json) {
  var tmp = message;
  var tmp2 = "| Prev_Tx :" + pre_tx;
  assign_msg(tmp + tmp2);
  await deployContract(instance, new Int(0), data_json);
  return;
}

// convert dataframe row to string
export function create_msg(data, i) {
  let data_string =
    data[i].id + " " + data[i].file_name + " " + data[i].prediction;
  return data_string;
}

// fetches csv file and deploys on testnet
export async function fetch_api(url) {
  const response = await fetch(url);
  let data = await response.json();
  last_row_index = data.length;

  update(create_msg(data, i), data);
}

export async function update_address() {
  for (let i = 0; i < json.table.length; i++) {
    rand_address.push(json.table[i].address);
    private_key.push(json.table[i].private_key);
  }
  return;
}

export async function start_upload(path, url){
  // compiles & create it's instance
  compile(path)

  // update rand_address & private_key arrays from secrets.json
  await update_address();

  // csv file is fetched
  fetch_api(url);
} 

// start_upload("./smart_contracts/upload_data.scrypt", "https://retoolapi.dev/veKA1F/data");
