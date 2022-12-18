import { bsv } from "scryptlib";
import { src, total, key } from "./checker.mjs";

export function genHDPrivKey() {
  var hdPrivateKey;
  var data = {};
  data.table = [];

  if(key == null || key == ""){
    hdPrivateKey = new bsv.HDPrivateKey(src) // handles empty key
    console.log(`Your xpriv key is -> ${hdPrivateKey.toString()}\n`);
  }
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