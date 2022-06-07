const { expect } = require("chai");
const { ethers } = require("hardhat");
var Web3 = require("web3");

// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
var web3 = new Web3(
  Web3.givenProvider || "ws://some.local-or-remote.node:8546"
);

describe("Gifting", function () {
  var nft;
  var owner, addr1, addr2, addr3;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("MyNFT");
    nft = await NFT.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    await nft.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  it("should revert non owner attempt to gift", async function () {
    await expect(
      nft
        .connect(addr1)
        .airdropTokens([
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        ])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert non owner attempt to reserve", async function () {
    await expect(nft.connect(addr1).reserveForTeam(18)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should allow owner attempt to gift directly to recipients", async function () {
    await nft.airdropTokens([
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ]);
    expect(await nft.balanceOf(addr1.address)).to.equal(1);
    expect(await nft.balanceOf(addr2.address)).to.equal(1);
    expect(await nft.balanceOf(addr3.address)).to.equal(1);
  });

  it("should allow owner to reserve", async function () {
    await nft.reserveForTeam(18);
    expect(await nft.balanceOf(owner.address)).to.equal(18);
  });

  it("should not allow owner to reserve more than max reserve supply", async function () {
    await expect(nft.reserveForTeam(201)).to.be.revertedWith(
      "Insufficient token reserve"
    );
    expect(await nft.balanceOf(owner.address)).to.equal(0);
  });

  it("should allow owner to gift directly to same recipients multiple times", async function () {
    await nft.airdropTokens([
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ]);
    expect(await nft.balanceOf(addr1.address)).to.equal(5);
    expect(await nft.balanceOf(addr2.address)).to.equal(2);
    expect(await nft.balanceOf(addr3.address)).to.equal(2);
  });
});
