import { createRequire } from "module";
import { bsv } from "scryptlib";

const require = createRequire(import.meta.url);
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var fs = require('fs');

// TODO: Ask for this in script input - Done
// TODO: npm run script generate.ts 5000
// TODO: -> secrets.json - Done

var data = {}
data.table = []

function genPrivKey() {
  const newPrivKey = new bsv.PrivateKey.fromRandom('testnet')
  var obj = {
    private_key: `${newPrivKey.toWIF()}`,
    address: `${newPrivKey.toAddress()}`
  };
  data.table.push(obj);
}

function create_json(total){
  for(let i=0; i<total; i++){
    genPrivKey();
    // TODO: dump addresses to a json file in format - Done
    // TODO: [ { private_key: "", address: "" } ] - Done
  }

  // TODO : Beautify JSON - Done
  fs.writeFile ("secrets.json", JSON.stringify(data,null,'\t'), 'utf8', function(err) {
      if (err) throw err;
      console.log(`${total} addresses generated`);
    }
  );
}

rl.question("Number of Address required ", function(total) {
    create_json(total);
    rl.close();
});



