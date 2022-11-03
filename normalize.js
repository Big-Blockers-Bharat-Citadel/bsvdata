import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { exit } = require('process');

// const { expect } = require('chai');
const { bsv, buildContractClass, getPreimage, toHex, signTx, Ripemd160, SigHash, PubKey, buildTypeClasses, findKeyIndex } = require('scryptlib');
// const { HashedMap, SortedItem } = require('scryptlib/dist/scryptTypes');
// const { toHashedMap } = require('scryptlib/dist/utils');

// const {
//   inputIndex,
//   inputSatoshis,
//   newTx,
//   DataLen,
//   compileContract
// } = require('../../helper');


const outputAmount = 1000;

const keyPayer = 'cUS5fdQ7P26VsWuFcBzLt7Jemcx2ho2sgUPnZDGjhP7DLounEegj'
const privateKeyMinter = new bsv.PrivateKey.fromWIF(keyPayer);
const publicKeyMinter = privateKeyMinter.publicKey;
const publicKeyHashMinter = bsv.crypto.Hash.sha256ripemd160(publicKeyMinter.toBuffer());

const keyPayee = 'cP9y3Rk9ybFHKPL6L3C4z9MPcYYscHr2B8AJ439bpsNNWYfEfTco'
const privateKeyReceiver = new bsv.PrivateKey.fromWIF(keyPayee);
const publicKeyReceiver = privateKeyReceiver.publicKey;
const publicKeyHashReceiver = bsv.crypto.Hash.sha256ripemd160(privateKeyReceiver.toBuffer());

var data = require("./out/p2pkh_debug_desc.json");
const P2PKH = buildContractClass(JSON.parse(JSON.stringify(data)));

const receiver = new P2PKH(new Ripemd160(toHex(publicKeyReceiver)));
const sender = new P2PKH(new Ripemd160(toHex(publicKeyMinter)));

console.log(toHex(publicKeyHashReceiver));
console.log(toHex(publicKeyHashMinter));
