// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/DonationContract.sol";

contract DeployDonationContract is Script {
    function run() public returns (DonationContract) {
        // Get the private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
 
				// Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract with your Sepolia address as the fee wallet
        address feeWallet = 0xFDBb4e98aE5078Ad5AeE25a36401A2a27E03530b;
        DonationContract donationContract = new DonationContract(feeWallet);

        vm.stopBroadcast();

        return donationContract;
    }
} 
