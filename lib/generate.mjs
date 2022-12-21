import { bsv } from "scryptlib";
import { config } from "dotenv";
config();

const key = `${process.env.key}`;
const total = `${process.env.total}`;
const src = `${process.env.src}`;

// handles empty key
export function newkey(){
  const hdPrivateKey = new bsv.HDPrivateKey(src)
  console.log(`Your extended priv-key is -> ${hdPrivateKey.toString()}\n`);
  return hdPrivateKey;
}

export function genHDPrivKey() {
  var hdPrivateKey;
  var data = {};
  data.table = [];

  if(key == null || key == "") hdPrivateKey = newkey();
  else hdPrivateKey = new bsv.HDPrivateKey.fromString(key);

  for(var i=1; i<=total; i++){
    hdPrivateKey = hdPrivateKey.deriveChild(`m/${i}`);
    var public_key = hdPrivateKey.publicKey.toString();
    var private_key = hdPrivateKey.privateKey.toString();
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