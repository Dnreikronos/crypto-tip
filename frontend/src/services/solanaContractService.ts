import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";

// Proper IDL interface that matches with the contract
interface DonationProgramIdl extends Idl {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
  };
  instructions: [
    {
      name: "donate";
      discriminator: number[];
      accounts: [
        { name: "donor"; writable: true; signer: true },
        { name: "recipient"; writable: true },
        { name: "fee_wallet"; writable: true },
        { name: "program_state"; pda: { seeds: [{ kind: "const"; value: number[] }] } },
        { name: "project_donations"; writable: true; pda: any },
        { name: "donor_donations"; writable: true; pda: any },
        { name: "system_program"; address: string }
      ];
      args: [
        { name: "amount"; type: "u64" },
        { name: "crypto_type"; type: "string" },
        { name: "message"; type: "string" },
        { name: "is_anonymous"; type: "bool" }
      ];
    },
    {
      name: "initialize";
      discriminator: number[];
      accounts: any[];
      args: [];
    },
    {
      name: "transfer_ownership";
      discriminator: number[];
      accounts: any[];
      args: [{ name: "new_owner"; type: "pubkey" }];
    }
  ];
  accounts: [
    { name: "ProgramState"; discriminator: number[] },
    { name: "ProjectDonations"; discriminator: number[] },
    { name: "DonorDonations"; discriminator: number[] }
  ];
  types: [
    {
      name: "ProgramState";
      type: {
        kind: "struct";
        fields: [
          { name: "owner"; type: "pubkey" },
          { name: "fee_wallet"; type: "pubkey" },
          { name: "fee_percentage"; type: "u16" }
        ];
      };
    }
  ];
  errors: any[];
}

// Simple wallet interface for Phantom
interface PhantomWallet {
  isPhantom: boolean;
  publicKey: PublicKey | null;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
}

export interface SolanaDonationParams {
  recipient: string;
  message: string;
  anonymous: boolean;
  amount: string;
}

export interface SolanaDonationResponse {
  signature: string;
}

const programId = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!);

const getProgramIdl = async (): Promise<DonationProgramIdl> => {
  console.log("Attempting to fetch IDL from /donation_program.json");

  try {
    const resp = await fetch('/donation_program.json');

    if (!resp.ok) {
      throw new Error(`Failed to fetch IDL. Status: ${resp.status} - ${resp.statusText}`);
    }

    const json = await resp.json();
    console.log("Successfully parsed IDL object");

    
    if (!json.instructions || !Array.isArray(json.instructions)) {
      throw new Error("Invalid IDL structure: missing instructions array");
    }

    const donateInstruction = json.instructions.find((inst: { name: string }) => inst.name === 'donate');
    if (!donateInstruction) {
      throw new Error("IDL is missing 'donate' instruction");
    }

    console.log("IDL validation passed successfully");
    return json as DonationProgramIdl;
  } catch (error) {
    console.error("Error fetching/parsing IDL:", error);
    throw error;
  }
};

export const donateSOL = async (
  params: SolanaDonationParams,
): Promise<SolanaDonationResponse> => {
  const { recipient, message, anonymous, amount } = params;

  console.log("Starting SOL donation process with params:", {
    recipient,
    message: message ? "***" : "empty",
    anonymous,
    amount
  });

  
  if (!recipient || !amount) {
    throw new Error("Recipient and amount are required");
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error("Invalid amount: must be a positive number");
  }

  if (numAmount < 0.001) {
    throw new Error("Minimum donation amount is 0.001 SOL");
  }

  try {
    new PublicKey(recipient);
  } catch {
    throw new Error("Invalid recipient address");
  }

  const idl = await getProgramIdl();
  console.log("IDL loaded successfully:", idl.metadata?.name || "unknown");

  
  if (!process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    throw new Error("NEXT_PUBLIC_SOLANA_RPC_URL not configured");
  }

  const network = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const connection = new Connection(network, "confirmed");

  // Get Phantom wallet
  const phantomWallet = (window as any).solana as PhantomWallet;
  if (!phantomWallet || !phantomWallet.isPhantom) {
    throw new Error("Phantom wallet not found or not installed");
  }

  // Connect wallet if not connected
  if (!phantomWallet.publicKey) {
    console.log("Wallet not connected, attempting to connect...");
    await phantomWallet.connect();
  }

  if (!phantomWallet.publicKey) {
    throw new Error("Failed to connect to wallet");
  }

  console.log("Connected to wallet:", phantomWallet.publicKey.toString());

 
  const provider = new AnchorProvider(
    connection,
    phantomWallet as any, // Cast to bypass type checking
    { preflightCommitment: "confirmed" },
  );

 
  const program = new Program(idl as any, provider);
  console.log("Program instance created successfully");

  const donorPubkey = phantomWallet.publicKey;
  const recipientPubkey = new PublicKey(recipient);
  const amountInLamports = new BN(numAmount * LAMPORTS_PER_SOL);

  // Balance check
  const balance = await connection.getBalance(donorPubkey);
  console.log("Donor balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < amountInLamports.toNumber()) {
    throw new Error("Insufficient balance for donation");
  }

  
  const [programStateAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId, 
  );

  const [projectDonationsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("project_donations"), recipientPubkey.toBuffer()],
    programId,
  );

  const [donorDonationsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("donor_donations"), donorPubkey.toBuffer()],
    programId,
  );

  
  let programState;
  try {
    console.log("Fetching program state...");
  
    programState = await (program.account as any).programState.fetch(programStateAccount);
    console.log("Program state fetched successfully");
    console.log("Program state structure:", programState);
    console.log("Program state keys:", Object.keys(programState));
  } catch (error: unknown) {
    console.error("Error fetching program state:", error);
    throw new Error("Failed to fetch program state. Make sure the program is initialized.");
  }

  
  if (!programState) {
    throw new Error("Program state is null or undefined");
  }

  
  let feeWalletPubkey;
  if (programState.fee_wallet) {
    feeWalletPubkey = programState.fee_wallet;
  } else if (programState.feeWallet) {
    feeWalletPubkey = programState.feeWallet;
  } else {
    console.error("Available program state fields:", Object.keys(programState));
    throw new Error("Fee wallet not found in program state. Available fields: " + Object.keys(programState).join(", "));
  }

  console.log("Fee wallet:", feeWalletPubkey.toString());

  // Execute donation transaction
  try {
    console.log("Executing donation transaction...");
    const signature = await program.methods
      .donate(
        amountInLamports,
        "SOL",
        message || "",
        anonymous,
      )
      .accounts({
        donor: donorPubkey,
        recipient: recipientPubkey,
        feeWallet: feeWalletPubkey,
        programState: programStateAccount,
        projectDonations: projectDonationsAccount,
        donorDonations: donorDonationsAccount,
        systemProgram: SystemProgram.programId,
      } as any) // Use 'as any' to bypass strict typing for account names
      .rpc();

    console.log("Transaction successful with signature:", signature);
    return { signature };
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error && typeof error === 'object' && 'code' in error) {
      const anchorError = error as { code: number; message?: string };
      switch (anchorError.code) {
        case 6000:
          throw new Error("Invalid donation amount");
        case 6001:
          throw new Error("Invalid recipient address");
        case 4001:
          throw new Error("User rejected the transaction");
        default:
          throw new Error(`Transaction failed: ${anchorError.message || 'Unknown error'}`);
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Transaction failed: ${errorMessage}`);
  }
};