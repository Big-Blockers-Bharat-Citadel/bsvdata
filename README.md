# Project Overview

**BlockData** is website which fetches the data of a .csv file through api and upload its data in **BSV Blockchain Network** which makes the data decentralised. The data of any rows in a .csv file can be accessed through their *row index* and *transaction hash*.


## Project Status

[Website](https://block-data.netlify.app/) [In Progress]


## Objective

1. The purpose of this project is to reduce the dependency on web2 ecosystem like use of central servers and database management system.
2. To demonstrate  the tech-enthusiast and developer that  how data-integrity and data-safety can be achieved by  leveraging the use of BSV(bitcoin satoshi vision).


## Tech-Stack Used

*  BSV (Bitcoin Satoshi Vision) Network
*  Scrypt
*  JavaScript
*  Node.js
*  MongoDB
*  Whatsonchain API
*  HTML
*  CSS / Bootstrap

## Libraries Used

* Scrypitlib
* Axios

## Methods Used

* BSV network as *Decentralised Database*.
* Scrypt as *Smart-Contract*.
* Java-script for *fetching* data and *interacting* with the user.
* Node.js for *automating compiling and deploying* of smart-contract.
* MongoDB for *storing* all transaction hash, transaction id etc.
* Whatonchain API for *retriving data* and other information and serve to the frontend.
* HTML / CSS / Bootstrap for *rendering data* to the frontend of our website.

## Project Description

This whole Web3 app on which we are working on can be broken into TWO components.

1. Transaction in blockchain ,in layman language injection of data into block and then finally feeded into blockkchain.
This whole process has been achieved by making use of Smart-Contract, which is written in scrypt (Turing-complete programming language for BSV).

2. Data Fetching and serving information to the client  with the use of API in this case we have use WhatsOnChain ,which is specially for BSV.<br>
 A. We have used the the Javascript just for writing logic  and handling API information. <br>
 B. HTML / CSS / Bootstrap for providing skeleton to the webpage.
‍
## Getting Started

1. Clone this repository.
2. Use `npm install scryptlib` and `npm install axios` in your cmd/bash to install all the dependencies
3. Pass any data with the `update` function in **main.js** file to deploy any data on BSV network. 
4. You will recieve a transaction hash which can be used to see all the details using [Test-Whatonchain](https://test.whatsonchain.com/) webage or our [webpage](https://block-data.netlify.app/)


## Developed & Maintained by

* [Ayush Kumar](https://github.com/Thisisakr47)
