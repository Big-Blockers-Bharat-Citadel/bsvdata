import { bsv } from "scryptlib";
import envs from "./config.mjs";

const key = `${envs.key}`;
const total = `${envs.total}`;
const src = `${envs.src}`;

// handles empty key
export function newkey(){
  const hdPrivateKey = new bsv.HDPrivateKey(src)
  console.log(`Your extended priv-key is -> ${hdPrivateKey.toString()}\n`);
  return hdPrivateKey;
}

export function derive_child_keys() {
  var hdprivatekey;
  var data = {};
  data.table = [];

  if(key == null || key == "") hdprivatekey = newkey();
  else hdprivatekey = new bsv.HDPrivateKey.fromString(key);

  for(var i=1; i<=total; i++){
    hdprivatekey = hdprivatekey.deriveChild(`m/${i}`);
    var public_key = hdprivatekey.publicKey.toString();
    var private_key = hdprivatekey.privateKey.toString();
    var newPrivKey = new bsv.PrivateKey(private_key);
    var address = `${newPrivKey.toAddress()}`;
    var obj = {
      public_key: public_key,
      private_key: private_key,
      address: address,
    };
    data.table.push(obj);
  }

  return data;
}