/** Connect to Moralis server */
let serverUrl = "https://vvkwmpxspsnn.usemoralis.com:2053/server";
let appId = "MUEMJ6Nck6DWuhKWVhhJJjsCCfyzTSJviAQ2xZkq";

Moralis.start({ serverUrl, appId });

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const ethers = Moralis.web3Library;
let provider;