const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Registry", function () {
  // base config
  const baseUri = "https://ipfs.gateway/";

  // mint
  const amount = 1;
  const data = 0;
  const tokenId = 3;

  // tier
  const uriIdentifier = 5;
  const isTransferable = false;

  let registryInstance, owner, alice, bob;

  beforeEach(async () => {
    const registryFactory = await ethers.getContractFactory("Registry");
    registryInstance = await registryFactory.deploy(baseUri);
    [owner, alice, bob] = await ethers.getSigners();
  });

  describe("#mint", () => {
    it("reverts if token tier had not been set up before", async function () {
      await expect(
        registryInstance.mint(alice.address, tokenId, amount, data)
      ).to.be.revertedWith("Tier does not exist");
    });

    context("with existing token tier", () => {
      beforeEach("create token tier", async () => {
        await registryInstance.createTokenTier(
          tokenId,
          uriIdentifier,
          isTransferable
        );
      });

      it("mints one token w/ correct id to account", async function () {
        await registryInstance.mint(alice.address, tokenId, amount, data);

        const balance = await registryInstance.balanceOf(
          alice.address,
          tokenId
        );
        expect(balance).to.equal(amount);
      });
    });
  });

  describe("#createTokenTier", () => {
    it("sets uriIdentifierId for specified token ID", async () => {
      await registryInstance.createTokenTier(
        tokenId,
        uriIdentifier,
        isTransferable
      );
    });
  });

  // TODO
  describe("#mintBatch", () => {});
  describe("#updateTokenTier", () => {});

  describe("#safeTransferFrom", () => {
    beforeEach("create token tier & mint", async () => {
      await registryInstance.createTokenTier(
        tokenId,
        uriIdentifier,
        isTransferable
      );
      await registryInstance.mint(alice.address, tokenId, amount, data);
    });

    context("by owner of the token", () => {
      it("reverts Ownable: caller is not the owner", () => {
        expect(
          registryInstance
            .connect(alice)
            .safeTransferFrom(alice.address, bob.address, tokenId, amount, data)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    context("by owner of the contract", () => {
      it("transfers token from alice to bob", async () => {
        await registryInstance.safeTransferFrom(
          alice.address,
          bob.address,
          tokenId,
          amount,
          data
        );

        expect(
          await registryInstance.balanceOf(bob.address, tokenId)
        ).to.be.equal(1);
      });
    });
  });

  describe("#uri", () => {
    beforeEach("create token tier & mint", async () => {
      await registryInstance.createTokenTier(
        tokenId,
        uriIdentifier,
        isTransferable
      );
      await registryInstance.mint(alice.address, tokenId, amount, data);
    });

    it("returns the baseUri appended by tokenUri", async () => {
      const uri = await registryInstance.uri(tokenId);

      expect(uri).to.equal(`${baseUri}${uriIdentifier}`);
    });
  });

  describe("#setUri", () => {
    it("returns the token URI", async () => {
      const newUri = "lol";
      await registryInstance.setBaseUri(newUri);

      const uri = await registryInstance.uri(tokenId);

      expect(uri).to.equal(newUri);
    });
  });
});
