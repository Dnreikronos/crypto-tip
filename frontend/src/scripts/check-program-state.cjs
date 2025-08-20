const anchor = require("@coral-xyz/anchor");
const web3 = require("@solana/web3.js");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

const projectRoot = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(projectRoot, '.env') });

const idlPath = path.join(projectRoot, 'public', 'donation_program.json');
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

const programIdString = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID;
const programId = new web3.PublicKey(programIdString);
const network = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
const connection = new web3.Connection(network, "confirmed");

async function checkProgramState() {
    console.log("🔍 CHECKING PROGRAM STATE");
    console.log("Program ID:", programId.toString());
    
    const [programStatePDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("program_state")],
        programId
    );
    
    console.log("Program State PDA:", programStatePDA.toString());
    
    try {
        const accountInfo = await connection.getAccountInfo(programStatePDA);
        
        if (!accountInfo) {
            console.log("❌ Program state account does not exist - program not initialized");
            return;
        }
        
        console.log("✅ Program state account exists");
        console.log("Account owner:", accountInfo.owner.toString());
        console.log("Account data length:", accountInfo.data.length);
        
        // Try to decode the account data
        const provider = new anchor.AnchorProvider(connection, {}, {});
        const program = new anchor.Program(idl, provider);
        
        try {
            const programState = await program.account.programState.fetch(programStatePDA);
            console.log("📊 PROGRAM STATE DATA:");
            console.log("Owner:", programState.owner.toString());
            console.log("Fee wallet:", programState.feeWallet.toString());
            console.log("Fee percentage:", programState.feePercentage);
            
            // Check if fee wallet equals owner (common setup)
            if (programState.owner.equals(programState.feeWallet)) {
                console.log("ℹ️  Fee wallet is the same as owner");
            }
            
        } catch (decodeError) {
            console.error("❌ Failed to decode program state:", decodeError.message);
        }
        
    } catch (error) {
        console.error("❌ Error checking program state:", error.message);
    }
}

checkProgramState();