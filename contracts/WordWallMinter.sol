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
    address private VRFContractAddress;

    event MintMessage(string message);

    constructor() ERC721("WordWallStringMinter", "WWS") {}

    function safeMint(address to, string memory _message, uint256 _requestId) public onlyVRFContract {
        uint256 tokenId = _tokenIdCounter.current();
        string memory message = _message;

        _tokenIdCounter.increment();
        requestIdToMessage[tokenId] = message;
        requestIdToTokenId[_requestId] = tokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, "defaultURI");  //add defaultURI
        emit MintMessage(message);
    }
    function testFunct(uint256 _randomNum, uint256 _requestId) external onlyVRFContract returns(uint256) {
        return 2;
    }

    function updateURI(uint256 _randomNum, uint256 _requestId) external onlyVRFContract {
         string memory newUriPath;
         newUriPath = Strings.toString(_randomNum);
         newUriPath = string.concat( "uriMainDirectory" , newUriPath);
         _setTokenURI(requestIdToTokenId[_requestId], newUriPath);

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