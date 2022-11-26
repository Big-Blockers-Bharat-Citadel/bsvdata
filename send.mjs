import { bsv } from 'scryptlib';
import axios from "axios";
const API_PREFIX = "https://api.whatsonchain.com/v1/bsv/test";

// fetch Utxos
export async function fetchUtxos(address, amount) {
  let { data: utxos } = await axios.get(`${API_PREFIX}/address/${address}/unspent`)
    .catch(async () => {
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
export async function sendTx(tx) {
  const hex = tx.toString();
 
  if (!tx.checkFeeRate(50)) {
    throw new Error(`checkFeeRate fail, transaction fee is too low`);
  }
  try {
    const { data: txid } = await axios
      .post(`${API_PREFIX}/tx/raw`, {txhex: hex,})
      .catch(async (err) => {
        throw err;
      });
 
    return txid;
  } 
  catch (error) {
    throw error;
  }
}

// send money to multiple addresses
export async function send_money(sender_priv_key, reciever_addresses, amount_to_send) {
  const senderPrivateKey = new bsv.PrivateKey.fromWIF(sender_priv_key);
  const senderAddress = `${senderPrivateKey.toAddress()}`

  let utxos = await fetchUtxos(senderAddress);

  const tx = new bsv.Transaction()

  tx.from(utxos)

  for(let reciever_address of reciever_addresses) {  
    tx.addOutput(new bsv.Transaction.Output({
      script: bsv.Script.buildPublicKeyHashOut(reciever_address),
      satoshis: amount_to_send,
    }))
  }

  tx.change(senderAddress)
    .sign(senderPrivateKey)
    .seal();

  await sendTx(tx);
}