"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.compileContract = exports.sendTx = exports.newTx = exports.inputSatoshis = exports.inputIndex = void 0;
var path = require('path');
var _a = require('fs'), readFileSync = _a.readFileSync, existsSync = _a.existsSync, mkdirSync = _a.mkdirSync;
var _b = require('scryptlib'), bsv = _b.bsv, compileContractImpl = _b.compileContract, getPreimage = _b.getPreimage, toHex = _b.toHex;
var crypto = require('crypto');
var MSB_THRESHOLD = 0x7e;
var BN = bsv.crypto.BN;
var Interpreter = bsv.Script.Interpreter;
// number of bytes to denote some numeric value
var DataLen = 1;
var axios = require('axios');
var API_PREFIX = 'https://api.whatsonchain.com/v1/bsv/test';
exports.inputIndex = 0;
exports.inputSatoshis = 1000;
var dummyTxId = crypto.randomBytes(32).toString('hex');
var reversedDummyTxId = Buffer.from(dummyTxId, 'hex').reverse().toString('hex');
var sighashType2Hex = function (s) { return s.toString(16); };
function newTx() {
    var utxo = {
        txId: dummyTxId,
        outputIndex: 0,
        script: '',
        satoshis: exports.inputSatoshis
    };
    return new bsv.Transaction().from(utxo);
}
exports.newTx = newTx;
function sendTx(tx) {
    return __awaiter(this, void 0, void 0, function () {
        var hex, txid, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hex = tx.toString();
                    if (!tx.checkFeeRate(50)) {
                        throw new Error("checkFeeRate fail, transaction fee is too low");
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios.post("".concat(API_PREFIX, "/tx/raw"), {
                            txhex: hex
                        })];
                case 2:
                    txid = (_a.sent()).data;
                    return [2 /*return*/, txid];
                case 3:
                    error_1 = _a.sent();
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.sendTx = sendTx;
// reverse hexStr byte order
function reverseEndian(hexStr) {
    return hexStr.match(/../g).reverse().join('');
}
function compileContract(fileName, options) {
    var filePath = path.join(__dirname, 'contracts', fileName);
    var out = path.join(__dirname, 'out');
    var result = compileContractImpl(filePath, options ? options : {
        out: out
    });
    if (result.errors.length > 0) {
        console.log("Compile contract ".concat(filePath, " failed: "), result.errors);
        throw result.errors;
    }
    return result;
}
exports.compileContract = compileContract;
function compileTestContract(fileName) {
    var filePath = path.join(__dirname, 'tests', 'testFixture', fileName);
    var out = path.join(__dirname, 'tests', 'out');
    if (!existsSync(out)) {
        mkdirSync(out);
    }
    var result = compileContractImpl(filePath, {
        out: out
    });
    if (result.errors.length > 0) {
        console.log("Compile contract ".concat(filePath, " fail: "), result.errors);
        throw result.errors;
    }
    return result;
}
function loadDesc(fileName) {
    var filePath = '';
    if (!fileName.endsWith(".json")) {
        filePath = path.join(__dirname, "out/".concat(fileName, "_desc.json"));
        if (!existsSync(filePath)) {
            filePath = path.join(__dirname, "out/".concat(fileName, "_debug_desc.json"));
        }
    }
    else {
        filePath = path.join(__dirname, "out/".concat(fileName));
    }
    if (!existsSync(filePath)) {
        throw new Error("Description file ".concat(filePath, " not exist!\nIf You already run 'npm run watch', maybe fix the compile error first!"));
    }
    return JSON.parse(readFileSync(filePath).toString());
}
function showError(error) {
    // Error
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Failed - StatusCodeError: ' + error.response.status + ' - "' + error.response.data + '"');
        // console.log(error.response.headers);
    }
    else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the
        // browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
    }
    else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error:', error.message);
        if (error.context) {
            console.log(error.context);
        }
    }
}
;
function padLeadingZero(hex, byteslen) {
    if (byteslen === void 0) { byteslen = 0; }
    if (byteslen > 0) {
        if (hex.length < byteslen * 2) {
            return "0".repeat(byteslen * 2 - hex.length) + hex;
        }
    }
    if (hex.length % 2 === 0)
        return hex;
    return "0" + hex;
}
// checkLowS returns true if the sig hash is safe for low s.
function checkLowS(tx, lockingScript, inputSatoshis, inputIndex) {
    var preimage = getPreimage(tx, lockingScript, inputSatoshis, inputIndex);
    var sighash = bsv.crypto.Hash.sha256sha256(Buffer.from(toHex(preimage), 'hex'));
    var msb = sighash.readUInt8();
    return (msb < MSB_THRESHOLD);
}
var sleep = function (seconds) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, seconds * 1000);
            })];
    });
}); };
function deployContract(contract, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var privateKey, address, tx, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    privateKey = require('./privateKey').privateKey;
                    address = privateKey.toAddress();
                    tx = new bsv.Transaction();
                    _b = (_a = tx).from;
                    return [4 /*yield*/, fetchUtxos(address)];
                case 1:
                    _b.apply(_a, [_c.sent()])
                        .addOutput(new bsv.Transaction.Output({
                        script: contract.lockingScript,
                        satoshis: amount
                    }))
                        .change(address)
                        .sign(privateKey);
                    return [4 /*yield*/, sendTx(tx)];
                case 2:
                    _c.sent();
                    return [2 /*return*/, tx];
            }
        });
    });
}
//create an input spending from prevTx's output, with empty script
function createInputFromPrevTx(tx, outputIndex) {
    var outputIdx = outputIndex || 0;
    return new bsv.Transaction.Input({
        prevTxId: tx.id,
        outputIndex: outputIdx,
        script: new bsv.Script(),
        output: tx.outputs[outputIdx]
    });
}
function fetchUtxos(address) {
    return __awaiter(this, void 0, void 0, function () {
        var utxos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.get("".concat(API_PREFIX, "/address/").concat(address, "/unspent"))];
                case 1:
                    utxos = (_a.sent()).data;
                    return [2 /*return*/, utxos.map(function (utxo) { return ({
                            txId: utxo.tx_hash,
                            outputIndex: utxo.tx_pos,
                            satoshis: utxo.value,
                            script: bsv.Script.buildPublicKeyHashOut(address).toHex()
                        }); })];
            }
        });
    });
}
var emptyPublicKey = '000000000000000000000000000000000000000000000000000000000000000000';
function num2hex(d, padding) {
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
function toTarget(bitsHex) {
    var shift = bitsHex.substr(0, 2);
    var exponent = parseInt(shift, 16);
    var value = bitsHex.substr(2, bitsHex.length);
    var coefficient = parseInt(value, 16);
    var target = coefficient * Math.pow(2, (8 * (exponent - 3)));
    return BigInt(target);
}
/**
* convert pool difficulty to a target number
* @param {*}  difficulty which can fetch by api https://api.whatsonchain.com/v1/bsv/<network>/chain/info
* @returns target
*/
function pdiff2Target(difficulty) {
    if (typeof difficulty === 'number') {
        difficulty = BigInt(Math.floor(difficulty));
    }
    return BigInt(toTarget("1d00ffff") / difficulty);
}
