#! /usr/bin/env node

import { bsv } from "scryptlib";
import { config } from "dotenv";
config();

const hdPrivateKey = new bsv.HDPrivateKey(`${process.env.src}`)
console.log(`Your new bip32 xpriv-key is -> ${hdPrivateKey.toString()}\n`);
