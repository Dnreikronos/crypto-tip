// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationContract {
    address public owner;
    address public feeWallet;
    uint256 public constant FEE_PERCENTAGE = 5;
    uint256 public constant BASIS_POINTS = 10000;

    struct Donation {
        uint256 amount;
        string cryptoType;
        string message;
        bool anonymous;
        address donor;
        uint256 timestamp;
    }

    mapping(address => Donation[]) public projectDonations;
    mapping(address => Donation[]) public donorDonations;

    event DonationReceived(
        address indexed donor,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        string cryptoType,
        string message,
        bool anonymous
    );
    event FeeWalletUpdated(address indexed newFeeWallet);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _feeWallet) {
        require(_feeWallet != address(0), "Fee wallet cannot be zero address");
        owner = msg.sender;
        feeWallet = _feeWallet;
    }

    function donate(
        address recipient,
        string memory cryptoType,
        string memory message,
        bool anonymous
    ) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(recipient != address(0), "Recipient cannot be zero address");
        require(recipient != feeWallet, "Recipient cannot be fee wallet");

        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 recipientAmount = msg.value - fee;

        (bool feeSuccess, ) = feeWallet.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        (bool recipientSuccess, ) = recipient.call{value: recipientAmount}("");
        require(recipientSuccess, "Recipient transfer failed");

        Donation memory newDonation = Donation({
            amount: msg.value,
            cryptoType: cryptoType,
            message: message,
            anonymous: anonymous,
            donor: anonymous ? address(0) : msg.sender,
            timestamp: block.timestamp
        });

        projectDonations[recipient].push(newDonation);
        if (!anonymous) {
            donorDonations[msg.sender].push(newDonation);
        }

        emit DonationReceived(
            msg.sender,
            recipient,
            msg.value,
            fee,
            cryptoType,
            message,
            anonymous
        );
    }

    function getProjectDonations(address project) external view returns (Donation[] memory) {
        return projectDonations[project];
    }

    function getDonorDonations(address donor) external view returns (Donation[] memory) {
        return donorDonations[donor];
    }

    function updateFeeWallet(address _newFeeWallet) external onlyOwner {
        require(_newFeeWallet != address(0), "New fee wallet cannot be zero address");
        feeWallet = _newFeeWallet;
        emit FeeWalletUpdated(_newFeeWallet);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    receive() external payable {
        revert("Please use the donate function");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
