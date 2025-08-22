import { ethers } from "ethers";
import DonationContractABI from "@/app/contracts/DonationContract.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DONATION_CONTRACT_ADDRESS;

export interface DonationParams {
  recipient: string;
  cryptoType: string;
  message: string;
  anonymous: boolean;
  amount: string; // in ETH
}

export interface DonationResponse {
  transactionHash: string;
}

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider;

  constructor() {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask not found");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
  }

  private async getContract() {
    if (!this.contract) {
      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS!,
        DonationContractABI.abi,
        signer,
      );
    }
    return this.contract;
  }

  async donate(params: DonationParams): Promise<DonationResponse> {
    const { recipient, cryptoType, message, anonymous, amount } = params;

    // Convert amount to wei
    const amountInWei = ethers.parseEther(amount);

    try {
      const contract = await this.getContract();
      const tx = await contract.donate(
        recipient,
        cryptoType,
        message,
        anonymous,
        { value: amountInWei },
      );

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error in donate:", error);
      throw error;
    }
  }

  async getProjectDonations(projectAddress: string) {
    try {
      const contract = await this.getContract();
      const donations = await contract.getProjectDonations(projectAddress);
      return donations;
    } catch (error) {
      console.error("Error getting project donations:", error);
      throw error;
    }
  }

  async getDonorDonations(donorAddress: string) {
    try {
      const contract = await this.getContract();
      const donations = await contract.getDonorDonations(donorAddress);
      return donations;
    } catch (error) {
      console.error("Error getting donor donations:", error);
      throw error;
    }
  }
}
