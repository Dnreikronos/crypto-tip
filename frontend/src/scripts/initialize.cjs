const anchor = require("@coral-xyz/anchor");
const web3 = require("@solana/web3.js");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../../");
dotenv.config({ path: path.join(projectRoot, ".env") });

const idlPath = path.join(projectRoot, "public", "donation_program.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

const programIdString = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID;
if (!programIdString) {
  throw new Error("NEXT_PUBLIC_SOLANA_PROGRAM_ID not found in .env file.");
}
const programId = new web3.PublicKey(programIdString);

const network = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
if (!network) {
  throw new Error("NEXT_PUBLIC_SOLANA_RPC_URL not found in .env file.");
}
const connection = new web3.Connection(network, "confirmed");

const initializerPrivateKey = process.env.INITIALIZER_PRIVATE_KEY;
if (!initializerPrivateKey) {
  throw new Error("INITIALIZER_PRIVATE_KEY not found in .env file.");
}

const secretKey = anchor.utils.bytes.bs58.decode(initializerPrivateKey);
const walletKeypair = web3.Keypair.fromSecretKey(secretKey);
const initializer = walletKeypair.publicKey;

async function main() {
  console.log("Initializing program with owner:", initializer.toBase58());

  const [programStatePDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId,
  );

  const initializeInstructionIdl = idl.instructions.find(
    (ix) => ix.name === "initialize",
  );
  if (!initializeInstructionIdl) {
    throw new Error("Initialize instruction not found in IDL");
  }
  const instructionDiscriminator = Buffer.from(
    initializeInstructionIdl.discriminator,
  );

  const instruction = new web3.TransactionInstruction({
    programId: programId,
    keys: [
      { pubkey: initializer, isSigner: true, isWritable: true },
      { pubkey: programStatePDA, isSigner: false, isWritable: true },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: instructionDiscriminator,
  });

  const transaction = new web3.Transaction().add(instruction);

  try {
    const txSignature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKeypair],
    );

    console.log("Program initialized successfully!");
    console.log("Transaction Signature:", txSignature);
    console.log("Program State PDA:", programStatePDA.toBase58());
  } catch (error) {
    console.error("Failed to initialize program:", error);
  }
}

main();
