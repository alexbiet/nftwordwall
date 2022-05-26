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

  document.querySelector("#btn-mint").addEventListener("click", function () {  callStartMint();});

  document.querySelector("#selected-account").textContent = selectedAccount.substring(0,6) + "..." + selectedAccount.slice(-4);
  document.querySelector("#selected-account-balance").textContent = humanFriendlyBalance + " " + selectedBalanceSymbol;

  // Display fully loaded UI for wallet data
  document.querySelector("#not-connected").style.display = "none";
  document.querySelector("#connected").style.display = "block";

}

async function callStartMint(){
  console.log("call mint");
  let contractAddress = "0x51c03204dc33eb484944342163c9bf468b4417aa"; //VRFConsumer
  console.log(contractAddress);
  const options = {
      contractAddress: contractAddress,
      functionName: "startMint",
      abi: abis.wordwallVRF,
      params: {
        _userMessage: "testMessage1",
      }
    }
    let  transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait();
    console.log(receipt);
}


async function refreshAccountData() {
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#not-connected").style.display = "block";


  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  document.querySelector("#btn-connect").removeAttribute("disabled")
  await fetchAccountData(provider);
}

async function callMint(){
  console.log("call mint");
  let contractAddress = db["testnet"]["Contracts"].WordWallMinter;
  console.log(contractAddress);
  const options = {
      contractAddress: contractAddress,
      functionName: "safeMint",
      abi: abis.wordwall,
      params: {
        to: "0x9518a55e5cd4Ac650A37a6Ab6c352A3146D2C9BD" ,
        _message: "test",
        _randomArray: [1,2,3,4,5,6]
      }
    }
    let  transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait();
    console.log(receipt.events[0]);
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
    address: "0x7Ae0e8F9830FcefdC58DF9f767c44f2429EBf9B7",
    topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        ethers.utils.id("MintMessage(string)")
    ]
  }


  wordWallContract = new ethers.Contract("0x7Ae0e8F9830FcefdC58DF9f767c44f2429EBf9B7", abis.wordwall, provider);

  // let events = await ethers.Contract.filters.MintMessage()
  // console.log(events);

   provider.on(filter, (log, event) => {
    // do whatever you want here 

    let iface = new ethers.utils.Interface(abis.wordwall);

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
var myInput = document.getElementById('edit_row_btn')

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