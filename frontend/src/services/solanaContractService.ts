import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";

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

const getProgramIdl = async (): Promise<Idl> => {
  console.log("Attempting to fetch IDL from /donation_program.json");

  try {
    const resp = await fetch("/donation_program.json");

    if (!resp.ok) {
      throw new Error(
        `Failed to fetch IDL. Status: ${resp.status} - ${resp.statusText}`,
      );
    }

    const json = await resp.json();
    console.log("Successfully parsed IDL object");

    if (!json.instructions || !Array.isArray(json.instructions)) {
      throw new Error("Invalid IDL structure: missing instructions array");
    }

    const donateInstruction = json.instructions.find(
      (inst: { name: string }) => inst.name === "donate",
    );
    if (!donateInstruction) {
      throw new Error("IDL is missing 'donate' instruction");
    }

    console.log("IDL validation passed successfully");
    return json as Idl;
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
    amount,
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
  const connection = new Connection(network, "processed");

  const phantomWallet = (window as any).solana as PhantomWallet;
  if (!phantomWallet || !phantomWallet.isPhantom) {
    throw new Error("Phantom wallet not found or not installed");
  }

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
    {
      preflightCommitment: "processed",
      commitment: "processed",
    },
  );

  const program = new Program(idl, provider);
  console.log("Program instance created successfully");

  const donorPubkey = phantomWallet.publicKey;
  const recipientPubkey = new PublicKey(recipient);
  const amountInLamports = new BN(numAmount * LAMPORTS_PER_SOL);

  const balance = await connection.getBalance(donorPubkey);
  console.log("Donor balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < amountInLamports.toNumber()) {
    throw new Error("Insufficient balance for donation");
  }

  const [programStateAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId,
  );

  const [projectStatsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("project_stats"), recipientPubkey.toBuffer()],
    programId,
  );

  const [donorStatsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("donor_stats"), donorPubkey.toBuffer()],
    programId,
  );

  let programState;
  try {
    console.log("Fetching program state...");
    programState = await (program.account as any).programState.fetch(
      programStateAccount,
    );
    console.log("Program state fetched successfully");
  } catch (error: unknown) {
    console.error("Error fetching program state:", error);
    throw new Error(
      "Failed to fetch program state. Make sure the program is initialized.",
    );
  }

  const feeWalletPubkey = programState.feeWallet;
  console.log("Fee wallet:", feeWalletPubkey.toString());

  try {
    console.log("Executing donation transaction...");

    // Build the transaction manually to bypass default timeout
    const tx = await program.methods
      .donate(amountInLamports, "SOL", message || "", anonymous)
      .accounts({
        donor: donorPubkey,
        recipient: recipientPubkey,
        feeWallet: feeWalletPubkey,
        programState: programStateAccount,
        projectStats: projectStatsAccount,
        donorStats: donorStatsAccount,
        systemProgram: SystemProgram.programId,
      } as any)
      .transaction();

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash("processed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = donorPubkey;

    // Sign the transaction
    const signedTx = await phantomWallet.signTransaction(tx);

    // Send the transaction
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "processed",
        maxRetries: 3,
      },
    );

    console.log("Transaction sent with signature:", signature);

    // Custom confirmation with polling instead of built-in confirmTransaction
    console.log("Waiting for transaction confirmation...");
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes with 1-second intervals

    while (!confirmed && attempts < maxAttempts) {
      try {
        const status = await connection.getSignatureStatus(signature);

        if (status.value) {
          if (status.value.err) {
            throw new Error(
              `Transaction failed: ${JSON.stringify(status.value.err)}`,
            );
          }

          if (
            status.value.confirmationStatus === "processed" ||
            status.value.confirmationStatus === "confirmed"
          ) {
            confirmed = true;
            console.log(
              `Transaction confirmed with status: ${status.value.confirmationStatus}`,
            );
            break;
          }
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between checks

        if (attempts % 10 === 0) {
          console.log(
            `Still waiting for confirmation... (${attempts}s elapsed)`,
          );
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!confirmed) {
      throw new Error(
        `Transaction confirmation timed out after ${maxAttempts} seconds. Check signature ${signature} on Solana Explorer.`,
      );
    }

    console.log("Transaction confirmed successfully");
    return { signature };
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error && typeof error === "object" && "code" in error) {
      const anchorError = error as { code: number; message?: string };
      switch (anchorError.code) {
        case 6000:
          throw new Error("Invalid donation amount");
        case 6001:
          throw new Error("Invalid recipient address");
        case 4001:
          throw new Error("User rejected the transaction");
        default:
          throw new Error(
            `Transaction failed: ${anchorError.message || "Unknown error"}`,
          );
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Transaction failed: ${errorMessage}`);
  }
};

export const getProjectStats = async (recipient: string) => {
  const recipientPubkey = new PublicKey(recipient);
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
    "processed",
  );
  const idl = await getProgramIdl();

  const provider = new AnchorProvider(connection, {} as any, {});
  const program = new Program(idl, provider);

  const [projectStatsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("project_stats"), recipientPubkey.toBuffer()],
    programId,
  );

  try {
    const stats = await (program.account as any).projectStats.fetch(
      projectStatsAccount,
    );
    return {
      totalAmount: stats.totalAmount.toNumber() / LAMPORTS_PER_SOL,
      donationCount: stats.donationCount,
      lastDonation: new Date(stats.lastDonation * 1000),
    };
  } catch (error) {
    return {
      totalAmount: 0,
      donationCount: 0,
      lastDonation: null,
    };
  }
};
