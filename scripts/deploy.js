const hre = require("hardhat");

async function main() {
 
  const Greeter = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await Greeter.deploy();

  await nftMarket.deployed();

  console.log("NFTMarket deployed to:",nftMarket.address);
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed()
  console.log("/", nft.address,"nft esta no ar")
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
