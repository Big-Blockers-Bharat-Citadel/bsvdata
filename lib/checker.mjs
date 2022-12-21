import fetch from "node-fetch";
import { config } from "dotenv";
config();

export async function fetch_balance(address) {
  let url = `https://api.whatsonchain.com/v1/bsv/${process.env.src.slice(0,4)}/address/${address}/balance`;

  try {
    const response = await fetch(url);
    var data = await response.json();
    if (response) {
      const balance = data.confirmed + data.unconfirmed;
      return balance;
    }
  } catch (error) {
    return 0;
  }
}