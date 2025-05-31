// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/DonationContract.sol";

contract DeployScript is Script {
    function run() public {
        // Get the private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Get the fee wallet address from environment variable
        address feeWallet = vm.envAddress("FEE_WALLET_ADDRESS");

        // Deploy the contract
        DonationContract donationContract = new DonationContract(feeWallet);

        // Stop broadcasting
        vm.stopBroadcast();

        // Log the deployed address
        console2.log("DonationContract deployed to:", address(donationContract));
    }
} 