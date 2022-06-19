import { assert, expect } from 'chai';
import { deployMockContract, MockContract } from 'ethereum-waffle';
import { BigNumber, Contract, ContractFactory, Signer, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { Interface } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('AutoRotateNFT', () => {
  let AutoRotateNFTContract: Contract;

  let wallet1: SignerWithAddress,
    wallet2: SignerWithAddress,
    wallet3: SignerWithAddress,
    wallet4: SignerWithAddress;

  const images = [
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/IMG_0405.png',
      artist: '@artmilitonian',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/IMG_0406.png',
      artist: '@artmilitonian',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/IMG_0407.png',
      artist: '@artmilitonian',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/IMG_0411.png',
      artist: '@artmilitonian',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/Supporter_Purple121.png',
      artist: '@noiamgodzilla',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/Supporter_Purple23.png',
      artist: '@noiamgodzilla',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/Supporter_Purple_2.png',
      artist: '@noiamgodzilla',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/Supporter_Purplepixel.png',
      artist: '@noiamgodzilla',
    },
    {
      uri: 'https://gateway.pinata.cloud/ipfs/QmPm1hiVsZRUwEBCuaUCpxzRaRdhQ6Ys5S6fn8XfNdcM8R/pooly.png',
      artist: '@its_honestwork',
    },
  ];

  // Error messages:
  const ERROR = {
    OUT_OF_BOUNDS: 'AutoRotateNFT: index out-of-bounds',
    NOT_CONTRACT_OWNER: 'Ownable: caller is not the owner',
    ZERO_BLOCK_DURATION: 'AutoRotateNFT: zero block duration',
    NOT_APPROVED_OR_OWN: 'AutoRotateNFT: token is not approved or own',
  };

  // Helper function to add test image data:
  const pushTestImages = async () => {
    for (let i = 0; i < images.length; i++) {
      await AutoRotateNFTContract.connect(wallet1).pushImage(images[i].uri, images[i].artist);
    }
  };

  beforeEach(async () => {
    [wallet1, wallet2, wallet3, wallet4] = await ethers.getSigners();

    const contractFactory: ContractFactory = await ethers.getContractFactory('AutoRotateNFT');
    AutoRotateNFTContract = await contractFactory.deploy();
  });

  describe('mint()', () => {
    it('should mint a token to the tx sender', async () => {
      const wallet = wallet2;
      const balanceBefore = await AutoRotateNFTContract.balanceOf(wallet.address);
      await AutoRotateNFTContract.connect(wallet).mint();
      const balanceAfter = await AutoRotateNFTContract.balanceOf(wallet.address);
      expect(balanceAfter).to.equal(balanceBefore + 1);
    });

    it('should increment tokenId after each mint', async () => {
      const wallet = wallet2;
      await AutoRotateNFTContract.connect(wallet).mint();
      await AutoRotateNFTContract.connect(wallet).mint();
      const ownerOfZero = await AutoRotateNFTContract.ownerOf(BigNumber.from(0));
      const ownerOfOne = await AutoRotateNFTContract.ownerOf(BigNumber.from(1));
      expect(ownerOfZero).to.equal(wallet.address);
      expect(ownerOfOne).to.equal(wallet.address);
    });
  });

  describe('pushImage()', () => {
    it('should allow the contract owner to push image data', async () => {
      const owner = wallet1;
      await expect(AutoRotateNFTContract.connect(owner).pushImage(images[0].uri, images[0].artist))
        .to.not.be.reverted;
    });

    it('should NOT allow a non-owner to push image data', async () => {
      const nonOwner = wallet2;
      await expect(
        AutoRotateNFTContract.connect(nonOwner).pushImage(images[0].uri, images[0].artist),
      ).to.be.revertedWith(ERROR.NOT_CONTRACT_OWNER);
    });

    it('should emit an UpdateImage event', async () => {
      const owner = wallet1;
      await AutoRotateNFTContract.connect(owner).pushImage(images[0].uri, images[0].artist);
      const events = await AutoRotateNFTContract.queryFilter(
        AutoRotateNFTContract.filters.UpdateImage(),
      );
      expect(events.length).to.equal(1);
      const event = events[0];
      expect(event.args?.imageIndex).to.equal(0);
      expect(event.args?.imageData?.uri).to.equal(images[0].uri);
      expect(event.args?.imageData?.artist).to.equal(images[0].artist);
    });
  });

  describe('updateImage()', () => {
    // Push Test Images:
    beforeEach(pushTestImages);

    it('should let the owner update an image record', async () => {
      const owner = wallet1;
      await AutoRotateNFTContract.connect(owner).updateImage(0, images[1].uri, images[1].artist);
      const { uri, artist } = await AutoRotateNFTContract.imageAtIndex(0);
      expect(uri).to.equal(images[1].uri);
      expect(artist).to.equal(images[1].artist);
    });

    it('should error if index is out of bounds', async () => {
      const owner = wallet1;
      await expect(
        AutoRotateNFTContract.connect(owner).updateImage(images.length, '', ''),
      ).to.be.revertedWith(ERROR.OUT_OF_BOUNDS);
    });

    it('should NOT allow a non-owner update an image record', async () => {
      const nonOwner = wallet2;
      await expect(
        AutoRotateNFTContract.connect(nonOwner).updateImage(0, '', ''),
      ).to.be.revertedWith(ERROR.NOT_CONTRACT_OWNER);
    });
  });

  describe('numImages()', () => {
    it('should start at zero', async () => {
      expect(await AutoRotateNFTContract.numImages()).to.equal(0);
    });

    it('should increment by one after an image is pushed', async () => {
      const countBefore = await AutoRotateNFTContract.numImages();
      const owner = wallet1;
      await AutoRotateNFTContract.connect(owner).pushImage(images[0].uri, images[0].artist);
      const countAfter = await AutoRotateNFTContract.numImages();
      expect(countAfter).to.equal(countBefore + 1);
    });

    it('should NOT be incremented after an image is updated', async () => {
      const owner = wallet1;
      await AutoRotateNFTContract.connect(owner).pushImage(images[0].uri, images[0].artist);
      const countBefore = await AutoRotateNFTContract.numImages();
      await AutoRotateNFTContract.connect(owner).updateImage(0, images[1].uri, images[1].artist);
      const countAfter = await AutoRotateNFTContract.numImages();
      expect(countAfter).to.equal(countBefore);
    });
  });

  describe('imageAtIndex()', () => {
    // Push Test Images:
    beforeEach(pushTestImages);

    it('should retrieve the image data at an existing index', async () => {
      for (let i = 0; i < images.length; i++) {
        const { uri, artist } = await AutoRotateNFTContract.imageAtIndex(i);
        expect(uri).to.equal(images[i].uri);
        expect(artist).to.equal(images[i].artist);
      }
    });

    it('should error if index is out of bounds', async () => {
      await expect(AutoRotateNFTContract.imageAtIndex(images.length)).to.be.revertedWith(
        ERROR.OUT_OF_BOUNDS,
      );
    });
  });

  describe('defaultBlockDuration', () => {
    it('should be publicly accessible', async () => {
      await expect(AutoRotateNFTContract.defaultBlockDuration()).to.not.be.reverted;
    });

    it('can be changed by the contract owner', async () => {
      const owner = wallet1;
      const valueBefore = await AutoRotateNFTContract.defaultBlockDuration();
      const newValue = 1;
      expect(newValue).to.not.equal(valueBefore);
      await AutoRotateNFTContract.connect(owner).setDefaultBlockDuration(newValue);
      const valueAfter = await AutoRotateNFTContract.defaultBlockDuration();
      expect(valueAfter).to.equal(newValue);
    });

    it('must be greater than zero', async () => {
      const owner = wallet1;
      await expect(
        AutoRotateNFTContract.connect(owner).setDefaultBlockDuration(0),
      ).to.be.revertedWith(ERROR.ZERO_BLOCK_DURATION);
      await expect(AutoRotateNFTContract.connect(owner).setDefaultBlockDuration(1)).to.not.be
        .reverted;
    });

    it('cannot be changed by a non-owner', async () => {
      const nonOwner = wallet2;
      await expect(
        AutoRotateNFTContract.connect(nonOwner).setDefaultBlockDuration(1),
      ).to.be.revertedWith(ERROR.NOT_CONTRACT_OWNER);
    });
  });

  describe('defaultImageOffset', () => {
    it('should be publicly accessible', async () => {
      await expect(AutoRotateNFTContract.defaultImageOffset()).to.not.be.reverted;
    });

    it('can be changed by the contract owner', async () => {
      const owner = wallet1;
      const valueBefore = await AutoRotateNFTContract.defaultImageOffset();
      const newValue = 1;
      expect(newValue).to.not.equal(valueBefore);
      await AutoRotateNFTContract.connect(owner).setDefaultImageOffset(newValue);
      const valueAfter = await AutoRotateNFTContract.defaultImageOffset();
      expect(valueAfter).to.equal(newValue);
    });

    it('can be zero', async () => {
      const owner = wallet1;
      await expect(AutoRotateNFTContract.connect(owner).setDefaultImageOffset(0)).to.not.be
        .reverted;
    });

    it('cannot be changed by a non-owner', async () => {
      const nonOwner = wallet2;
      await expect(
        AutoRotateNFTContract.connect(nonOwner).setDefaultImageOffset(1),
      ).to.be.revertedWith(ERROR.NOT_CONTRACT_OWNER);
    });
  });

  describe('defaultUseMostRecent', () => {
    it('should be publicly accessible', async () => {
      await expect(AutoRotateNFTContract.defaultUseMostRecent()).to.not.be.reverted;
    });

    it('can be changed by the contract owner', async () => {
      const owner = wallet1;
      const valueBefore = await AutoRotateNFTContract.defaultUseMostRecent();
      const newValue = true;
      expect(newValue).to.not.equal(valueBefore);
      await AutoRotateNFTContract.connect(owner).setDefaultUseMostRecent(newValue);
      const valueAfter = await AutoRotateNFTContract.defaultUseMostRecent();
      expect(valueAfter).to.equal(newValue);
    });

    it('cannot be changed by a non-owner', async () => {
      const nonOwner = wallet2;
      await expect(
        AutoRotateNFTContract.connect(nonOwner).setDefaultUseMostRecent(true),
      ).to.be.revertedWith(ERROR.NOT_CONTRACT_OWNER);
    });
  });

  describe('tokenURI()', () => {
    const parseURI = (uri: string) => {
      const base64Match = uri.match(/^(?:rawData|data)\:application\/json;base64(?:\s|,)/);
      if (!base64Match) throw new Error(`Invalid URI: ${uri}`);
      const jsonStr = Buffer.from(uri.slice(base64Match[0].length), 'base64').toString();
      return JSON.parse(jsonStr);
    };

    it('should return a valid base64 encoded JSON URI', async () => {
      const uri = await AutoRotateNFTContract.tokenURI(0);
      expect(typeof parseURI(uri)).to.equal('object');
    });

    it('should contain all of the expected ERC721Metadata JSON fields', async () => {
      const metadata = parseURI(await AutoRotateNFTContract.tokenURI(0));
      expect(typeof metadata.name).to.equal('string');
      expect(typeof metadata.description).to.equal('string');
      expect(typeof metadata.image).to.equal('string');
    });

    it("should contain an additional 'artist' JSON field", async () => {
      const metadata = parseURI(await AutoRotateNFTContract.tokenURI(0));
      expect(typeof metadata.artist).to.equal('string');
    });

    it("should have a name of 'Pooly Rotating'", async () => {
      const metadata = parseURI(await AutoRotateNFTContract.tokenURI(0));
      expect(metadata.name).to.equal('Pooly Rotating');
    });

    it('should include the tokenId in the description', async () => {
      for (let i = 0; i < 11; i++) {
        const metadata = parseURI(await AutoRotateNFTContract.tokenURI(i));
        expect(metadata.description).to.equal(`#${i}`);
      }
    });

    it('should have valid image and artist values', async () => {
      await pushTestImages();
      const metadata = parseURI(await AutoRotateNFTContract.tokenURI(0));
      const imageIndex = images.map((x) => x.uri).indexOf(metadata.image);
      expect(imageIndex).to.be.gte(0);
      expect(images[imageIndex].artist).to.equal(metadata.artist);
    });
  });

  describe('tokenSettings()', () => {
    it('should be initialized with default uint and bool values', async () => {
      const settings = await AutoRotateNFTContract.tokenSettings(0);
      expect(settings.blockDuration).to.equal(0);
      expect(settings.imageOffset).to.equal(0);
      expect(settings.useMostRecent).to.equal(false);
      expect(settings.useCustomSettings).to.equal(false);
    });
  });

  describe('updateSettings()', () => {
    it('should allow the token owner to update the settings', async () => {
      const tokenOwner = wallet2;

      // Mint a token:
      await AutoRotateNFTContract.connect(tokenOwner).mint();
      const originalSettings = await AutoRotateNFTContract.tokenSettings(0);

      // Update the settings:
      await expect(AutoRotateNFTContract.connect(tokenOwner).updateSettings(0, 1, 1, true, true)).to
        .not.be.reverted;
      const changedSettings = await AutoRotateNFTContract.tokenSettings(0);

      // Check the updated settings:
      expect(JSON.stringify(originalSettings)).to.not.equal(JSON.stringify(changedSettings));
      expect(changedSettings.blockDuration).to.equal(1);
      expect(changedSettings.imageOffset).to.equal(1);
      expect(changedSettings.useMostRecent).to.equal(true);
      expect(changedSettings.useCustomSettings).to.equal(true);
    });

    it('should allow an approved wallet to update the settings', async () => {
      const tokenOwner = wallet2;
      const approvedWallet = wallet3;

      // Mint a token:
      await AutoRotateNFTContract.connect(tokenOwner).mint();
      const originalSettings = await AutoRotateNFTContract.tokenSettings(0);

      // Approve a wallet on the minted token:
      await AutoRotateNFTContract.connect(tokenOwner).approve(approvedWallet.address, 0);

      // Update settings with approved wallet signature:
      await expect(
        AutoRotateNFTContract.connect(approvedWallet).updateSettings(0, 1, 1, true, true),
      ).to.not.be.reverted;
      const changedSettings = await AutoRotateNFTContract.tokenSettings(0);

      // Check that settings were changed:
      expect(JSON.stringify(originalSettings)).to.not.equal(JSON.stringify(changedSettings));
      expect(changedSettings.blockDuration).to.equal(1);
      expect(changedSettings.imageOffset).to.equal(1);
      expect(changedSettings.useMostRecent).to.equal(true);
      expect(changedSettings.useCustomSettings).to.equal(true);
    });

    it('should NOT allow a non-approved and non-owner wallet to update the settings', async () => {
      const tokenOwner = wallet1;
      const nonOwner = wallet2;

      // Mint a token:
      await AutoRotateNFTContract.connect(tokenOwner).mint();

      // Try to modify it with a different wallet:
      await expect(
        AutoRotateNFTContract.connect(nonOwner).updateSettings(0, 1, 1, true, true),
      ).to.be.revertedWith(ERROR.NOT_APPROVED_OR_OWN);
    });

    it('should NOT allow the block duration to be zero', async () => {
      const tokenOwner = wallet1;
      await AutoRotateNFTContract.connect(tokenOwner).mint();
      await expect(
        AutoRotateNFTContract.connect(tokenOwner).updateSettings(0, 0, 0, false, false),
      ).to.be.revertedWith(ERROR.ZERO_BLOCK_DURATION);
    });

    it('should allow the image offset to be zero', async () => {
      const tokenOwner = wallet1;
      await AutoRotateNFTContract.connect(tokenOwner).mint();
      await expect(AutoRotateNFTContract.connect(tokenOwner).updateSettings(0, 1, 0, false, false))
        .to.not.be.reverted;
    });
  });

  describe('imageAtBlock()', () => {
    // Define a user wallet:
    let user: SignerWithAddress;

    beforeEach(async () => {
      // Set user wallet:
      user = wallet2;

      // Push Test Images:
      await pushTestImages();

      // Mint a token:
      await AutoRotateNFTContract.connect(user).mint();
    });

    it('should rotate through all of the images', async () => {
      // Set the token settings to rotate every block:
      await AutoRotateNFTContract.connect(user).updateSettings(0, 1, 0, false, true);

      // iterate twice through enough blocks to get each image twice:
      for (let i = 0; i < images.length * 2; i++) {
        const expectedIndex = i % images.length;
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, i);

        // Check if the expected image is returned:
        expect(uri).to.equal(images[expectedIndex].uri);
        expect(artist).to.equal(images[expectedIndex].artist);
      }
    });

    it('should still rotate through all of the images with default settings', async () => {
      // Get default block duration:
      const defaultBlockDuration = await AutoRotateNFTContract.defaultBlockDuration();

      // iterate twice through enough blocks to get each image twice:
      for (let i = 0; i < images.length * 2; i++) {
        const blockNumber = i * defaultBlockDuration;
        const expectedIndex = i % images.length;
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, blockNumber);

        // Check if the expected image is returned:
        expect(uri).to.equal(images[expectedIndex].uri);
        expect(artist).to.equal(images[expectedIndex].artist);
      }
    });

    it('should not switch images until the block duration is complete', async () => {
      // Set the block duration to 10:
      const blockDuration = 10;
      await AutoRotateNFTContract.connect(user).updateSettings(0, blockDuration, 0, false, true);

      // Ensure that all blocks until the duration is up return the first image:
      for (let i = 0; i <= blockDuration; i++) {
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, i);
        if (i < blockDuration) {
          expect(uri).to.equal(images[0].uri);
          expect(artist).to.equal(images[0].artist);
        } else {
          expect(uri).to.equal(images[1].uri);
          expect(artist).to.equal(images[1].artist);
        }
      }
    });

    it('should return the correct image data with an offset applied', async () => {
      // Use a block duration of 1:
      const blockDuration = 1;

      // Test offsets from 0 to images.length:
      for (let offset = 0; offset <= images.length; offset++) {
        await AutoRotateNFTContract.connect(user).updateSettings(
          0,
          blockDuration,
          offset,
          false,
          true,
        );
        const blockNumber = 0;
        const expectedIndex = (blockNumber + offset) % images.length;
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, blockNumber);
        expect(uri).to.equal(images[expectedIndex].uri);
        expect(artist).to.equal(images[expectedIndex].artist);
      }
    });

    it("should return the latest image if 'useMostRecent' is set to TRUE", async () => {
      // Update token settings:
      await AutoRotateNFTContract.connect(user).updateSettings(0, 1, 0, true, true);

      // Check if latest image is returned:
      for (let blockNumber = 0; blockNumber <= images.length; blockNumber++) {
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, blockNumber);

        // Check if image data is same as most recent image:
        expect(uri).to.equal(images[images.length - 1].uri);
        expect(artist).to.equal(images[images.length - 1].artist);

        // Ensure that actual image data is different at every index:
        const testIndex = blockNumber % images.length;
        if (testIndex != images.length - 1) {
          expect(uri).to.not.equal(images[testIndex].uri);
        }
      }
    });

    it("should use default settings if 'useCustomSettings' is FALSE", async () => {
      // Ensure that 'useCustomSettings' is false:
      expect((await AutoRotateNFTContract.tokenSettings(0)).useCustomSettings).to.be.false;

      // Change default settings to have a block duration of 1 and a image offset of 1:
      const owner = wallet1;
      await AutoRotateNFTContract.connect(owner).setDefaultBlockDuration(1);
      await AutoRotateNFTContract.connect(owner).setDefaultImageOffset(1);

      // Check if image at index 1 is returned at block 0:
      {
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, 0);
        expect(uri).to.equal(images[1].uri);
        expect(artist).to.equal(images[1].artist);
      }

      // Set defaultUseMostRecent to TRUE and check if image at last index is returned:
      {
        await AutoRotateNFTContract.connect(owner).setDefaultUseMostRecent(true);
        const { uri, artist } = await AutoRotateNFTContract.imageAtBlock(0, 0);
        expect(uri).to.equal(images[images.length - 1].uri);
        expect(artist).to.equal(images[images.length - 1].artist);
      }
    });
  });
});
