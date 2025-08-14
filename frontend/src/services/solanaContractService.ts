import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN, Idl } from "@coral-xyz/anchor";

// Interface para o programa de doação
interface DonationProgram extends Idl {
  name: "donation_program";
  accounts: Array<{
    name: string;
    type: {web3
      kind: "struct";
      fields: Array<{
        name: string;
        type: any;
      }>;
    };
  }>;
  instructions: Array<{
    name: string;
    accounts: Array<{
      name: string;
      isMut?: boolean;
      isSigner?: boolean;
      pda?: any;
    }>;
    args: Array<{
      name: string;
      type: any;
    }>;
  }>;
}

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

const getProgramIdl = async (): Promise<DonationProgram> => {
  console.log("Attempting to fetch IDL from /donation_program.json");
  
  try {
    const resp = await fetch('/donation_program.json');
    
    if (!resp.ok) {
      throw new Error(`Failed to fetch IDL. Status: ${resp.status} - ${resp.statusText}`);
    }

    const rawText = await resp.text();
    console.log("Raw text from fetched IDL (first 200 chars):", rawText.substring(0, 200));

    if (!rawText || rawText.trim() === '') {
      throw new Error("IDL file is empty");
    }

    const json = JSON.parse(rawText);
    console.log("Successfully parsed IDL object. Program name:", json.name);
    
    // Validar estrutura básica do IDL
    if (!json.name || !json.instructions || !Array.isArray(json.instructions)) {
      throw new Error("Invalid IDL structure: missing required fields");
    }

    // Verificar se possui a instrução 'donate'
    const donateInstruction = json.instructions.find((inst: any) => inst.name === 'donate');
    if (!donateInstruction) {
      throw new Error("IDL is missing 'donate' instruction");
    }

    return json as DonationProgram;
  } catch (error) {
    console.error("Error fetching/parsing IDL:", error);
    if (error instanceof SyntaxError) {
      throw new Error("IDL file contains invalid JSON");
    }
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

  // Validar parâmetros
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

  // Validar se o recipient é um endereço válido
  try {
    new PublicKey(recipient);
  } catch {
    throw new Error("Invalid recipient address");
  }

  const idl = await getProgramIdl();
  console.log("IDL loaded successfully:", idl.name);

  // Verificar variáveis de ambiente
  if (!process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    throw new Error("NEXT_PUBLIC_SOLANA_RPC_URL not configured");
  }

  if (!process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID) {
    throw new Error("NEXT_PUBLIC_SOLANA_PROGRAM_ID not configured");
  }

  const network = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const connection = new Connection(network, "confirmed");

  // Verificar carteira Solana
  const solanaWallet = (window as any).solana;
  if (!solanaWallet || !solanaWallet.isPhantom) {
    throw new Error("Phantom wallet not found or not installed");
  }

  const provider = new AnchorProvider(
    connection,
    solanaWallet,
    { preflightCommitment: "confirmed" },
  );

  if (!provider.wallet.publicKey) {
    console.log("Wallet not connected, attempting to connect...");
    await provider.wallet.connect();
  }
  
  const donorPubkey = provider.wallet.publicKey;
  if (!donorPubkey) {
    throw new Error("Failed to connect to wallet");
  }

  console.log("Connected to wallet:", donorPubkey.toString());

  // Criar instância do programa com tipo correto
  console.log("Creating Program instance...");
  const program = new Program<DonationProgram>( 
    idl,
    programId,
    provider,
  );
  console.log("Program instance created successfully with ID:", program.programId.toString());


  const recipientPubkey = new PublicKey(recipient);
  const amountInLamports = new BN(numAmount * LAMPORTS_PER_SOL);

  console.log("Donation amount:", { 
    sol: numAmount, 
    lamports: amountInLamports.toString() 
  });

  // Verificar se o donor tem saldo suficiente
  try {
    const balance = await connection.getBalance(donorPubkey);
    console.log("Donor balance:", balance / LAMPORTS_PER_SOL, "SOL");
    
    if (balance < amountInLamports.toNumber()) {
      throw new Error("Insufficient balance for donation");
    }
  } catch (error: unknown) {
    console.error("Error checking balance:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error("Failed to check wallet balance: " + errorMessage);
  }

  // Derivar contas PDA
  console.log("Deriving PDA accounts...");
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

  console.log("PDA accounts derived:", {
    programState: programStateAccount.toString(),
    projectDonations: projectDonationsAccount.toString(),
    donorDonations: donorDonationsAccount.toString(),
  });

  // Buscar estado do programa
  let programState;
  try {
    console.log("Fetching program state...");
    programState = await program.account.programState.fetch(programStateAccount);
    console.log("Program state fetched successfully");
  } catch (error: unknown) {
    console.error("Error fetching program state:", error);
    throw new Error("Failed to fetch program state. Make sure the program is initialized.");
  }

  const feeWalletPubkey = programState.feeWallet;
  console.log("Fee wallet:", feeWalletPubkey.toString());

  // Executar transação de doação
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
      })
      .rpc();

    console.log("Transaction successful with signature:", signature);
    return { signature };
  } catch (error: unknown) {
    console.error("Transaction failed:", error);
    
    // Tratar erros específicos do Anchor
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
