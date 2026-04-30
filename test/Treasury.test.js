const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury", function () {
    let treasury;
    let token;
    let owner, nonOwner, recipient;

    beforeEach(async function () {
        [owner, nonOwner, recipient] = await ethers.getSigners();

        // Deploy SampleToken
        const SampleToken = await ethers.getContractFactory("SampleToken");
        token = await SampleToken.deploy(
            "Test Token", 
            "TTK", 
            ethers.utils.parseUnits("1000000", 18),
            ethers.utils.parseUnits("1000000", 18)
        );
        await token.deployed();

        // Deploy Treasury with owner as the controlling address
        const Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy(owner.address, "Project Treasury");
        await treasury.deployed();
    });

    // ─── Deployment ───────────────────────────────────────────────────────────

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await treasury.owner()).to.equal(owner.address);
        });

        it("Should set the correct name", async function () {
            expect(await treasury.name()).to.equal("Project Treasury");
        });

        it("Should start with zero ETH balance", async function () {
            expect(await treasury.getETHBalance()).to.equal(0);
        });

        it("Should reject deployment with zero address owner", async function () {
            const Treasury = await ethers.getContractFactory("Treasury");
            await expect(
                Treasury.deploy(ethers.constants.AddressZero, "Test")
            ).to.be.revertedWith("Invalid owner address");
        });
    });

    // ─── ETH Deposits ─────────────────────────────────────────────────────────

    describe("ETH Deposits", function () {
        it("Should accept ETH deposits via receive", async function () {
            await owner.sendTransaction({
                to: treasury.address,
                value: ethers.utils.parseEther("1.0")
            });
            expect(await treasury.getETHBalance()).to.equal(ethers.utils.parseEther("1.0"));
        });

        it("Should emit ETHDeposited event", async function () {
            await expect(
                owner.sendTransaction({
                    to: treasury.address,
                    value: ethers.utils.parseEther("1.0")
                })
            ).to.emit(treasury, "ETHDeposited")
             .withArgs(owner.address, ethers.utils.parseEther("1.0"));
        });

        it("Should accept ETH from any address", async function () {
            await nonOwner.sendTransaction({
                to: treasury.address,
                value: ethers.utils.parseEther("0.5")
            });
            expect(await treasury.getETHBalance()).to.equal(ethers.utils.parseEther("0.5"));
        });
    });

    // ─── Token Deposits ───────────────────────────────────────────────────────

    describe("Token Deposits", function () {
        it("Should accept ERC-20 token deposits", async function () {
            await token.approve(treasury.address, ethers.utils.parseUnits("1000", 18));
            await treasury.depositToken(token.address, ethers.utils.parseUnits("1000", 18));
            expect(await treasury.getTokenBalance(token.address)).to.equal(ethers.utils.parseUnits("1000", 18));
        });

        it("Should emit TokenDeposited event", async function () {
            await token.approve(treasury.address, ethers.utils.parseUnits("1000", 18));
            await expect(
                treasury.depositToken(token.address, ethers.utils.parseUnits("1000", 18))
            ).to.emit(treasury, "TokenDeposited")
             .withArgs(owner.address, token.address, ethers.utils.parseUnits("1000", 18));
        });

        it("Should reject deposit of zero tokens", async function () {
            await expect(
                treasury.depositToken(token.address, 0)
            ).to.be.revertedWith("Amount must be greater than zero");
        });

        it("Should reject deposit with zero token address", async function () {
            await expect(
                treasury.depositToken(ethers.constants.AddressZero, 100)
            ).to.be.revertedWith("Invalid token address");
        });
    });

    // ─── ETH Withdrawals ──────────────────────────────────────────────────────

    describe("ETH Withdrawals", function () {
        beforeEach(async function () {
            await owner.sendTransaction({
                to: treasury.address,
                value: ethers.utils.parseEther("2.0")
            });
        });

        it("Should allow owner to withdraw ETH", async function () {
            const balanceBefore = await ethers.provider.getBalance(recipient.address);
            await treasury.withdrawETH(recipient.address, ethers.utils.parseEther("1.0"));
            const balanceAfter = await ethers.provider.getBalance(recipient.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(ethers.utils.parseEther("1.0"));
        });

        it("Should emit ETHWithdrawn event", async function () {
            await expect(
                treasury.withdrawETH(recipient.address, ethers.utils.parseEther("1.0"))
            ).to.emit(treasury, "ETHWithdrawn")
             .withArgs(recipient.address, ethers.utils.parseEther("1.0"));
        });

        it("Should reject withdrawal from non owner", async function () {
            await expect(
                treasury.connect(nonOwner).withdrawETH(recipient.address, ethers.utils.parseEther("1.0"))
            ).to.be.revertedWith("Not the treasury owner");
        });

        it("Should reject withdrawal of zero ETH", async function () {
            await expect(
                treasury.withdrawETH(recipient.address, 0)
            ).to.be.revertedWith("Amount must be greater than zero");
        });

        it("Should reject withdrawal exceeding balance", async function () {
            await expect(
                treasury.withdrawETH(recipient.address, ethers.utils.parseEther("10.0"))
            ).to.be.revertedWith("Insufficient ETH balance");
        });

        it("Should reject withdrawal to zero address", async function () {
            await expect(
                treasury.withdrawETH(ethers.constants.AddressZero, ethers.utils.parseEther("1.0"))
            ).to.be.revertedWith("Invalid address");
        });
    });

    // ─── Token Withdrawals ────────────────────────────────────────────────────

    describe("Token Withdrawals", function () {
        beforeEach(async function () {
            await token.approve(treasury.address, ethers.utils.parseUnits("1000", 18));
            await treasury.depositToken(token.address, ethers.utils.parseUnits("1000", 18));
        });

        it("Should allow owner to withdraw tokens", async function () {
            await treasury.withdrawToken(token.address, recipient.address, ethers.utils.parseUnits("500", 18));
            expect(await treasury.getTokenBalance(token.address)).to.equal(ethers.utils.parseUnits("500", 18));
        });

        it("Should emit TokenWithdrawn event", async function () {
            await expect(
                treasury.withdrawToken(token.address, recipient.address, ethers.utils.parseUnits("500", 18))
            ).to.emit(treasury, "TokenWithdrawn")
             .withArgs(recipient.address, token.address, ethers.utils.parseUnits("500", 18));
        });

        it("Should reject withdrawal from non owner", async function () {
            await expect(
                treasury.connect(nonOwner).withdrawToken(token.address, recipient.address, ethers.utils.parseUnits("500", 18))
            ).to.be.revertedWith("Not the treasury owner");
        });

        it("Should reject withdrawal of zero tokens", async function () {
            await expect(
                treasury.withdrawToken(token.address, recipient.address, 0)
            ).to.be.revertedWith("Amount must be greater than zero");
        });

        it("Should reject withdrawal exceeding token balance", async function () {
            await expect(
                treasury.withdrawToken(token.address, recipient.address, ethers.utils.parseUnits("2000", 18))
            ).to.be.revertedWith("Insufficient token balance");
        });

        it("Should reject withdrawal to zero address", async function () {
            await expect(
                treasury.withdrawToken(token.address, ethers.constants.AddressZero, ethers.utils.parseUnits("500", 18))
            ).to.be.revertedWith("Invalid address");
        });

        it("Should reject withdrawal with zero token address", async function () {
            await expect(
                treasury.withdrawToken(ethers.constants.AddressZero, recipient.address, ethers.utils.parseUnits("500", 18))
            ).to.be.revertedWith("Invalid token address");
        });
    });

    // ─── Edge Cases ───────────────────────────────────────────────────────────

    describe("Edge Cases", function () {
        it("Should handle multiple ETH deposits correctly", async function () {
            await owner.sendTransaction({ to: treasury.address, value: ethers.utils.parseEther("1.0") });
            await nonOwner.sendTransaction({ to: treasury.address, value: ethers.utils.parseEther("0.5") });
            expect(await treasury.getETHBalance()).to.equal(ethers.utils.parseEther("1.5"));
        });

        it("Should handle multiple token deposits correctly", async function () {
            await token.approve(treasury.address, ethers.utils.parseUnits("2000", 18));
            await treasury.depositToken(token.address, ethers.utils.parseUnits("1000", 18));
            await treasury.depositToken(token.address, ethers.utils.parseUnits("500", 18));
            expect(await treasury.getTokenBalance(token.address)).to.equal(ethers.utils.parseUnits("1500", 18));
        });

        it("Should handle full ETH withdrawal correctly", async function () {
            await owner.sendTransaction({ to: treasury.address, value: ethers.utils.parseEther("1.0") });
            await treasury.withdrawETH(recipient.address, ethers.utils.parseEther("1.0"));
            expect(await treasury.getETHBalance()).to.equal(0);
        });

        it("Should handle full token withdrawal correctly", async function () {
            await token.approve(treasury.address, ethers.utils.parseUnits("1000", 18));
            await treasury.depositToken(token.address, ethers.utils.parseUnits("1000", 18));
            await treasury.withdrawToken(token.address, recipient.address, ethers.utils.parseUnits("1000", 18));
            expect(await treasury.getTokenBalance(token.address)).to.equal(0);
        });

        it("Should hold both ETH and tokens simultaneously", async function () {
            await owner.sendTransaction({ to: treasury.address, value: ethers.utils.parseEther("1.0") });
            await token.approve(treasury.address, ethers.utils.parseUnits("1000", 18));
            await treasury.depositToken(token.address, ethers.utils.parseUnits("1000", 18));
            expect(await treasury.getETHBalance()).to.equal(ethers.utils.parseEther("1.0"));
            expect(await treasury.getTokenBalance(token.address)).to.equal(ethers.utils.parseUnits("1000", 18));
        });
    });
});