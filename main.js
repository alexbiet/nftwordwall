/** Connect to Moralis server */
let serverUrl = "https://vvkwmpxspsnn.usemoralis.com:2053/server";
let appId = "MUEMJ6Nck6DWuhKWVhhJJjsCCfyzTSJviAQ2xZkq";

Moralis.start({ serverUrl, appId });



const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;


let web3;
let ethers;

let web3Modal;

let provider;
let selectedAccount;
let mintContract;



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
  
  ethers = Moralis.web3Library;
  web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  
  const chainId = await web3.eth.getChainId();
  const chainData = evmChains.getChain(chainId);
  let network = chainData["network"];
  document.querySelector("#network-name").textContent = chainData.name;

  getChainlinkData(chainId);

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

  document.querySelector("#btn-mint").addEventListener("click", function () {  callStartMint(document.getElementById("mint-word").value);});
  //document.querySelector("#btn-read").addEventListener("click", function () {  parseNFT("testing|12345678998765");});

  document.querySelector("#selected-account").textContent = selectedAccount.substring(0,6) + "..." + selectedAccount.slice(-4);
  document.querySelector("#selected-account-balance").textContent = humanFriendlyBalance + " " + selectedBalanceSymbol;

  // Display fully loaded UI for wallet data
  document.querySelector("#not-connected").style.display = "none";
  document.querySelector("#connected").style.display = "block";


  mintContract = new ethers.Contract(db.minterAddress, db.minterABI, provider);
  //getNFTData(0);
  document.getElementById("test-button").addEventListener("click", function () { getNFTData(testInputEl.value)} );


}



inputEl = document.getElementById("mint-word");
testInputEl = document.getElementById("test-input");


async function getChainlinkData(chainId){

  const aggregatorV3InterfaceABI = db.aggregatorV3InterfaceABI;

  const addr = db.priceFeedAddresses[chainId]
  const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider)
  const decimals = await priceFeed.decimals();

  priceFeed.latestRoundData()
      .then((roundData) => {
          // Do something with roundData
          num = ethers.BigNumber.from(roundData[1]) / 10 ** decimals
          priceSpan = document.getElementById("matic-price");
          priceSpan.innerHTML = num.toFixed(2);
          
      })

}

async function getNFTData(_tokenId) {
console.log(mintContract)
let NFTData =  await mintContract.requestIdToAttributes(_tokenId);
let NFTOwner = await mintContract.ownerOf(_tokenId);
console.log(NFTOwner);
parseNFT(NFTData, NFTOwner)
}



async function callStartMint(){
  console.log("call startMint");
  userMessage = inputEl.value;
  let contractAddress = db.vrfAddress; //VRFConsumer
  const options = {
      contractAddress: contractAddress,
      functionName: "startMint",
      abi: db.vrfABI,
      params: {
        _userMessage: userMessage,
      },
      msgValue: 1000000000000000,
    }
    let  transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait();
    console.log(receipt);
}



function parseNFT(data, owner){
  console.log(data)
  pos = data.lastIndexOf('|');
  message = data.substring(0,pos-1);
  metadata = data.substring(pos+2);

  console.log(message);

  var nftObject = {}


  nftObject["xcoord"] = Number(metadata.slice(8,11));
  nftObject["ycoord"] = Number(metadata.slice(11,14));
  nftObject["message"] = message;
  nftObject["owner"] = owner; 


  var attr_names = ["color", "font", "size", "duration"]

  for(let i= 0; i<8; i+=2){
    let category= attr_names[i/2];

    let value = Number(metadata.slice(i,i+2));
    value = (value % 6) +1;
    
    let id_class = category+ "-" + value
    nftObject[category] = id_class;

  }


  console.log(nftObject["message"]);

  var targetDiv = document.getElementById('testDiv');
  targetDiv.innerHTML = "<wall-message message="+nftObject["message"]+" owner="+ nftObject["owner"]+" xcoord="+ nftObject["xcoord"]+" ycoord="+ nftObject["ycoord"]+" color="+ nftObject["color"]+" font="+ nftObject["font"] +" size="+nftObject["size"] +" duration="+nftObject["duration"] +"></wall-message>"


  //return nftObject;
}


async function refreshAccountData() {
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#not-connected").style.display = "block";

  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  document.querySelector("#btn-connect").removeAttribute("disabled")
  await fetchAccountData(provider);
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


  // filter = {
  //   address: db.minterAddress,
  //   topics: [
  //       // the name of the event, parnetheses containing the data type of each event, no spaces
  //       ethers.utils.id("MintMessage(string)")
  //   ]
  // }


   //let events = await ethers.Contract.filters.MintMessage()
  // console.log(events);

  //  provider.on(filter, (log, event) => {
    // do whatever you want here 

    // let iface = new ethers.utils.Interface(db.minterABI);

    // parseEvent = iface.parseLog(log);
    // console.log("event triggered");
    // console.log(parseEvent);
  // })
  

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