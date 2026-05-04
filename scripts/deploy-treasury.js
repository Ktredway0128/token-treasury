const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Network:", hre.network.name);

    let owner;
    let deployer;

    if (hre.network.name === "sepolia") {
        [deployer] = await hre.ethers.getSigners();
        // Multisig address — deploy multisig first and paste address here
        owner = "0xdF102938A7E1a9b387f70a229C8D2D43f5663368";
    } else {
        [deployer] = await hre.ethers.getSigners();
        owner = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // multisig contract address on localhost
    }

    console.log("Deploying Treasury with account:", deployer.address);
    console.log("Treasury owner:", owner);

    const treasuryName = "Token Treasury";

    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(owner, treasuryName);
    await treasury.deployed();

    console.log("Treasury deployed to:", treasury.address);
    console.log("Owner:", owner);
    console.log("Name:", treasuryName);

    const deploymentInfo = {
        Treasury: {
            address: treasury.address,
            owner: owner,
            name: treasuryName,
        }
    };

    const networkName = hre.network.name === "hardhat" ? "localhost" : hre.network.name;
    const deploymentPath = path.join(__dirname, `../deployments/${networkName}.json`);

    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`Deployment info saved to deployments/${networkName}.json`);

    if (hre.network.name === "sepolia") {
        console.log("Waiting for block confirmations...");
        await treasury.deployTransaction.wait(6);

        console.log("Verifying contract on Etherscan...");
        await hre.run("verify:verify", {
            address: treasury.address,
            constructorArguments: [owner, treasuryName],
        });

        console.log("Contract verified on Etherscan");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});