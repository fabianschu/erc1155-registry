const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Registry", function () {
  const baseUri = "https://ipfs.gateway/{id}";
  const id = 5;
  const amount = 1;
  const data = 0;

  let registryInstance, owner, alice, bob;

  beforeEach(async () => {
    const registryFactory = await ethers.getContractFactory("Registry");
    registryInstance = await registryFactory.deploy(baseUri);
    [owner, alice, bob] = await ethers.getSigners();
  });

  describe("#mint", () => {
    let account;

    beforeEach("mint a token to alice", async () => {
      account = alice.address;
      await registryInstance.mint(account, id, amount, data);
    });

    it("mints one token w/ correct id to account", async function () {
      const balance = await registryInstance.balanceOf(account, id);

      expect(balance).to.equal(amount);
    });
  });

  describe("#mintBatch", () => {});

  describe("#safeTransferFrom", () => {
    beforeEach(async () => {
      await registryInstance.mint(alice.address, id, amount, data);
    });

    context("by owner of the token", () => {
      it("reverts Ownable: caller is not the owner", () => {
        expect(
          registryInstance
            .connect(alice)
            .safeTransferFrom(alice.address, bob.address, id, amount, data)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    context("by owner of the contract", () => {
      it("transfers token from alice to bob", async () => {
        await registryInstance.safeTransferFrom(
          alice.address,
          bob.address,
          id,
          amount,
          data
        );

        expect(await registryInstance.balanceOf(bob.address, id)).to.be.equal(
          1
        );
      });
    });
  });

  describe("#uri", () => {
    beforeEach(async () => {
      await registryInstance.mint(alice.address, id, amount, data);
    });

    it("returns the token URI", async () => {
      const uri = await registryInstance.uri(id);

      expect(uri).to.equal(baseUri);
    });
  });

  describe("#setUri", () => {
    it("returns the token URI", async () => {
      const newUri = "lol";
      await registryInstance.setBaseMetadataURI(newUri);

      const uri = await registryInstance.uri(id);

      expect(uri).to.equal(newUri);
    });
  });
});
