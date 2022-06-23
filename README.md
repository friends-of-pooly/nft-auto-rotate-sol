![banner-auto-rotating-nft](https://user-images.githubusercontent.com/3408362/174283301-16c309c5-f7cb-4c01-872c-144979b99658.png)

# Experiment: Auto-Rotating NFT | Pooly "Magic" PFP

The Pooly "Magic" PFP bounty is an experiment to test auto-rotating NFT images using completely on-chain logic. It should be possible to automatically rotate to a different Artist submission after X amount of time has passed.

**What:** Auto-rotating profile picture

**Why:** Showcase community artists

**How:** On-chain ERC721 metadata generation

**Example:** Every 7 days a new PFP submission will be used with no additional on-chain transaction. 

**Submissions:** https://twitter.com/FriendsofPooly/status/1537767237028749315/photo/1

# Overview

The Auto-Rotating NFT experiment will test rotating on-chain NFT metadata descriptors.

### Why

Highlight Artist in the Friends of Pooly community.

Experiment with the intersection of community Art and NFTs.

The Friends of Pooly recently had a PFP contest. Several amazing artists contributed. It would be great to showcase these Artist.

In short, the experiment is perfect for any **intermediate solidity developers** who want to level-up their skills and positively contribute to the Friends of Pooly community.

### How

NFTs can generate item `metadata` completely on-chain; compared to the more commonly IPFS or centralized server approach to store the information.

By generating the NFT metadata on-chain it's possible to rotate the image using blocknumber and/or timestamps.

# Implementation

The AutoRotateNFT.sol contract in this repo implements the above functionality and more with a dynamic artwork list and per-token customizable parameters that allow each holder of the "Magic Pooly PFP" to control how often their own profile picture changes and even allows a holder to lock it to their favorite image or always display the most recent profile addition if they wish to.

The following code examples demonstrate the setup and typical usage of the contract:

## Setup

To setup the contract after it has been deployed, the starting list of profile pictures should be added by using the `pushImage(string _uri, string _artist)` function. The following ethers code will push image data to the list:

```ts
// Image URI's can be any valid image URI as defined in the ERC721 Metadata JSON Schema
const imageURI = "ipfs://QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/IMG_0405.png";

// The artist field is any extra string that best describes the artist. We will use a twitter handle in this example.
const artist = "@artmilitonian";

// Connect the owner of the contract and use the `pushImage` function to push the data onto the image list:
await autoRotateNFTContract.connect(signer).pushImage(imageURI, artist);
```

There are three default image rotation parameters that can also be changed:

```ts
/**
 * The following will change the `defaultBlockDuration` value which defines how many blocks will 
 * elapse before the profile picture will change.
 * 
 * Here we use a value of 5760 which would be approximately once every day on ethereum mainnet.
 */
await autoRotateNFTContract.connect(signer).setDefaultBlockDuration(5760);

/**
 * The next line will change the `defaultImageOffset` value which allows the schedule to be shifted 
 * forward. For example, if an offset of `1` is provided and the 1st image is supposed to be 
 * displayed at this time, the 2nd image will be displayed instead.
 * 
 * Here we will set the offset to `0`.
 */
await autoRotateNFTContract.connect(signer).setDefaultImageOffset(0);

/**
 * Finally, we can also change the `defaultUseMostRecent` boolean value which allows use to specify 
 * whether the most recently added profile picture should be displayed at all times or not. If this 
 * is set to true, then the block duration and image offsets provided will not affect the displayed
 * image.
 * 
 * Here we will set the value to `false` to allow the default behavior to be image rotation.
 */
await autoRotateNFTContract.connect(signer).setDefaultUseMostRecent(false);

/**
 * NOTE: all of these default values can be overridden on a per-token basis as described later.
 */
```

## Updating Image Data

Since adding images to the list may become a weekly event, it is entirely likely that a mistake or typo may occur and the wrong image data is added to the image list. To prevent this from breaking or ruining the experience of the token, an option to update image data has been added. This can only be done by the owner of the contract.

The following demonstrates how to update existing image data:

```ts
const targetIndex = 0;
const newImageURI = "{ new URI }";
const newImageArtist = "{ new artist descriptor }";
await autoRotateNFTContract.connect(signer).updateImage(targetIndex, newImageURI, newImageArtist);
```

## Minting

To mint a token, simply call the mint function with the desired signer:

```ts
await autoRotateNFTContract.connect(signer).mint();
```

## Customizing Token Behavior

Each token holder has the option to customize the behavior of their profile picture. The custom settings defined for each token take priority over the default settings for the contract. Only the owner or approved operator of the token can update the token settings.

The following example shows how to make the profile picture of a token change once a day on ethereum mainnet:

```ts
const myTokenIndex = 1034;
const blockDuration = 24 * 60 * 4; // blocks occur about 4 times a minute and there are 60 min in an hour and 24 hours in a day
const imageOffset = 0;
const useMostRecent = false;
const useCustomSettings = true;
await autoRotateNFTContract.connect(signer).updateSettings(myTokenIndex, blockDuration, imageOffset, useMostRecent, useCustomSettings);
```

Using the imageOffset and blockDuration creatively, we can also display only our favorite image:

```ts
const myTokenIndex = 1034;
const blockDuration = (2**32) - 1; // max uint32 value (will change about every 2042 years if current block production continues)
const imageOffset = 3; // The index of our favorite image
const useMostRecent = false;
const useCustomSettings = true;
await autoRotateNFTContract.connect(signer).updateSettings(myTokenIndex, blockDuration, imageOffset, useMostRecent, useCustomSettings);
```

We can set our token to always use the most recent profile picture by doing the following:

```ts
const myTokenIndex = 1034;
const useMostRecent = true;
const useCustomSettings = true;
await autoRotateNFTContract.connect(signer).updateSettings(myTokenIndex, 0, 0, useMostRecent, useCustomSettings);
```

## Predicting the future

If we want to show the token holder which image will be related to their token on a specific date, we can use the `imageAtBlock` function with their tokenId and the predicted block number of the given date to find the image that will be displayed based off of their current settings (or default settings).

In this example, we find which image will be used one week from now:

```ts
const now = await provider.getBlockNumber();
const oneWeekFromNow = now + (7 * 24 * 60 * 4);
const tokenId = 1034;
const { uri, artist } = await autoRotateNFTContract.imageAtBlock(tokenId, oneWeekFromNow);
```

## Locking the NFT images

If the images on the contract not longer need to be pushed or updated, then the contract owner can perma-lock the current image information with the `permaLockImages()` function:

```ts
await autoRotateNFTContract.connect(owner).permaLockImages();
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
