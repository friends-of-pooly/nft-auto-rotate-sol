import { expect } from 'chai';
import { deployMockContract, MockContract } from 'ethereum-waffle';
import { Contract, ContractFactory, Signer, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { Interface } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('AutoRotateNFT', () => {
  let AutoRotateNFTContract: Contract;

  let wallet1: SignerWithAddress,
    wallet2: SignerWithAddress,
    wallet3: SignerWithAddress,
    wallet4: SignerWithAddress;

  beforeEach(async () => {
    [wallet1, wallet2, wallet3, wallet4] = await ethers.getSigners();

    const exampleContractFactory: ContractFactory = await ethers.getContractFactory(
      'ExampleContract',
    );
    AutoRotateNFTContract = await exampleContractFactory.deploy();
  });

  describe('callMeSometime()', () => {
    
  });

});
