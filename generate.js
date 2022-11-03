import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { bsv } = require("scryptlib");
const { exit } = require('process');
const { buildContractClass, toHex, signTx, Ripemd160, Sig, PubKey} = require('scryptlib');

var total = 1;

export let rand_address = [];
export let private_key = [];

function genPrivKey() {
    const newPrivKey = new bsv.PrivateKey.fromRandom('testnet')
    rand_address.push(`${newPrivKey.toAddress()}`);
    private_key.push(`${newPrivKey.toWIF()}`);

}

async function sendTx(tx, address) {
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

async function tmp(){
    const keyPayer = 'cUS5fdQ7P26VsWuFcBzLt7Jemcx2ho2sgUPnZDGjhP7DLounEegj'  // Ayush WIF for funding contracts
    const privateKey = new bsv.PrivateKey.fromWIF(keyPayer)
    const publicKeyPayer = privateKey.publicKey

    // console.log(publicKeyPayer);

    const keyPayee = 'cRfw5AoMHLqtB4xgc5QFs8zHG8xGuEf25T4LfDsozaKfMgma84Zb'  // 1st WIF to receive funds
    let priKeyPayee = new bsv.PrivateKey.fromWIF(keyPayee); // Payee (eg 1st) Private Key receive funds
    const publicKeyPayee = priKeyPayee.publicKey

    // console.log(publicKeyPayee);


    var data = require("./out/p2pkh_debug_desc.json");
    const P2PKH = buildContractClass(JSON.parse(JSON.stringify(data)));
    const publicKeyPayeeHash = bsv.crypto.Hash.sha256ripemd160(publicKeyPayee.toBuffer())
    const p2pkh = new P2PKH(new Ripemd160(toHex(publicKeyPayeeHash)))
    // console.log(publicKeyPayeeHash);
    // console.log(P2PKH);
    console.log('p2pkh: ', toHex(publicKeyPayeeHash))


    const amountInContract = 1000;
    const deployTx = await createLockingTx(privateKey.toAddress(), amountInContract)
    deployTx.outputs[0].setScript(p2pkh.lockingScript)
    const FEE = 100
    const spendAmount = 100
    deployTx.sign(privateKey)
    const deployTxId = await sendTx(deployTx)
  
    console.log('Contract Deployed Successfully! TxId: ', deployTxId)
}


tmp();

// for(let i=0; i<total; i++){
//     genPrivKey();
//     console.log(i + "\nAddress -> " + rand_address[i] + "\nPrivate Key -> " + private_key[i] + "\n");
// }

