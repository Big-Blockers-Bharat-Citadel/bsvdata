export let pre_tx = "This is the Genesis Data";
export function set_value(a){ 
    pre_tx = a;
}

import {
    update
} from "./main.js"

function solve(){
    for (let i = 0; i < 5; i++) {
        let text = "The number is " + i + "<br>";
        update(text);
        console.log(pre_tx);
    }
}

solve();

