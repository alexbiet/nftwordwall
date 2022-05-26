/** Connect to Moralis server */
let serverUrl = "https://vvkwmpxspsnn.usemoralis.com:2053/server";
let appId = "MUEMJ6Nck6DWuhKWVhhJJjsCCfyzTSJviAQ2xZkq";

Moralis.start({ serverUrl, appId });

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const ethers = Moralis.web3Library;



////////////////
///Web3 Modal///
////////////////
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

let web3Modal;
let provider;
let selectedAccount;



function init() {

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "4a50be229d4d485cb7b65eec5e5d9440",
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    disableInjectedProvider: false,
  });
}


async function fetchAccountData() {

  //const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  const chainData = evmChains.getChain(chainId);
  let network = chainData["network"];
  //console.log("Web3 instance is", web3, "Network is: " + network);
  document.querySelector("#network-name").textContent = chainData.name;



  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  const selectedAccountBalance = await web3.eth.getBalance(accounts[0]);
  const selectedEthBalance = web3.utils.fromWei(selectedAccountBalance, "ether");
  const humanFriendlyBalance = parseFloat(selectedEthBalance).toFixed(4);
  let selectedBalanceSymbol = "ETH";

  if(network === "rinkeby"){
    selectedBalanceSymbol = "ETH";
  }else {
    selectedBalanceSymbol = chainData["nativeCurrency"].symbol;
  }

<<<<<<< Updated upstream
  document.querySelector("#btn-mint").addEventListener("click", function () {  callStartMint();});
=======
  document.querySelector("#btn-mint").addEventListener("click", function () {  callMint(document.getElementById("mint-word").value);});
  //document.querySelector("#btn-read").addEventListener("click", function () {  parseNFT("testing|12345678998765");});
>>>>>>> Stashed changes

  document.querySelector("#selected-account").textContent = selectedAccount.substring(0,6) + "..." + selectedAccount.slice(-4);
  document.querySelector("#selected-account-balance").textContent = humanFriendlyBalance + " " + selectedBalanceSymbol;

  // Display fully loaded UI for wallet data
  document.querySelector("#not-connected").style.display = "none";
  document.querySelector("#connected").style.display = "block";

}

async function getChainlinkData(){

const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]

//Mumbai matic price feed: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
//Polygon Matic price feed: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
const addr = "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676"
const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider)
priceFeed.latestRoundData()
    .then((roundData) => {
        // Do something with roundData
        num = ethers.BigNumber.from(roundData[0]._hex) / 10 ** 18
        console.log("Latest Round Data", num.toString())
    })

}

async function callStartMint(){
  console.log("call mint");
  userMessage = inputEl.value;
  let contractAddress = db.vrfAddress; //VRFConsumer
  const options = {
      contractAddress: contractAddress,
      functionName: "startMint",
      abi: db.vrfABI,
      params: {
        _userMessage: "testMessage1",
      },
      msgValue: 1000000000000000,
    }
    let  transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait();
    console.log(receipt);
}

inputEl = document.getElementById("mint-word");

async function refreshAccountData() {
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#not-connected").style.display = "block";


  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  document.querySelector("#btn-connect").removeAttribute("disabled")
  await fetchAccountData(provider);
}

async function callMint(){
  console.log("call mint");
  let contractAddress = db.minterAddress;
  console.log(contractAddress);
  const options = {
      contractAddress: contractAddress,
      functionName: "safeMint",
      abi: db.minterABI,
      params: {
        to: "0x9518a55e5cd4Ac650A37a6Ab6c352A3146D2C9BD" ,
        _message: usermessage,
        _randomArray: [11,32,23]
      }
    }
    let  transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait();
    console.log(receipt.events[0]);
}


function parseNFT(data){
  pos = data.lastIndexOf('|');
  message = data.substring(0,pos);
  metadata = data.substring(pos+1);


  var nftObject = {}

  nftObject["message"] = message;
  nftObject["size"]= Number(metadata.slice(0,2));
  nftObject["color"]= Number(metadata.slice(2,4));
  nftObject["font"] = Number(metadata.slice(4,6));
  nftObject["duration"] = Number(metadata.slice(6,8));
  nftObject["xcoord"] = Number(metadata.slice(8,11));
  nftObject["ycoord"] = Number(metadata.slice(11,14));

  console.log(nftObject);
  return nftObject;
}


async function onConnect() {
  try {
    provider = await web3Modal.connect();

    let moralisProvider = provider.isMetaMask;

    if (moralisProvider === undefined) {
      moralisProvider = "walletconnect";
    } else {
      moralisProvider = "metamask";
    }
    provider = await Moralis.enableWeb3({ provider: moralisProvider });

  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }


  filter = {
    address: db.minterAddress,
    topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        ethers.utils.id("MintMessage(string)")
    ]
  }

  getChainlinkData();


  wordWallContract = new ethers.Contract(db.minterAddress, db.minterABI, provider);

  // let events = await ethers.Contract.filters.MintMessage()
  // console.log(events);

   provider.on(filter, (log, event) => {
    // do whatever you want here 

    let iface = new ethers.utils.Interface(db.minterABI);

    parseEvent = iface.parseLog(log);
    console.log("event triggered");
    console.log(parseEvent);
  })


  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });
  await refreshAccountData();
}



async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  if(provider.close) {
    await provider.close();
    await web3Modal.clearCachedProvider();
    provider = null;
  }
  localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  await web3Modal.clearCachedProvider();
  selectedAccount = null;

  document.querySelector("#not-connected").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}


window.addEventListener('load', async () => {
  init();
  if(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) await onConnect();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);

});



// Draggable Modal

var myModal = document.getElementById('mint-modal')

myModal.addEventListener('shown.bs.modal', function () {
  myInput.focus()
})

document.getElementById('mint-modal').style.display = 'block';
// reset modal if it isn't visible
if (!$(".modal.in").length) {
$(".modal-dialog").css({
    top: 0,
    left: 0,
});
}

$(".modal-dialog").draggable({
    cursor: "move",
    handle: ".dragable_touch",
});

$("#collapse-minus").hide();
$("#collapse-plus").show();



$('#mint-modal').on('shown.bs.collapse', function () {
    $("#collapse-minus").show();
    $("#collapse-plus").hide();
});

$('#mint-modal').on('hidden.bs.collapse', function () {
    $("#collapse-plus").show();
    $("#collapse-minus").hide();
});