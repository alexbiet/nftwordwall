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

    mapping(uint256 => string) public requestIdToAttributes;
    address private VRFContractAddress;

    event MintMessage(string message);

    constructor() ERC721("WordWallStringMinter", "WWS") {}

    function safeMint(address to, string memory _message, uint256 _randomNum) public onlyVRFContract {
        uint256 tokenId = _tokenIdCounter.current();
        string memory message = _message;
        string memory randomVals;
         randomVals = Strings.toString(_randomNum);
         randomVals = string.concat( " | " , randomVals);
         message = string.concat(message, randomVals);

        _tokenIdCounter.increment();

        requestIdToAttributes[tokenId] = message;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, message);

        emit MintMessage(message);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) onlyOwner {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {  
         return super.tokenURI(tokenId);
    }
    function setVRFContract(address _newVRFContractAddress) public onlyOwner {
        VRFContractAddress = _newVRFContractAddress;
    }

    modifier onlyVRFContract() {
      require(msg.sender == VRFContractAddress, "must be VRFContract");
      _;
    }



    
}