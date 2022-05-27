// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WordWallMinter is ERC721,ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => string) public requestIdToMessage;
    mapping(uint256 => uint256) public requestIdToTokenId;
    uint256 public tokenId = 0;
    address private VRFContractAddress;

    event MintMessage(string message);

    constructor() ERC721("WordWallStringMinter", "WWS") {}

    function safeMint(address to, string memory _message, uint256 _requestId) public onlyVRFContract {
        tokenId = _tokenIdCounter.current();
        string memory message = _message;

        _tokenIdCounter.increment();
        requestIdToMessage[tokenId] = message;
        requestIdToTokenId[_requestId] = tokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, "https://bafybeigfltfqhlporfnwoeqiwoxj6ezw5ymqvd3ykfywqbkn4q6lxxhx5i.ipfs.infura-ipfs.io/");  //add defaultURI
      
       
        emit MintMessage(message);
    }
     
    function updateURI(uint256 _requestId, uint256 _randomNum) external onlyVRFContract {
        string memory newUriPath;
        newUriPath = Strings.toString(_randomNum);
        newUriPath = string.concat( "uriMainDirectory" , newUriPath);
        _setTokenURI(requestIdToTokenId[_requestId], "https://bafybeigfltfqhlporfnwoeqiwoxj6ezw5ymqvd3ykfywqbkn4q6lxxhx5i.ipfs.infura-ipfs.io/");
     }


    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {  
         return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) onlyOwner {
        super._burn(tokenId);
    }
    
    function setVRFContract(address _newVRFContractAddress) public onlyOwner {
        VRFContractAddress = _newVRFContractAddress;
    }

    modifier onlyVRFContract() {
      require(msg.sender == VRFContractAddress, "must be VRFContract");
      _;
    }



    
}