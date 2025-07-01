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
        address feeWallet = 0x9F18650f3d73beAFB0d4A3356B9888A986871169;
        DonationContract donationContract = new DonationContract(feeWallet);

        vm.stopBroadcast();

        return donationContract;
    }
} 
