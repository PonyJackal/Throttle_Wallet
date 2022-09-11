// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ThrottleWallet is ReentrancyGuard {
    IERC20 public immutable token;
    uint256 public immutable maxLimit;
    uint256 public immutable refillRate;

    struct AccountInfo {
        uint256 balance;
        uint256 lastRefill; // block number
        uint256 limit;
    }

    mapping(address => AccountInfo) internal accounts;

    // -----------------------------------------
    // ThrottleWallet Events
    // -----------------------------------------
    event Deposited(address indexed sender, address indexed account, uint256 amount);
    event Spent(address indexed account, address indexed recipient, uint256 amount);

    /**
     * @dev Constructor
     * @param _token Address of the token to be used
     * @param _maxLimit Maximum amount of tokens that can be spent at once
     * @param _refillRate Refill rate per block
     */
    constructor(
        IERC20 _token,
        uint256 _maxLimit,
        uint256 _refillRate
    ) {
        require(address(_token) != address(0), "ThrottleWallet: token is the zero address");
        token = _token;
        maxLimit = _maxLimit;
        refillRate = _refillRate;
    }

    /**
     * @dev deposit tokens into the contract
     * @param account Address of the user to deposit
     * @param amount Amount of token to deposit
     */
    function deposit(address account, uint256 amount) external {
        require(account != address(0), "ThrottleWallet: account is the zero address");
        require(amount > 0, "ThrottleWallet: amount is zero");
        require(token.transferFrom(msg.sender, address(this), amount), "ThrottleWallet: transfer failed");

        accounts[account].balance += amount;
        if (accounts[account].limit == 0) {
            accounts[account].limit = maxLimit;
        }

        emit Deposited(msg.sender, account, amount);
    }

    /**
     * @dev spend tokens from the contract
     * @param recipient Address of the user to recieve tokens
     * @param amount Amount of token to spend
     */
    function spend(address recipient, uint256 amount) external nonReentrant {
        require(recipient != address(0), "ThrottleWallet: recipient is the zero address");
        require(amount > 0 && amount <= maxLimit, "ThrottleWallet: amount is invalid");
        require(accounts[msg.sender].balance >= amount, "ThrottleWallet: insufficient balance");
        uint256 limit = _calculateLimit(msg.sender);
        require(limit >= amount, "ThrottleWallet: limit exceeded");

        accounts[msg.sender].balance -= amount;
        accounts[msg.sender].limit = limit - amount;
        accounts[msg.sender].lastRefill = block.number;

        require(token.transfer(recipient, amount), "ThrottleWallet: transfer failed");
        emit Spent(msg.sender, recipient, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return accounts[account].balance;
    }

    function _calculateLimit(address account) internal view returns (uint256) {
        uint256 blocksPassed = block.number - accounts[account].lastRefill;
        uint256 refillAmount = blocksPassed * refillRate;
        uint256 newLimit = accounts[account].limit + refillAmount;
        if (newLimit > maxLimit) {
            newLimit = maxLimit;
        }
        return newLimit;
    }
}
