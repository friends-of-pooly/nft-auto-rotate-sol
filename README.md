![banner-auto-rotating-nft](https://user-images.githubusercontent.com/3408362/174283301-16c309c5-f7cb-4c01-872c-144979b99658.png)

# Experiment: Auto-Rotating NFT | Pooly "Magic" PFP

The Auto-Rotating NFT a.k.a Pooly "Magic" PFP will be an automatically updating NFT to showcase FoP Artists.

**what:** auto-rotating profile picture <br/>
**why:** showcase community artists <br/>
**how:** on-chain ERC721 metadata generation  <br/>

## Getting Involved

Experiments are an opportunity for the Friends of Pooly community to get involved, learn and have some fun.

**Step 1:** Join the Discord </br>
**Step 2:** Find the #birb-headquarters channel </br>
**Step 3:** Introduce Yourself to friends of Pooly </br>

[<img width="200px" src="https://user-images.githubusercontent.com/3408362/174302052-6757cf66-f454-4298-b150-2df023ab69e8.png"/>](https://discord.gg/fXJg8C3gd8)

Contributors will be highlighted across the Friends of Pooly communication channels.

# Overview

The Auto-Rotating NFT experiment will test rotating on-chain NFT metadata descriptors.

### Why

The Friends of Pooly recently had a PFP contest. Several artists contributed art to the FoP assets collection. It would be great to showcase artist with contributions with a Friends of Pooly NFT that automatically rotates to a new artist submission.

### How

NFT can generate item `metadata` completely on-chain; compared to the more commonly IPFS or centralized server approach to store the information.

By generating the NFT metadata on-chain it's possible to rotate the image using `blockNumber` or `timestamp`.

Using this approach new FoP artists submissions can be automatically featured without requiring a transaction to update the blockchain.

### App Design Example

The app design below is a simple sketch of what the rotating UI could look like. Coding the user interface is not required right now, but is included as an example for what it might look like in the future.

<img width="500px" src="https://user-images.githubusercontent.com/3408362/174283691-4758e4c5-87ea-47c6-90cc-4a5d43ea9ac8.png" />

### Code Example:

The code snippets below provide a rough outline for having automatically rotating images in an NFT.

```sol
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

function generateImage(uint256 _tokenId, uint256 blockNumber) public view returns (string memory) {}

```

# Installation

Install the repo and dependencies by running:
`yarn`

## Deployment

These contracts can be deployed to a network by running:
`yarn deploy <networkName>`

## Verification

These contracts can be verified on Etherscan, or an Etherscan clone, for example (Polygonscan) by running:
`yarn etherscan-verify <ethereum network name>` or `yarn etherscan-verify-polygon matic`

# Testing

Run the unit tests locally with:
`yarn test`

## Coverage

Generate the test coverage report with:
`yarn coverage`
