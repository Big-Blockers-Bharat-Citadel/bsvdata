import fetch from "node-fetch";

export async function fetch_balance(address) {
  let url =
    "https://api.whatsonchain.com/v1/bsv/test/address/" + address + "/balance";

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
