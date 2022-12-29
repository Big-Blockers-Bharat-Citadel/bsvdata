# Project Overview

**bsvdata** is a **npm library** which allows the users to upload data (rows) from a .csv file through an endpoint api to **BSV Network** in real-time smoothly & effectively.  


## Website

[Block Data](https://block-data.netlify.app/) <br>
The user can see the data corresponding to transaction hash (txid) using the above website.


## Objective

1. The purpose of this project is to reduce the dependency on web2 ecosystem like use of central servers and database management system.
2. To demonstrate the tech-enthusiast and developer that how data-integrity and data-safety can be achieved by leveraging the use of BSV (Bitcoin Satoshi Vision).


## Tech-Stack Used

*  Scrypt
*  JavaScript
*  Node.js
*  MongoDB
*  Whatsonchain API
*  HTML
*  CSS & Bootstrap

## Libraries Used

* scryptlib
* bsv
* node-fetch
* mongodb
* dotenv

## Methods Used

* BSV network as *Decentralised Database*.
* Scrypt for *Smart-Contract*.
* JavaScript for *fetching* data and *interacting* with the user.
* Node.js for *automating compiling and deploying* of smart-contract.
* MongoDB for *storing* all transaction hash, transaction id etc.
* Whatonchain API for *retriving data* and other information and serve to the frontend.
* HTML / CSS / Bootstrap for *rendering data* to the frontend of our website.

## Project Description

This whole Web3 app on which we are working on can be broken into TWO components.

1. Transaction in blockchain in layman language injection of data into block and then finally feeded into blockchain.
This whole process has been achieved by making use of Smart-Contract, which is written in scrypt (Turing-complete programming language for BSV).

2. Data Fetching and serving information to the client  with the use of API in this case we have use WhatsOnChain ,which is specially for BSV.<br>
 A. We have used the the Javascript just for writing logic  and handling API information. <br>
 B. HTML / CSS / Bootstrap for providing skeleton to the webpage.
‍
## Getting Started

1. Use `npm install bsvdata` in your terminal to install **bsvdata** library along with all the dependencies. 
2. Follow along with the demo files content in the bsvdata folder.
4. To view data/row of the .csv file use the transaction hash in [Test-Whatonchain](https://test.whatsonchain.com/) webpage or just use our [webpage](https://block-data.netlify.app/).


## Developed & Maintained by

* [Ayush Kumar](https://github.com/Thisisakr47)
