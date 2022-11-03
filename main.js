import {
  compile,
  buildContractClass,
  Bytes,
  Sig,
  SigHashPreimage,
  Int,
  typeOfArg,
} from "scryptlib";

// import {
//   rand_address,
//   private_key,
// } from "./generate.js";

import { createRequire } from "module";
import fetch from "node-fetch";

const require = createRequire(import.meta.url);
const { exit } = require("process");
const { bsv } = require("scryptlib");
const axios = require("axios");
const API_PREFIX = "https://api.whatsonchain.com/v1/bsv/test";

// assigning varibles
var i = 0;
var pre_tx = "This is the first row";
var last_row_index = 0;
var rand_address = ['n1XUyyk3CwZ52TvuGDg1hn37ayjtk2Sr9c', 'n3bpgiz5fNb5VwsNHD9SzmbiWSXxTGBRhZ', 'mohXniK7gEMU19qoXrMNKQP6upXkvS6YVN', 'my4rzLDYCjw579hZhB8GpdSJdtzaNou2EB', 'mmCzDhppF2vbuFuyL2KRczh3yJo9WtQLqL'];
var private_key = ['cRfw5AoMHLqtB4xgc5QFs8zHG8xGuEf25T4LfDsozaKfMgma84Zb', 'cP9y3Rk9ybFHKPL6L3C4z9MPcYYscHr2B8AJ439bpsNNWYfEfTco', 'cVHcV7fXWo4DvFe32iSqCwhzdDAu4D9uWDvpSdebQ5TPKE6smjjv', 'cVDRjiLZY57K3SMjMkzA8pGLZP7wYd7qLz31ikRuxXr9bHun1Nx2', 'cTHggGBfQEj8ctDFcbQrf6bcTgSBcsS1mjVaUKAqcG4VS9cdwTQA'];

// fill in private key on testnet in WIF here
var privKey = "cUS5fdQ7P26VsWuFcBzLt7Jemcx2ho2sgUPnZDGjhP7DLounEegj";

// be default, you do NOT fill in these two, since they are only needed when multiple keys are required
var privKey2 = "";
var privKey3 = "";

if (!privKey) {
  genPrivKey();
}

// Generates Private Key
export function genPrivKey() {
  const newPrivKey = new bsv.PrivateKey.fromRandom("testnet");
  console.log(
    `Please fill you Private Key and make sure it's funded. \n 
    If not, fund it from sCrypt faucet https://scrypt.io/#faucet`
  );
  exit(-1);
}

export var privateKey = new bsv.PrivateKey.fromWIF(privKey);

export var privateKey2 = privKey2
  ? new bsv.PrivateKey.fromWIF(privKey2)
  : privateKey;

export var privateKey3 = privKey3
  ? new bsv.PrivateKey.fromWIF(privKey3)
  : privateKey;

// The compiler output results in a JSON file
compile(
  {
    path: "upload_data.scrypt", //  the file path of the contract
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
const instance = new MyContract(new Bytes("20"));

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
  new Bytes("abcdefABCDEF")
);
const unlockingScript = funcCall.toScript();

// To convert it to ASM/hex format
const unlockingScriptASM = unlockingScript.toASM();
const unlockingScriptHex = unlockingScript.toHex();

export async function fetchUtxos(address) {
  // step 1: fetch utxos
  let { data: utxos } = await axios
    .get(`${API_PREFIX}/address/${address}/unspent`)
    .catch((err) => {
      return { data: "There was an error! get" };
    });
  
  return utxos.map((utxo) => ({
    txId: utxo.tx_hash,
    outputIndex: utxo.tx_pos,
    satoshis: utxo.value,
    script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
  }));
}

// Broadcast Transaction and return Txid
export async function sendTx(tx, address) {
  const hex = tx.toString();

  if (!tx.checkFeeRate(50)) {
    throw new Error(`checkFeeRate fail, transaction fee is too low`);
  }

  try {
    const { data: txid } = await axios
      .post(`${API_PREFIX}/tx/raw`, {
        txhex: hex,
      })
      .catch((err) => {
        i = i - 1;
        return { data: "Error" };
      });
    if (txid.length == 64) {
      pre_tx = txid;
      console.log("Current Address -> " + address + "\n" + i + " -> " + txid + "\n");
    }
    // if (i < last_row_index - 1) {
    //   i = i + 1;
    //   update(create_msg(data_json, i), data_json);
    // } else {
    //   console.log("Your Head Transaction Hash is " + txid);
    //   return txid;
    // }
    return txid;
  } catch (error) {
    if (error.response && error.response.data === "66: insufficient priority") {
      throw new Error(
        `Rejected by miner. Transaction with fee is too low: expected Fee is ${expectedFee}, but got ${fee}, hex: ${hex}`
      );
    }
    throw error;
  }
}

// deploys any type of contracts
async function deployContract(contract, amount, data_json) {
  let x = Math.floor((Math.random() * 100) + 1);
  x = x % 5;
  const address = rand_address[x];
  privKey = private_key[x];

  // const address = "mfyegphsnXJzyYAoLgjrCuvjetLthG4gxj";
  // privKey = "cQoYixiRvqxWUo5PkKFayPndu3cWjRka3GDKN7zDz4RgRSxuD8CX";
  privateKey = new bsv.PrivateKey.fromWIF(privKey);
  // console.log('Current Address -> ' + address + "\n");
  
  // const address = privateKey.toAddress();
  // console.log(address)
  const tx = new bsv.Transaction();
  let data = tx
    .from(await fetchUtxos(address)) // Add UTXOs/bitcoins that are locked into the contract and pay for miner fees. In practice, wallets only add enough UTXOs, not all UTXOs as done here for ease of exposition.
    .addOutput(
      new bsv.Transaction.Output({
        script: contract.lockingScript, // Deploy the contract to the 0-th output
        satoshis: 0,
      })
    )
    .change(address) // Add change output
    .sign(privateKey); // Sign inputs. Only apply to P2PKH inputs.

  await sendTx(tx, address); // Broadcast transaction

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
  let data_string =
    data[i].id + " " + data[i].file_name + " " + data[i].prediction;

  return data_string;
}

// fetches csv file and deploys on testnet
async function fetch_api(url) {
  const response = await fetch(url);
  let data = await response.json();
  last_row_index = data.length;
  // console.log(typeof(data[0]))
  // console.log(Object.keys(data[0]).length)
  // update(mssg, data);
  var interval = setInterval(function () {
    let mssg = create_msg(data, i);
    update(mssg, data);
    i += 1;
    if (i >= last_row_index) {
      clearInterval(interval);
    }
  }, 5000);
}

// function is called
fetch_api("https://retoolapi.dev/veKA1F/data");
// console.log(rand_address);

// console.log(address);