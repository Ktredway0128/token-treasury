# TOKEN TREASURY CONTRACT

[![Verified on Etherscan](https://img.shields.io/badge/Etherscan-Verified-brightgreen)](https://sepolia.etherscan.io/address/0x380923344A792D3D63a18172Cc16568b8a1FE9cF#code)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)

Built by [Tredway Development](https://tredwaydev.com) — professional Solidity smart contract packages for Web3 companies.

A secure and production-ready treasury contract built with Solidity, OpenZeppelin, and Hardhat.

> ⚠️ These contracts have not been professionally audited. A full security audit is strongly recommended before any mainnet deployment.

This project allows projects to hold ETH and ERC-20 tokens in a secure on-chain vault. Only the designated owner — typically a multisig wallet — can withdraw funds. Anyone can deposit. The contract is the authority.

Smart contract development
Automated testing
Deployment scripting
Security best practices

This contract is part of the Tredway Development full token suite, which includes token launch, vesting, airdrop, staking, crowdsale, governance, liquidity lock, multisig wallet, and treasury infrastructure.

## DASHBOARD

Live dashboard: [token-treasury-dashboard.netlify.app](https://token-treasury-dashboard.netlify.app)

Dashboard repository: [token-treasury-dashboard](https://github.com/Ktredway0128/token-treasury-dashboard)


## PROJECT GOALS

The purpose of this project is to give Web3 projects a secure, trustless vault for holding and managing project funds.

The contract includes the core features required by a production treasury:

ETH and ERC-20 token deposits from any address
Owner-only withdrawals
Real-time balance visibility
ReentrancyGuard on all state-changing functions
SafeERC20 for all token transfers


## SMART CONTRACT FEATURES

ETH DEPOSITS

Anyone can send ETH directly to the treasury contract address. The receive function catches it automatically and emits an ETHDeposited event. No deposit form or function call required.

TOKEN DEPOSITS

Anyone can deposit any ERC-20 token into the treasury using the depositToken function. The dashboard automatically previews the token name and symbol before deposit.

ETH WITHDRAWALS

Only the treasury owner can withdraw ETH. The owner specifies a destination address and amount. The contract validates the balance before executing the transfer.

TOKEN WITHDRAWALS

Only the treasury owner can withdraw ERC-20 tokens. The owner specifies the token address, destination address, and amount. The contract validates the token balance before executing the transfer.

BALANCE VISIBILITY

The getETHBalance function returns the current ETH balance. The getTokenBalance function returns the balance of any ERC-20 token by address. Both are publicly readable.

OWNER CONTROL

The owner address is set at deployment and cannot be changed. In production the owner is a multisig wallet — no single person can move funds without multi-owner consensus.

REENTRANCY PROTECTION

The contract uses OpenZeppelin's ReentrancyGuard on all state-changing functions. State is updated before any external call to prevent reentrancy attacks.

EVENT TRACKING

The contract emits events for every major action:

ETHDeposited

TokenDeposited

ETHWithdrawn

TokenWithdrawn

Events are indexed by sender and token address for efficient frontend filtering.


## TECHNOLOGY STACK

Solidity – Smart contract programming language

Hardhat – Ethereum development environment

Ethers.js – Contract interaction library

OpenZeppelin Contracts – Secure smart contract libraries

Mocha & Chai – JavaScript testing framework

Alchemy – Ethereum RPC provider

Sepolia Test Network – Deployment environment


## PROJECT STRUCTURE

contracts/
    Treasury.sol
    SampleToken.sol

scripts/
    deploy-treasury.js
    deploy-token.js

test/
    Treasury.test.js

hardhat.config.js
.env

CONTRACTS

Treasury.sol is the core deliverable. SampleToken.sol is included for local testing only.

SCRIPTS

deploy-treasury.js deploys Treasury to the target network, saves deployment info to a JSON file, and verifies on Etherscan when deploying to Sepolia.

deploy-token.js deploys a test ERC-20 token for local development and testing.

TESTS

Contains 29 automated tests verifying all major contract behaviors and edge cases.


## SMART CONTRACT ARCHITECTURE

The Treasury contract extends OpenZeppelin's ReentrancyGuard and implements the following:

ReentrancyGuard — Prevents reentrancy attacks on all state-changing functions

SafeERC20 — Safe wrapper for all ERC-20 token transfers

Custom owner validation — Single owner address set at deployment, intended to be a multisig

receive() — Native ETH deposit handler requiring no function call

The treasury stores no internal balance tracking. ETH balance is read directly from address(this).balance. Token balances are read directly from each ERC-20 contract via balanceOf. This keeps the contract minimal and trustless.


## INSTALLATION

### CLONE THE REPOSITORY:

git clone https://github.com/Ktredway0128/token-treasury

cd token-treasury

### INSTALL DEPENDENCIES:

npm install

### COMPILE THE CONTRACT:

npx hardhat compile

### RUN THE TEST SUITE:

npx hardhat test

### THE TESTS VALIDATE:

Correct owner and name setup at deployment

Rejection of zero address owner

ETH deposit via receive function

ETHDeposited event emission

ETH deposit from any address

ERC-20 token deposit with approval

TokenDeposited event emission

Rejection of zero amount token deposit

Rejection of zero address token deposit

Owner ETH withdrawal

ETHWithdrawn event emission

Rejection of ETH withdrawal by non-owner

Rejection of zero ETH withdrawal

Rejection of ETH withdrawal exceeding balance

Rejection of ETH withdrawal to zero address

Owner token withdrawal

TokenWithdrawn event emission

Rejection of token withdrawal by non-owner

Rejection of zero token withdrawal

Rejection of token withdrawal exceeding balance

Rejection of token withdrawal to zero address

Rejection of token withdrawal with zero token address

Multiple ETH deposits accumulate correctly

Multiple token deposits accumulate correctly

Full ETH withdrawal empties balance

Full token withdrawal empties balance

Treasury holds ETH and tokens simultaneously


## ENVIRONMENT SETUP

Create a .env file in the root directory.

ALCHEMY_API_URL=YOUR_SEPOLIA_RPC_URL

DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY

ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY


## DEPLOYMENT

To deploy the contract to Sepolia:

npx hardhat run scripts/deploy-treasury.js --network sepolia

The deployment script performs the following steps:

Retrieves the deployer wallet

Creates the contract factory

Deploys Treasury with the owner address and name

Saves deployment info to deployments/sepolia.json

Waits for block confirmations

Verifies the contract on Etherscan


### SEPOLIA TESTNET DEPLOYMENT

| Contract | Address | Etherscan |
|----------|---------|-----------|
| Treasury | 0x380923344A792D3D63a18172Cc16568b8a1FE9cF | https://sepolia.etherscan.io/address/0x380923344A792D3D63a18172Cc16568b8a1FE9cF#code |

Deployed: 2026/05/01


## SECURITY PRACTICES

The contract uses well-established patterns from OpenZeppelin including:

ReentrancyGuard on all state-changing functions

SafeERC20 for all token transfers

Checks-effects-interactions pattern — requires checked before external calls

Owner-only access on all withdrawal functions

No internal balance tracking — reads directly from EVM and ERC-20 contracts

In production the owner should be a multisig wallet so no single address has unilateral withdrawal access.


## EXAMPLE USE CASES

This treasury contract is suitable for:

Protocol teams holding ETH and tokens raised from a crowdsale

DAOs storing community funds with multisig-controlled access

Projects holding team token allocations before distribution

Any team that needs a secure on-chain vault with transparent balances


## FULL TOKEN SUITE

This contract is part of the Tredway Development token suite:

| Contract | Description |
|----------|-------------|
| SampleToken V1 | ERC-20 token with minting, burning, and pause |
| TokenVesting | Cliff and linear vesting schedules |
| TokenAirdrop | Merkle tree airdrop distribution |
| TokenStaking | ERC-20 staking with rewards |
| TokenCrowdsale | Capped token crowdsale |
| SampleToken V2 | Governance token with voting and permit |
| TimelockController | Time-delayed governance execution |
| TokenGovernance | On-chain DAO voting |
| NftMembership | ERC-721 membership NFT |
| LiquidityLock | LP token time lock |
| MultiSigWallet | Multi-owner transaction approval |
| Treasury | ETH and ERC-20 fund vault |


## AUTHOR

Kyle Tredway

Smart Contract Developer / Token Launch Specialist

tredwaydev.com | @kyletredwaydev

## LICENSE

MIT License