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


  mintContract = new ethers.Contract(db.minterAddress[chainId], db.minterABI, provider);
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


let NFTMessage =  await mintContract.requestIdToMessage(_tokenId);
let NFTOwner = await mintContract.ownerOf(_tokenId);
let NFTURI = await mintContract.tokenURI(_tokenId);



let eventFilter = mintContract.filters.MintMessage()
let events = await mintContract.queryFilter(eventFilter)
let txId = events[_tokenId].transactionHash


const dataFetch = await fetch(NFTURI)
const json = await dataFetch.json()
//console.log(json)

//console.log("message: " + NFTMessage);

var nftObject = json["attributes"]
//console.log(nftObject);

//ugly, but we don't have time
let colors = {"undefined":1, "Magenta": 1, "Red":2, "Orange":3, "Lime":4, "Cyan":5, "White":6};
let fonts = {"undefined":1,"Kodchasan":1, "Press Start 2P":2, "Titan One":3, "Black Ops One":4, "Cabin Sketch":5, "Reggae One":6};
let sizes = {"undefined":1,"tiny":1, "smaller":2, "small":3, "medium":4, "large":5, "huge":6};
let faces = {"undefined":1,"SmirkyBlue":1, "HypedOrange":2, "AngryRed":3, "CoolGreen":4, "SusPurple":5, "CrazyYellow":5};



nftComponent = "<wall-message message=\""+NFTMessage+"\" owner="+ NFTOwner+" color=color-"+ colors[nftObject[0]["value"]]+" font=font-"+ fonts[nftObject[1]["value"]] +" size=size-"+sizes[nftObject[2]["value"]] +" face=face-"+faces[nftObject[3]["value"]] +" txid= "+ txId +"></wall-message>"


return nftComponent;


}



async function fetchNFTs() {
  let tokenId = await mintContract.tokenId();
  for( let i = 0; i <= tokenId; i++) {
    let nftComponent = await getNFTData(tokenId - i);
    document.getElementById("msg-container").innerHTML += nftComponent;
  }
}




async function callStartMint(){
  const chainId = await web3.eth.getChainId();
  console.log("call startMint");
  userMessage = inputEl.value;
  let contractAddress = db.vrfAddress[chainId]; //VRFConsumer
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

  web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

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

function generateTable(columns, rows){
  let tableHTML=`<div class="container-fluid">`;
  for(let i=0; i<rows; i++){
    tableHTML += `<div class="row dev text-center">`;
    for(let j=0; j<columns; j++){
      tableHTML += `<div class="col-3" id="cell-` + i + `-` + j +`">.</div>`; 
    }
    tableHTML += "</div>";
  }
  tableHTML += "</div>";


  return tableHTML;
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

  document.querySelector("#radio-mumbai").addEventListener("click", function () {switchNetworkMumbai();});
  document.querySelector("#radio-polygon").addEventListener("click", function () {switchNetworkPolygon();});
  
  fetchNFTs();

  

});

///////////////////////////
//    Switch Networks   ///
//or ADD nonexisting RPC///
////////////////////////////
const switchNetworkPolygon = async () => {
  try {
    await web3.currentProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }],
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        await web3.currentProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Polygon",
              rpcUrls: ["https://polygon-rpc.com"],
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://polygonscan.com"],
            },
          ],
        });

      } catch (error) {
        alert(error.message);
      }
    }
  }
}
const switchNetworkMumbai = async () => {
  try {
    await web3.currentProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }],
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        await web3.currentProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13881",
              chainName: "Mumbai",
              rpcUrls: ["https://polygon-mumbai.g.alchemy.com/v2/SqfaXTHKq6BcbY6g2ZaQ2OtxwjbsW1Wk"],
              nativeCurrency: {
                name: "Matic",
                symbol: "Matic",
                decimals: 18,
              },
              blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
            },
          ],
        });
      } catch (error) {
        alert(error.message);
      }
    }
  }
}



// Draggable Modal

var myModal = document.getElementById('mint-modal')

myModal.addEventListener('shown.bs.modal', function () {
  myInput.focus()
})

document.getElementById('mint-modal').style.display = 'block';
//reset modal if it isn't visible
if (!$(".modal.in").length) {
$(".modal-dialog").css({
    top: 10,
    left: window.innerWidth - 480,
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