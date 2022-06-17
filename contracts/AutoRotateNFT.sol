//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { Base64 } from "base64-sol/base64.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AutoRotateNFT is ERC721 {
  using Strings for uint256;
  uint256 private _currentId;

  constructor() ERC721("PoolyRotate", "POOLY.R") {}

  /* ================================================================================ */
  /* External Functions                                                               */
  /* ================================================================================ */
  function mint() public {
    _mint(msg.sender, _currentId++);
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return constructTokenURI(tokenId);
  }

  function constructTokenURI(uint256 _tokenId) public view returns (string memory) {
    string memory name = string(abi.encodePacked("Pooly Rotating"));
    string memory description = string(abi.encodePacked("#", _tokenId.toString()));

    /**
     * The generateImage function could return a different image URI depending
     * on the tokenId and blocknumber. A timestamp could also work.
     */
    string memory image = generateImage(_tokenId, block.number);

    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(
            bytes(
              abi.encodePacked(
                '{"name":"',
                name,
                '", "description":"',
                description,
                '", "image": "',
                "data:image/svg+xml;base64,",
                image,
                '"}'
              )
            )
          )
        )
      );
  }

  function generateImage(uint256 _tokenId, uint256 blockNumber)
    public
    view
    returns (string memory)
  {}
}
