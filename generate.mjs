import { createRequire } from "module";
import { bsv } from "scryptlib";

const require = createRequire(import.meta.url);
var fs = require("fs");

var data = {};
data.table = [];
var source = "testnet";

export function genPrivKey() {
  const newPrivKey = new bsv.PrivateKey.fromRandom(source); // src = "testnet"
  var obj = {
    private_key: `${newPrivKey.toWIF()}`,
    address: `${newPrivKey.toAddress()}`,
  };
  data.table.push(obj);
}

export function create_json(total, path) {
  source = src;
  for (let i = 0; i < total; i++) {
    genPrivKey();
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
