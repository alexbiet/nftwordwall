// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WordWallMinter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
//import "https://github.com/alexbiet/nftwordwall/blob/main/contracts/WordWallMinter.sol";

contract WordWallVRF is VRFConsumerBaseV2, Ownable {
  VRFCoordinatorV2Interface COORDINATOR;

  // Your subscription ID.
  uint64 s_subscriptionId = 375;

  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed; //MUMBAI VRF Co

  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f; //MUMBAI 500GWEI key

  // Depends on the number of requested values that you want sent to the
  // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
  // so 100,000 is a safe default for this example contract. Test and adjust
  // this limit based on the network that you select, the size of the request,
  // and the processing of the callback request in the fulfillRandomWords()
  // function.
  uint32 callbackGasLimit = 1000000;

  // The default is 3, but you can set this higher.
  uint16 requestConfirmations = 3;

  // For this example, retrieve 1 random value in one request.
  uint32 numWords =  1;

  mapping(uint256 => address) public requestIdToAddress;
  mapping(uint256 => uint256) public requestIdToRandomNums;
  string public userMessage;
  address public userAddress;
  address deployedMinterAddress;
  address s_owner;
  uint256 public lastRandom;
  

  constructor(address _deployedMinterAddress) VRFConsumerBaseV2(vrfCoordinator) {
    deployedMinterAddress = _deployedMinterAddress;
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_owner = msg.sender;
  }
   // Assumes the subscription is funded sufficiently.
  function requestRandomWords() internal returns (uint256) { 
    // Will revert if subscription is not set and funded.
    uint256 s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
    return s_requestId;
  }
  
  function fulfillRandomWords(uint256 _requestId, /* requestId */
    uint256[] memory _randomWords) internal override {
    uint256 randomNum = _randomWords[0];
    uint32 randomNumCast = uint32(randomNum);
    randomNumCast = randomNumCast % 1296;
    lastRandom = randomNum;
    requestIdToAddress[_requestId] = userAddress;
    requestIdToRandomNums[_requestId] = randomNum;
    WordWallMinter(deployedMinterAddress).updateURI(randomNumCast, _requestId);
  }

  function startMint(string memory _userMessage) public payable {
        require(msg.value == 1000000000000000,"Please pay adequate Mint Fee"); //0.001 
        userAddress = msg.sender;
        userMessage = _userMessage;
        uint256 requestId = requestRandomWords();
        WordWallMinter(deployedMinterAddress).safeMint(userAddress, userMessage, requestId);
 
    }


  function withdrawlFunds() public onlyOwner {
    address payable to = payable(s_owner);
    to.transfer(address(this).balance);
  }
}
