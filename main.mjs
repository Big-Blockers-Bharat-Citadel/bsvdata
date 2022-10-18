import { buildContractClass } from "scryptlib/dist/contract.js";

import {
  Bytes,
  Sig,
  SigHashPreimage,
  Int,
} from "scryptlib/dist/scryptTypes.js";

import {
  pre_tx,
  cur_tx
} from "./var.js"

import { compile } from "scryptlib/dist/compilerWrapper.js";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

const { exit } = require("process");
const { bsv } = require("scryptlib");
const axios = require("axios");
const API_PREFIX = "https://api.whatsonchain.com/v1/bsv/test";

// fill in private key on testnet in WIF here
const privKey = "cUS5fdQ7P26VsWuFcBzLt7Jemcx2ho2sgUPnZDGjhP7DLounEegj";

// be default, you do NOT fill in these two, since they are only needed when multiple keys are required
const privKey2 = "";
const privKey3 = "";

if (!privKey) {
  genPrivKey();
}

export function genPrivKey() {
  const newPrivKey = new bsv.PrivateKey.fromRandom("testnet");
  console.log(
    `Please fill you Private Key and make sure it's funded. \n 
    If not fund it from sCrypt faucet https://scrypt.io/#faucet`
  );
  exit(-1);
}

export const privateKey = new bsv.PrivateKey.fromWIF(privKey);

export const privateKey2 = privKey2
  ? new bsv.PrivateKey.fromWIF(privKey2)
  : privateKey;

export const privateKey3 = privKey3
  ? new bsv.PrivateKey.fromWIF(privKey3)
  : privateKey;

export async function fetchUtxos(address) {
  // step 1: fetch utxos
  let { data: utxos } = await axios.get(
    `${API_PREFIX}/address/${address}/unspent`
  );

  return utxos.map((utxo) => ({
    txId: utxo.tx_hash,
    outputIndex: utxo.tx_pos,
    satoshis: utxo.value,
    script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
  }));
}

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

function assign_msg(message){
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
  new Int(5000),
  new Bytes("abcdefABCDEF")
);
const unlockingScript = funcCall.toScript();
// To convert it to ASM/hex format
const unlockingScriptASM = unlockingScript.toASM();
const unlockingScriptHex = unlockingScript.toHex();

export async function sendTx(tx) {
  const hex = tx.toString();

  if (!tx.checkFeeRate(50)) {
    throw new Error(`checkFeeRate fail, transaction fee is too low`);
  }

  try {
    const { data: txid } = await axios.post(`${API_PREFIX}/tx/raw`, {
      txhex: hex,
    });
    cur_tx = txid;
    pre_tx = cur_tx;
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

// Deploys any type of contracts
async function deployContract(contract, amount) {
  const address = privateKey.toAddress();
  const tx = new bsv.Transaction();
  tx.from(await fetchUtxos(address)) // Add UTXOs/bitcoins that are locked into the contract and pay for miner fees. In practice, wallets only add enough UTXOs, not all UTXOs as done here for ease of exposition.
    .addOutput(
      new bsv.Transaction.Output({
        script: contract.lockingScript, // Deploy the contract to the 0-th output
        satoshis: 0,
      })
    )
    .change(address) // Add change output
    .sign(privateKey); // Sign inputs. Only apply to P2PKH inputs.

  await sendTx(tx); // Broadcast transaction
  console.log(tx);
  return tx;
}

function update(message) {
  var tmp = message;
  // if (head != -1) {
  //   pre_tx = head;
  // }
  var tmp2 = "| Prev_Tx : " + pre_tx;
  console.log(pre_tx);
  assign_msg(tmp + tmp2);
  deployContract(instance, new Int(5000));
}

update("DFHGJSDHKFJKLSDJFBGFDJKGNSF")
update("DFHGJSDHKFJKLSDJFBGFDJKGNSF")
update("DFHGJSDHKFJKLSDJFBGFDJKGNSF")
update("DFHGJSDHKFJKLSDJFBGFDJKGNSF")

// update("Ayush has gone Crazy", pre_tx);
