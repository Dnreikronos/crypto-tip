// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/DonationContract.sol";

contract DonationContractTest is Test {
    DonationContract public donationContract;
    address public owner;
    address public feeWallet;
    address public donor;
    address public recipient;
    address public otherAccount;

    function setUp() public {
        owner = makeAddr("owner");
        feeWallet = makeAddr("feeWallet");
        donor = makeAddr("donor");
        recipient = makeAddr("recipient");
        otherAccount = makeAddr("otherAccount");

        vm.startPrank(owner);
        donationContract = new DonationContract(feeWallet);
        vm.stopPrank();

        // Fund the donor with some ETH
        vm.deal(donor, 100 ether);
    }

    function test_Deployment() public view {
        assertEq(donationContract.owner(), owner);
        assertEq(donationContract.feeWallet(), feeWallet);
    }

    function test_RevertWhen_DeployWithZeroAddress() public {
        vm.expectRevert("Fee wallet cannot be zero address");
        new DonationContract(address(0));
    }

    function test_Donation() public {
        uint256 donationAmount = 1 ether;
        uint256 expectedFee = (donationAmount * 10) / 100;
        uint256 expectedRecipientAmount = donationAmount - expectedFee;

        uint256 initialFeeWalletBalance = feeWallet.balance;
        uint256 initialRecipientBalance = recipient.balance;

        vm.startPrank(donor);
        donationContract.donate{value: donationAmount}(
            recipient,
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();

        assertEq(feeWallet.balance - initialFeeWalletBalance, expectedFee);
        assertEq(recipient.balance - initialRecipientBalance, expectedRecipientAmount);

        // Check donation record
        DonationContract.Donation[] memory donations = donationContract.getProjectDonations(recipient);
        DonationContract.Donation memory donation = donations[0];
        assertEq(donation.amount, donationAmount);
        assertEq(donation.cryptoType, "ETH");
        assertEq(donation.message, "Test donation");
        assertEq(donation.isAnonymous, false);
        assertEq(donation.donor, donor);
    }

    function test_AnonymousDonation() public {
        uint256 donationAmount = 1 ether;

        vm.startPrank(donor);
        donationContract.donate{value: donationAmount}(
            recipient,
            "ETH",
            "Anonymous donation",
            true
        );
        vm.stopPrank();

        // Check donation record
        DonationContract.Donation[] memory donations = donationContract.getProjectDonations(recipient);
        DonationContract.Donation memory donation = donations[0];
        assertEq(donation.amount, donationAmount);
        assertEq(donation.cryptoType, "ETH");
        assertEq(donation.message, "Anonymous donation");
        assertEq(donation.isAnonymous, true);
        assertEq(donation.donor, address(0));
    }

    function test_RevertWhen_DonationWithZeroAmount() public {
        vm.startPrank(donor);
        vm.expectRevert("Donation amount must be greater than 0");
        donationContract.donate{value: 0}(
            recipient,
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();
    }

    function test_RevertWhen_DonationToZeroAddress() public {
        vm.startPrank(donor);
        vm.expectRevert("Recipient cannot be zero address");
        donationContract.donate{value: 1 ether}(
            address(0),
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();
    }

    function test_RevertWhen_DonationToFeeWallet() public {
        vm.startPrank(donor);
        vm.expectRevert("Recipient cannot be fee wallet");
        donationContract.donate{value: 1 ether}(
            feeWallet,
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();
    }

    function test_GetProjectDonations() public {
        uint256 donationAmount = 1 ether;

        vm.startPrank(donor);
        donationContract.donate{value: donationAmount}(
            recipient,
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();

        DonationContract.Donation[] memory donations = donationContract.getProjectDonations(recipient);
        assertEq(donations.length, 1);
        assertEq(donations[0].amount, donationAmount);
        assertEq(donations[0].cryptoType, "ETH");
        assertEq(donations[0].message, "Test donation");
    }

    function test_GetDonorDonations() public {
        uint256 donationAmount = 1 ether;

        vm.startPrank(donor);
        donationContract.donate{value: donationAmount}(
            recipient,
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();

        DonationContract.Donation[] memory donations = donationContract.getDonorDonations(donor);
        assertEq(donations.length, 1);
        assertEq(donations[0].amount, donationAmount);
        assertEq(donations[0].cryptoType, "ETH");
        assertEq(donations[0].message, "Test donation");
    }

    function test_UpdateFeeWallet() public {
        vm.startPrank(owner);
        donationContract.updateFeeWallet(otherAccount);
        vm.stopPrank();

        assertEq(donationContract.feeWallet(), otherAccount);
    }

    function test_RevertWhen_UpdateFeeWalletByNonOwner() public {
        vm.startPrank(donor);
        vm.expectRevert("Only owner can call this function");
        donationContract.updateFeeWallet(otherAccount);
        vm.stopPrank();
    }

    function test_RevertWhen_UpdateFeeWalletToZeroAddress() public {
        vm.startPrank(owner);
        vm.expectRevert("New fee wallet cannot be zero address");
        donationContract.updateFeeWallet(address(0));
        vm.stopPrank();
    }

    function test_TransferOwnership() public {
        vm.startPrank(owner);
        donationContract.transferOwnership(otherAccount);
        vm.stopPrank();

        assertEq(donationContract.owner(), otherAccount);
    }

    function test_RevertWhen_TransferOwnershipByNonOwner() public {
        vm.startPrank(donor);
        vm.expectRevert("Only owner can call this function");
        donationContract.transferOwnership(otherAccount);
        vm.stopPrank();
    }

    function test_RevertWhen_TransferOwnershipToZeroAddress() public {
        vm.startPrank(owner);
        vm.expectRevert("New owner cannot be zero address");
        donationContract.transferOwnership(address(0));
        vm.stopPrank();
    }

    function test_ContractBalance() public {
        uint256 donationAmount = 1 ether;
        vm.startPrank(donor);
        donationContract.donate{value: donationAmount}(
            recipient,
            "ETH",
            "Test donation",
            false
        );
        vm.stopPrank();

        assertEq(donationContract.getBalance(), 0);
    }

    function test_RevertWhen_DirectETHTransfer() public {
        vm.startPrank(donor);
        vm.expectRevert("Please use the donate function");
        (bool success,) = address(donationContract).call{value: 1 ether}("");
        require(success, "Transfer failed");
        vm.stopPrank();
    }
} 
