// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

/// @title Treasury - A secure fund management contract controlled by a multisig wallet
/// @author Kyle Tredway
/// @notice Holds ETH and ERC-20 tokens on behalf of a project, controlled by an external multisig

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Treasury is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Events ───────────────────────────────────────────────────────────────
    event ETHDeposited(address indexed sender, uint256 amount);

    event TokenDeposited(
        address indexed sender,
        address indexed token,
        uint256 amount
    );

    event ETHWithdrawn(
        address indexed to,
        uint256 amount
    );

    event TokenWithdrawn(
        address indexed to,
        address indexed token,
        uint256 amount
    );

    // ─── State Variables ──────────────────────────────────────────────────────
    address public owner;
    string public name;

    
    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _owner, string memory _name) {
        require(_owner != address(0), "Invalid owner address");
        owner = _owner;
        name = _name;
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the treasury owner");
        _;
    }

     // ─── functions ────────────────────────────────────────────────────────────

    /// @notice Accepts direct ETH deposits into the treasury
    receive() external payable {
        emit ETHDeposited(msg.sender, msg.value);
    }

    /// @notice Deposits ERC-20 tokens into the treasury
    /// @param tokenAddress The ERC-20 token contract address
    /// @param amount The number of tokens to deposit
    function depositToken(
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than zero");

        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);

        emit TokenDeposited(msg.sender, tokenAddress, amount);
    }

    /// @notice Withdraws ETH from the treasury to a specified address
    /// @param to The address to send ETH to
    /// @param amount The amount of ETH to withdraw in wei
    function withdrawETH(
        address payable to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient ETH balance");

        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit ETHWithdrawn(to, amount);
    }

    /// @notice Withdraws ERC-20 tokens from the treasury to a specified address
    /// @param tokenAddress The ERC-20 token contract address
    /// @param to The address to send tokens to
    /// @param amount The number of tokens to withdraw
    function withdrawToken(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than zero");
        require(IERC20(tokenAddress).balanceOf(address(this)) >= amount, "Insufficient token balance");

        IERC20(tokenAddress).safeTransfer(to, amount);

        emit TokenWithdrawn(to, tokenAddress, amount);
    }

    /// @notice Returns the ETH balance of the treasury
    /// @return The current ETH balance in wei
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Returns the balance of a specific ERC-20 token held by the treasury
    /// @param tokenAddress The ERC-20 token contract address
    /// @return The current token balance
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
}