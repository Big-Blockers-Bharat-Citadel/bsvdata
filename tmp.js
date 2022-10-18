import {
    update
} from "./main.js"

export var emp = 0;

export function set_value_2(a){ 
    emp = a;
}

for (let i = 0; i < 5; i++) {
    let text = "The number is " + i + "<br>";
    update(text);
    console.log(emp);
}