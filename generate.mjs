import { createRequire } from "module";
import { bsv } from "scryptlib";

const require = createRequire(import.meta.url);
var fs = require("fs");

var data = {};
data.table = [];
const extended_bip32_private_key ="tprv8ZgxMBicQKsPfAXdJwW4Yvmezqzgwq7AqTmQLS13aNXf8tEgTTdRT7qJ1sW5E9AzyVQXoWVKXsTPNt4jjpuC7Q6FMoi6KJtDc86Tu6SkeQQ";

export function genPrivKey(src) {
  const newPrivKey = new bsv.PrivateKey.fromRandom(src);
  var obj = {
    private_key: `${newPrivKey.toWIF()}`,
    address: `${newPrivKey.toAddress()}`,
  };
  data.table.push(obj);
}

export function genHDPrivKey(src, masterkey, total) {
  var hdPrivateKey;
  if(masterkey == null || masterkey == "") hdPrivateKey = new bsv.HDPrivateKey(src)
  else hdPrivateKey = new bsv.HDPrivateKey.fromString(masterkey);

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
}

// path must end with .json
// src = "testnet" or "mainnet" or "livenet"
// total = No. of keys to be generated
export function create_secrets(total, path, src) {
  data = {};
  data.table = [];

  for (let i = 0; i < total; i++) {
    genPrivKey(src);
  }

  fs.writeFile(
    path,
    JSON.stringify(data, null, "\t"),
    "utf8",
    function (err) {
      if (err) throw err;
    }
  );
}

//masterkey is the bip32 (extended) private key
export function create_hdkeys(total, path, src, masterkey){
  data = {};
  data.table = [];

  genHDPrivKey(src, masterkey, total);

  fs.writeFile(
    path,
    JSON.stringify(data, null, "\t"),
    "utf8",
    function (err) {
      if (err) throw err;
    }
  );
}

create_hdkeys(50, "./secrets-hd.json", "testnet", extended_bip32_private_key);