#! /usr/bin/env node

import { bsv } from "scryptlib";
import envs from "./config.mjs";

const hdprivatekey = new bsv.HDPrivateKey(`${envs.src}`)
console.log(`Your new bip32 xpriv-key is -> ${hdprivatekey.toString()}\n`);
