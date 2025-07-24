import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { DonationProgram } from "./donation_program";

export interface SolanaDonationParams {
  recipient: string;
  message: string;
  anonymous: boolean;
  amount: string; // in SOL
}

export interface SolanaDonationResponse {
  signature: string;
}

const programId = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!);

const getProgramIdl = async () => {
  console.log("Attempting to fetch IDL from /public/donation_program.json");
  const resp = await fetch('/donation_program.json');
  
  const rawText = await resp.text();
  console.log("Raw text from fetched IDL:", rawText);

  if (!resp.ok) {
    throw new Error("Failed to fetch IDL. Status: " + resp.status);
  }

  try {
    const json = JSON.parse(rawText);
    console.log("Successfully parsed IDL object:", json);
    return json;
  } catch (e) {
    console.error("Failed to parse fetched IDL as JSON.", e);
    throw new Error("Fetched file is not valid JSON.");
  }
};


export const donateSOL = async (
  params: SolanaDonationParams,
): Promise<SolanaDonationResponse> => {
  const { recipient, message, anonymous, amount } = params;

  const idl = await getProgramIdl();

  const network = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
  const connection = new Connection(network, "confirmed");

  const provider = new AnchorProvider(
    connection,
    (window as any).solana,
    { preflightCommitment: "confirmed" },
  );

  if (!provider.wallet.publicKey) {
    await provider.wallet.connect();
  }
  
  const donorPubkey = provider.wallet.publicKey;
  if (!donorPubkey) {
    throw new Error("Wallet not connected!");
  }

  // 3. CREATE THE PROGRAM INTERFACE
  console.log("Creating new Program instance with the fetched IDL...");
  const program = new Program( 
    idl,
    programId,
    provider,
  );
  console.log("Program instance created successfully.");


  const recipientPubkey = new PublicKey(recipient);
  const amountInLamports = new BN(parseFloat(amount) * LAMPORTS_PER_SOL);

  const [programStateAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId,
  );
  
  const [projectDonationsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("project_donations"), recipientPubkey.toBuffer()],
    program.programId,
  );

  const [donorDonationsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("donor_donations"), donorPubkey.toBuffer()],
    program.programId,
  );

  const programState = await program.account.programState.fetch(programStateAccount);
  const feeWalletPubkey = programState.feeWallet;

  const signature = await program.methods
    .donate(
      amountInLamports,
      "SOL",
      message,
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
    })
    .rpc();

  console.log("Transaction successful with signature:", signature);

  return { signature };
};
