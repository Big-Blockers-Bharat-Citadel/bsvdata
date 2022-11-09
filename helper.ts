import { createRequire } from "module";

const path = require('path')
const {
  readFileSync,
  existsSync,
  mkdirSync
} = require('fs')
const {
  bsv,
  compileContract: compileContractImpl,
  getPreimage,
  toHex
} = require('scryptlib')
const crypto = require('crypto');
const MSB_THRESHOLD = 0x7e;

const BN = bsv.crypto.BN
const Interpreter = bsv.Script.Interpreter

// number of bytes to denote some numeric value
const DataLen = 1

const axios = require('axios')
const API_PREFIX = 'https://api.whatsonchain.com/v1/bsv/test'

export const inputIndex = 0
export const inputSatoshis = 5000
const dummyTxId = crypto.randomBytes(32).toString('hex');
const reversedDummyTxId =  Buffer.from(dummyTxId, 'hex').reverse().toString('hex');
const sighashType2Hex = (s: { toString: (arg0: number) => any; }) => s.toString(16)

export function newTx(inputSatoshis: any) {
  const utxo = {
    txId: dummyTxId,
    outputIndex: 0,
    script: '',   // placeholder
    satoshis: inputSatoshis
  };
  return new bsv.Transaction().from(utxo);
}

export async function sendTx(tx: { toString: () => any; checkFeeRate: (arg0: number) => any; }) {
  const hex = tx.toString();

  if(!tx.checkFeeRate(50)) {
    throw new Error(`checkFeeRate fail, transaction fee is too low`)
  }

  try {
    const { data: txid } = await axios
    .post(`${API_PREFIX}/tx/raw`, {txhex: hex,})
    console.log(txid);
    return txid
  } 
  catch (error) {
    console.log("Error Here")
    throw error
  }

}

// reverse hexStr byte order
function reverseEndian(hexStr: { match: (arg0: RegExp) => any[]; }) {
  return hexStr.match(/../g).reverse().join('')
}

export function compileContract(fileName: any, options: any) {
  const filePath = path.join(__dirname, 'contracts', fileName)
  const out = path.join(__dirname, 'out')

  const result = compileContractImpl(filePath, options ? options : {
    out: out
  });
  if (result.errors.length > 0) {
    console.log(`Compile contract ${filePath} failed: `, result.errors)
    throw result.errors;
  }

  return result;
}

function compileTestContract(fileName: any) {
  const filePath = path.join(__dirname, 'tests', 'testFixture', fileName)
  const out = path.join(__dirname, 'tests', 'out')
  if (!existsSync(out)) {
      mkdirSync(out)
  }
  const result = compileContractImpl(filePath, {
    out: out
  });
  if (result.errors.length > 0) {
    console.log(`Compile contract ${filePath} fail: `, result.errors)
    throw result.errors;
  }

  return result;
}

function loadDesc(fileName: string) {
  let filePath = '';
  if(!fileName.endsWith(".json")) {
    filePath = path.join(__dirname, `out/${fileName}_desc.json`);
    if (!existsSync(filePath)) {
      filePath = path.join(__dirname, `out/${fileName}_debug_desc.json`);
    }
  } else {
    filePath = path.join(__dirname, `out/${fileName}`);
  }

  if (!existsSync(filePath)) {
    throw new Error(`Description file ${filePath} not exist!\nIf You already run 'npm run watch', maybe fix the compile error first!`)
  }
  return JSON.parse(readFileSync(filePath).toString());
}

function showError(error: { response: { status: string; data: string; }; request: any; message: any; context: any; }) {
  // Error
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log('Failed - StatusCodeError: ' + error.response.status + ' - "' + error.response.data + '"');
    // console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the
    // browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error:', error.message);
    if (error.context) {
      console.log(error.context);
    }
  }
};

function padLeadingZero(hex: string | any[], byteslen = 0) {
  if(byteslen > 0) {
    if(hex.length < byteslen * 2) {
      return "0".repeat(byteslen * 2 - hex.length) + hex
    }
  }
  if(hex.length % 2 === 0) return hex;
  return "0" + hex;
}

// checkLowS returns true if the sig hash is safe for low s.
function checkLowS(tx: any, lockingScript: any, inputSatoshis: any, inputIndex: any) {
  const preimage = getPreimage(tx, lockingScript, inputSatoshis, inputIndex);
  const sighash = bsv.crypto.Hash.sha256sha256(Buffer.from(toHex(preimage), 'hex'));
  const msb = sighash.readUInt8();
  return (msb < MSB_THRESHOLD);
}


export const sleep = async(seconds: number) => {
  return new Promise<void>((resolve) => {
     setTimeout(() => {
        resolve();
     }, seconds * 1000);
  })
}

export async function deployContract(contract: { lockingScript: any; }, amount: any) {
  const { privateKey } = require('./privateKey');
  const address = privateKey.toAddress()
  const tx = new bsv.Transaction()
  
  tx.from(await fetchUtxos(address))
  .addOutput(new bsv.Transaction.Output({
    script: contract.lockingScript,
    satoshis: amount,
  }))
  .change(address)
  .sign(privateKey)

  await sendTx(tx)
  return tx
}

//create an input spending from prevTx's output, with empty script
export function createInputFromPrevTx(tx: { id: any; outputs: { [x: string]: any; }; }, outputIndex: number) {
  const outputIdx = outputIndex || 0
  return new bsv.Transaction.Input({
    prevTxId: tx.id,
    outputIndex: outputIdx,
    script: new bsv.Script(), // placeholder
    output: tx.outputs[outputIdx]
  })
}


async function fetchUtxos(address: any) {
  // step 1: fetch utxos
  let {
    data: utxos
  } = await axios.get(`${API_PREFIX}/address/${address}/unspent`)

  return utxos.map((utxo: { tx_hash: any; tx_pos: any; value: any; }) => ({
    txId: utxo.tx_hash,
    outputIndex: utxo.tx_pos,
    satoshis: utxo.value,
    script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
  }))
}

const emptyPublicKey = '000000000000000000000000000000000000000000000000000000000000000000'

function num2hex(d: any, padding: number) {
  var s = Number(d).toString(16);
  // add padding if needed.
  while (s.length < padding) {
      s = "0" + s;
  }
  return s;
}



/**
 * inspired by : https://bigishdata.com/2017/11/13/how-to-build-a-blockchain-part-4-1-bitcoin-proof-of-work-difficulty-explained/
 * @param {*} bitsHex bits of block header, in big endian
 * @returns a target number 
 */
 function toTarget(bitsHex: string) {
  const shift = bitsHex.substr(0, 2);
  const exponent = parseInt(shift, 16);
  const value = bitsHex.substr(2, bitsHex.length);
  const coefficient = parseInt(value, 16);
  const target = coefficient * 2 ** (8 * (exponent - 3));
  return BigInt(target);
}

/**
* convert pool difficulty to a target number 
* @param {*}  difficulty which can fetch by api https://api.whatsonchain.com/v1/bsv/<network>/chain/info
* @returns target
*/
function pdiff2Target(difficulty: number | bigint) {
  if (typeof difficulty === 'number') {
      difficulty = BigInt(Math.floor(difficulty))
  }

  return BigInt(toTarget("1d00ffff") / difficulty);
}