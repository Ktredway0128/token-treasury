const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying SampleToken with account:", deployer.address);

    const SampleToken = await hre.ethers.getContractFactory("SampleToken");
    const token = await SampleToken.deploy(
        "Sample Token",
        "STK",
        hre.ethers.utils.parseUnits("1000000", 18),
        hre.ethers.utils.parseUnits("1000000", 18)
    );
    await token.deployed();

    console.log("SampleToken deployed to:", token.address);
    console.log("Name: Sample Token");
    console.log("Symbol: STK");
    console.log("Supply: 1,000,000 STK");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});