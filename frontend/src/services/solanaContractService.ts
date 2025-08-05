import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";

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


const idl = {
  "address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  "metadata": {
    "name": "donation_program",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "donate",
      "discriminator": [ 121, 186, 218, 211, 73, 70, 196, 180 ],
      "accounts": [
        { "name": "donor", "writable": true, "signer": true },
        { "name": "recipient", "writable": true },
        { "name": "fee_wallet", "writable": true },
        {
          "name": "program_state",
          "pda": {
            "seeds": [ { "kind": "const", "value": [ 112, 114, 111, 103, 114, 97, 109, 95, 115, 116, 97, 116, 101 ] } ]
          }
        },
        {
          "name": "project_donations",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [ 112, 114, 111, 106, 101, 99, 116, 95, 100, 111, 110, 97, 116, 105, 111, 110, 115 ] },
              { "kind": "account", "path": "recipient" }
            ]
          }
        },
        {
          "name": "donor_donations",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [ 100, 111, 110, 111, 114, 95, 100, 111, 110, 97, 116, 105, 111, 110, 115 ] },
              { "kind": "account", "path": "donor" }
            ]
          }
        },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "amount", "type": "u64" },
        { "name": "crypto_type", "type": "string" },
        { "name": "message", "type": "string" },
        { "name": "is_anonymous", "type": "bool" }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [ 175, 175, 109, 31, 13, 152, 155, 237 ],
      "accounts": [
        { "name": "initializer", "writable": true, "signer": true },
        {
          "name": "program_state",
          "writable": true,
          "pda": {
            "seeds": [ { "kind": "const", "value": [ 112, 114, 111, 103, 114, 97, 109, 95, 115, 116, 97, 116, 101 ] } ]
          }
        },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    },
    {
      "name": "transfer_ownership",
      "discriminator": [ 65, 177, 215, 73, 53, 45, 99, 47 ],
      "accounts": [
        { "name": "current_owner", "signer": true },
        {
          "name": "program_state",
          "writable": true,
          "pda": {
            "seeds": [ { "kind": "const", "value": [ 112, 114, 111, 103, 114, 97, 109, 95, 115, 116, 97, 116, 101 ] } ]
          }
        },
        { "name": "new_owner" }
      ],
      "args": [
        { "name": "new_owner", "type": "publicKey" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "DonorDonations",
      "discriminator": [ 189, 234, 9, 109, 115, 97, 202, 85 ],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "donations", "type": { "vec": { "defined": "Donation" } } }
        ]
      }
    },
    {
      "name": "ProgramState",
      "discriminator": [ 77, 209, 137, 229, 149, 67, 167, 230 ],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "type": "publicKey" },
          { "name": "fee_wallet", "type": "publicKey" },
          { "name": "fee_percentage", "type": "u16" }
        ]
      }
    },
    {
      "name": "ProjectDonations",
      "discriminator": [ 12, 187, 187, 155, 45, 111, 248, 61 ],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "donations", "type": { "vec": { "defined": "Donation" } } }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidAmount", "msg": "Invalid donation amount" },
    { "code": 6001, "name": "InvalidRecipient", "msg": "Invalid recipient address" },
    { "code": 6002, "name": "InvalidOwner", "msg": "Invalid owner address" }
  ],
  "types": [
    {
      "name": "Donation",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "amount", "type": "u64" },
          { "name": "crypto_type", "type": "string" },
          { "name": "message", "type": "string" },
          { "name": "is_anonymous", "type": "bool" },
          { "name": "donor", "type": { "option": "publicKey" } },
          { "name": "timestamp", "type": "i64" }
        ]
      }
    }
  ]
};


export const donateSOL = async (
  params: SolanaDonationParams,
): Promise<SolanaDonationResponse> => {
  const { recipient, message, anonymous, amount } = params;


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

  
  console.log("Creating new Program instance with HARDCODED IDL...");
  const program = new Program(
    idl as any,
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
