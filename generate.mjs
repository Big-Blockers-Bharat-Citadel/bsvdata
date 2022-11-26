import { createRequire } from "module";
import { bsv } from "scryptlib";

const require = createRequire(import.meta.url);
var fs = require("fs");

var data = {};
data.table = [];

export function genPrivKey(src) {
  const newPrivKey = new bsv.PrivateKey.fromRandom(src); // src = "testnet"
  var obj = {
    private_key: `${newPrivKey.toWIF()}`,
    address: `${newPrivKey.toAddress()}`,
  };
  data.table.push(obj);
}

export function create_json(total) {
  for (let i = 0; i < total; i++) {
    genPrivKey();
  }

  fs.writeFile(
    "secrets.json",
    JSON.stringify(data, null, "\t"),
    "utf8",
    function (err) {
      if (err) throw err;
    }
  );
  
}
