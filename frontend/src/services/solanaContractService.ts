import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";

interface PhantomWallet {
  isPhantom: boolean;
  publicKey: PublicKey | null;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<
    T extends Transaction | import("@solana/web3.js").VersionedTransaction,
  >(
    transaction: T,
  ): Promise<T>;
  signAllTransactions<
    T extends Transaction | import("@solana/web3.js").VersionedTransaction,
  >(
    transactions: T[],
  ): Promise<T[]>;
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

interface ProgramState {
  feeWallet: PublicKey;
}

interface ProjectStats {
  totalAmount: BN;
  donationCount: number;
  lastDonation: number;
}

interface ProgramAccounts {
  programState: {
    fetch: (pubkey: PublicKey) => Promise<ProgramState>;
  };
  projectStats: {
    fetch: (pubkey: PublicKey) => Promise<ProjectStats>;
  };
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
  console.log("🌐 Using RPC:", network);

  const connection = new Connection(network, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 90000,
  });

  // Test network connectivity
  try {
    const slot = await connection.getSlot();
    console.log("✅ Network OK, current slot:", slot);
  } catch (error) {
    console.error("❌ Network connection failed:", error);
    throw new Error(
      "Failed to connect to Solana network. Please check your RPC endpoint.",
    );
  }

  const phantomWallet = (window as { solana?: PhantomWallet })
    .solana as PhantomWallet;
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

  // Create proper wallet adapter for Anchor
  const walletAdapter = {
    publicKey: phantomWallet.publicKey,
    signTransaction: phantomWallet.signTransaction.bind(phantomWallet),
    signAllTransactions: phantomWallet.signAllTransactions.bind(phantomWallet),
  };

  const provider = new AnchorProvider(connection, walletAdapter, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  });

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

  let programState: ProgramState;
  try {
    console.log("Fetching program state...");
    programState = await (
      program.account as ProgramAccounts
    ).programState.fetch(programStateAccount);
    console.log("Program state fetched successfully");
  } catch (error: unknown) {
    console.error("Error fetching program state:", error);
    throw new Error(
      "Failed to fetch program state. Make sure the program is initialized.",
    );
  }

  const feeWalletPubkey = programState.feeWallet;
  console.log("Fee wallet:", feeWalletPubkey.toString());

  if (recipientPubkey.equals(feeWalletPubkey)) {
    throw new Error(
      "Cannot donate to the fee wallet address. Please use a different recipient.",
    );
  }

  try {
    console.log("Executing donation transaction...");

    // Build the transaction using .transaction() to bypass Anchor's timeout
    const transaction = await program.methods
      .donate(amountInLamports, "SOL", message || "", anonymous)
      .accounts({
        donor: donorPubkey,
        recipient: recipientPubkey,
        feeWallet: feeWalletPubkey,
        programState: programStateAccount,
        projectStats: projectStatsAccount,
        donorStats: donorStatsAccount,
        systemProgram: SystemProgram.programId,
      })
      .transaction(); // ← This bypasses the timeout

    console.log("🚀 Building donation transaction...");

    // Get fresh blockhash and set proper transaction properties
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = donorPubkey;

    console.log("✅ Transaction built successfully");
    console.log("🔗 Fresh blockhash obtained:", blockhash);

    // Sign transaction with Phantom
    console.log("✍️ Requesting wallet signature...");

    let signedTransaction;
    try {
      // Add small delay to ensure UI is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      signedTransaction = await phantomWallet.signTransaction(transaction);
      console.log("✅ Transaction signed by wallet");
    } catch (signError) {
      console.error("❌ Wallet signing failed:", signError);

      if (signError instanceof Error) {
        if (signError.message.includes("User rejected")) {
          throw new Error("Transaction was rejected by the user");
        }
        if (signError.message.includes("popup")) {
          throw new Error(
            "Phantom popup was blocked. Please allow popups and try again.",
          );
        }
      }

      throw new Error(
        `Wallet signing failed: ${signError instanceof Error ? signError.message : "Unknown error"}`,
      );
    }

    // Send the signed transaction
    console.log("📤 Sending transaction to network...");
    const txSignature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      },
    );

    console.log("✅ Transaction sent with signature:", txSignature);
    console.log(
      "🔗 Explorer link: https://explorer.solana.com/tx/" + txSignature,
    );

    // FIXED: Real transaction verification instead of just status checking
    console.log("⏳ Waiting for transaction confirmation...");
    const startTime = Date.now();
    const timeout = 90000;
    let attempts = 0;

    while (Date.now() - startTime < timeout) {
      attempts++;
      try {
        // Instead of just checking status, let's verify the transaction actually exists
        const txInfo = await connection.getTransaction(txSignature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (txInfo && !txInfo.meta?.err) {
          console.log("✅ Transaction confirmed with status: confirmed");
          console.log("✅ Transaction confirmed successfully");
          return { signature: txSignature };
        }

        if (txInfo && txInfo.meta?.err) {
          console.error("❌ Transaction failed on-chain:", txInfo.meta.err);
          throw new Error(
            `Transaction failed: ${JSON.stringify(txInfo.meta.err)}`,
          );
        }

        console.log(
          `⏳ Verification attempt ${attempts} - transaction not yet confirmed`,
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch {
        console.log(`⏳ Verification attempt ${attempts} - still waiting...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Timeout reached
    console.warn("⚠️ Verification timeout reached after 90 seconds");
    console.log(
      "🔗 Check manually: https://explorer.solana.com/tx/" + txSignature,
    );

    // Final check before giving up
    try {
      const finalCheck = await connection.getTransaction(txSignature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (finalCheck && !finalCheck.meta?.err) {
        console.log("✅ Transaction confirmed on final check!");
        return { signature: txSignature };
      }
    } catch {
      console.log("❌ Final verification failed");
    }

    throw new Error(
      `Transaction verification timeout. Check manually: https://explorer.solana.com/tx/${txSignature}`,
    );
  } catch (error: unknown) {
    console.error("❌ Transaction process failed:", error);

    // Handle specific errors
    if (error && typeof error === "object" && "code" in error) {
      const anchorError = error as { code: number; message?: string };
      switch (anchorError.code) {
        case 6000:
          throw new Error("Invalid donation amount");
        case 6001:
          throw new Error(
            "Invalid recipient address - cannot be the fee wallet",
          );
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
    "confirmed",
  );
  const idl = await getProgramIdl();

  // Create a dummy provider for read-only operations
  const dummyWallet = {
    publicKey: new PublicKey("11111111111111111111111111111111"),
    signTransaction: async <
      T extends Transaction | import("@solana/web3.js").VersionedTransaction,
    >(
      tx: T,
    ): Promise<T> => tx,
    signAllTransactions: async <
      T extends Transaction | import("@solana/web3.js").VersionedTransaction,
    >(
      txs: T[],
    ): Promise<T[]> => txs,
  };

  const provider = new AnchorProvider(connection, dummyWallet, {});
  const program = new Program(idl, provider);

  const [projectStatsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("project_stats"), recipientPubkey.toBuffer()],
    programId,
  );

  try {
    const stats = await (program.account as ProgramAccounts).projectStats.fetch(
      projectStatsAccount,
    );
    return {
      totalAmount: stats.totalAmount.toNumber() / LAMPORTS_PER_SOL,
      donationCount: stats.donationCount,
      lastDonation: new Date(stats.lastDonation * 1000),
    };
  } catch {
    console.log("No stats found for recipient, returning defaults");
    return {
      totalAmount: 0,
      donationCount: 0,
      lastDonation: null,
    };
  }
};
