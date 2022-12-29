import { fetch_balance } from "./lib/checker.mjs";
import { set_credentials } from "./lib/config.mjs";
import { newkey, derive_child_keys } from "./lib/generate.mjs";
import { get_balance, collect, transfer } from "./lib/normalize.mjs";

export let _fetch_balance = fetch_balance;
export let _newkey = newkey;
export let _derive_child_keys = derive_child_keys;
export let _get_balance = get_balance;
export let _collect = collect;
export let _transfer = transfer;
export let _set_credentials = set_credentials;