import {
  compile,
  buildContractClass,
  Bytes,
  SigHashPreimage,
  Int,
} from "scryptlib";

import {
  fetch_balance
} from "./checker.mjs";

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
const json = require('./secrets.json'); // use your own relative path here
var rand_address = [];
var private_key = [];

// fill in private key on testnet in WIF here
var privKey = "cUS5fdQ7P26VsWuFcBzLt7Jemcx2ho2sgUPnZDGjhP7DLounEegj";
export var privateKey = new bsv.PrivateKey.fromWIF(privKey);

// The compiler output results in a JSON file
compile(
  {
    path: "./upload_data.scrypt", //  the file path of the contract
  },
  {
    desc: true, // set this flag to be `true` to get the description file output
    asm: true, // set this flag to be `true` to get the asm file output
    optimize: false, //set this flag to be `true` to get optimized asm opcode
    sourceMap: true, //set this flag to be `true` to get source map
    hex: true, //set this flag to be `true` to get hex format script
    stdout: false, //set this flag to be `true` to make that the compiler will output the compilation result through stdout
  }
);

// To fetch and parse _desc.json file
var data = require("./upload_data_desc.json");
const MyContract = buildContractClass(JSON.parse(JSON.stringify(data)));

// makes the process sleep
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Converts ascii to hexa
function ascii_to_hexa(str) {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}

//To create an instance of the contract class
const instance = new MyContract(new Bytes("11"));

// assigns the instance with the required data
function assign_msg(message) {
  message = ascii_to_hexa(message);
  instance.message = new Bytes(message);
}

// To get the locking Scipt
const lockingScript = instance.lockingScript;

// To convert it to ASM/hex format
const lockingScriptASM = lockingScript.toASM();
const lockingScriptHex = lockingScript.toHex();

// To get the unlocking script
const funcCall = instance.upload_data(
  new SigHashPreimage("00"),
  new Int(0),
  new Bytes("ab")
);
const unlockingScript = funcCall.toScript();

// To convert it to ASM/hex format
const unlockingScriptASM = unlockingScript.toASM();
const unlockingScriptHex = unlockingScript.toHex();

export async function fetchUtxos(address) {
  // step 1: fetch utxos
  let { data: utxos } = await axios.get(`${API_PREFIX}/address/${address}/unspent`)
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
  let {data : txid} = "";
  try {
    ({ data: txid } = await axios
      .post(`${API_PREFIX}/tx/raw`, {txhex: hex,})
      .catch(async (err) => {
        i = i - 1;
        console.log("Bad Request : 400");
        await sleep(1000);
        return {data : ""};
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
  } 
  catch (error) {
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
function generate_random(){
  let x = Math.floor((Math.random() * 10000) + 1);
  x = x % rand_address.length;
  return x;
}

// deploys any type of contracts
async function deployContract(contract, amount, data_json) {
  let start = new Date().getTime();
  let cur = new Date().getTime();
  let time = []
  let x = generate_random();

  var address = rand_address[x];
  privKey = private_key[x];
  
  // TODO: Check the amount in the address, if it is below 500, use a different address - Done
  // TODO: Implement a function to return random address 
  while(await fetch_balance(address) < 500){
    x = generate_random();
    address = rand_address[x];
    privKey = private_key[x];
  }

  cur = new Date().getTime() - start;
  start = new Date().getTime();
  // console.log("fetch_balance -> " + cur + "\n");
  time.push(cur);

  privateKey = new bsv.PrivateKey.fromWIF(privKey);

  // TODO: sleep for 1 second and try again - Done
  let utxos = "";
  try{
    utxos = await fetchUtxos(address);
  }
  catch (error) {
    // console.log(error);
    await sleep(1000);
    utxos = await fetchUtxos(address);
  }
  cur = new Date().getTime() - start;
  start = new Date().getTime();
  time.push(cur);

  const tx = new bsv.Transaction();
  let data = tx
    .from(utxos) // Add UTXOs/bitcoins that are locked into the contract and pay for miner fees. In practice, wallets only add enough UTXOs, not all UTXOs as done here for ease of exposition.
    .addOutput(
      new bsv.Transaction.Output({
        script: contract.lockingScript, // Deploy the contract to the 0-th output
        satoshis: 0,
      })
    )
    .change(address) // Add change output
    .sign(privateKey); // Sign inputs. Only apply to P2PKH inputs.
  
  await sendTx(tx, address, data_json); // Broadcast transaction

  cur = new Date().getTime() - start;
  start = new Date().getTime();
  time.push(cur);

  console.log(time);
  console.log("\n");
  
  return tx;
}

// deploy each row
export async function update(message, data_json) {
  var tmp = message;
  var tmp2 = "| Prev_Tx :" + pre_tx;
  assign_msg(tmp + tmp2);
  await deployContract(instance, new Int(0), data_json);
  return;
}

// convert dataframe row to string
function create_msg(data, i) {
  let data_string = data[i].id + " " + data[i].file_name + " " + data[i].prediction;
  return data_string;
}

// fetches csv file and deploys on testnet
async function fetch_api(url) {
  const response = await fetch(url);
  let data = await response.json();
  last_row_index = data.length;
  
  // TODO: Remove the sleep function and call create_msg without delays - Done

  update(create_msg(data, i), data);
}

async function update_address(){
  for(let i=0; i<json.table.length; i++){
    rand_address.push(json.table[i].address);
    private_key.push(json.table[i].private_key);
  }
  return;
}

// update rand_address & private_key arrays from secrets.json
await update_address();

// csv file is fetched
fetch_api("https://retoolapi.dev/veKA1F/data");