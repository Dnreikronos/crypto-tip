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
    console.log("Successfully parsed IDL object");
    console.log("IDL structure:", {
      hasAddress: !!json.address,
      hasMetadata: !!json.metadata,
      metadataName: json.metadata?.name,
      hasInstructions: !!json.instructions,
      instructionsCount: json.instructions?.length
    });
    
    // Validar estrutura básica do IDL - mais leniente
    if (!json.instructions || !Array.isArray(json.instructions)) {
      throw new Error("Invalid IDL structure: missing instructions array");
    }
    
    // O metadata é opcional em algumas versões do Anchor
    if (json.metadata && !json.metadata.name) {
      console.warn("Warning: metadata exists but missing name");
    }

    // O address também pode ser opcional dependendo da versão
    if (!json.address) {
      console.warn("Warning: IDL missing program address field");
    }

    // Verificar se possui a instrução 'donate'
    const donateInstruction = json.instructions.find((inst: { name: string }) => inst.name === 'donate');
    if (!donateInstruction) {
      throw new Error("IDL is missing 'donate' instruction");
    }

    console.log("IDL validation passed successfully");

    // Usar o IDL original sem transformações - deixar o Anchor SDK lidar com ele
    console.log("Using original IDL structure");

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
  console.log("IDL loaded successfully:", idl.metadata?.name || idl.address || "unknown");

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
  const solanaWallet = (window as { solana?: { isPhantom?: boolean; connect: () => Promise<void>; publicKey?: { toString: () => string } } }).solana;
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

  // Criar instância do programa seguindo a documentação do Anchor
  console.log("Creating Program instance...");
  console.log("IDL being passed to Program:", {
    hasVersion: 'version' in idl,
    hasName: 'name' in idl,
    version: idl.version,
    name: idl.name,
    instructionsCount: idl.instructions?.length
  });
  
  let program;
  try {
    // Segundo a documentação, o Program precisa do IDL e um objeto com connection
    // Opção 1: Passar o provider completo (recomendado)
    program = new Program(
      idl as any, // Usar any temporariamente para compatibilidade
      programId,
      provider
    );
    console.log("Program instance created successfully with ID:", program.programId.toString());
  } catch (programError) {
    console.error("Failed to create Program instance:", programError);
    
    // Tentar alternativa: passar apenas connection como segundo parâmetro
    try {
      console.log("Trying alternative: Program with just connection...");
      program = new Program(
        idl as any,
        {
          connection
        }
      );
      console.log("Program instance created with connection only");
    } catch (altError) {
      console.error("Alternative also failed:", altError);
      console.error("IDL structure:", JSON.stringify(idl, null, 2).substring(0, 500));
      throw new Error(`Failed to initialize Anchor Program: ${programError instanceof Error ? programError.message : String(programError)}`);
    }
  }


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
