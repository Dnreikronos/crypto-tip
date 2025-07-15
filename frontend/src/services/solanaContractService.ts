import { 
  PublicKey, 
  Connection, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

export interface SolanaDonationParams {
  recipient: string;
  cryptoType: string;
  message: string;
  anonymous: boolean;
  amount: string; // in SOL
}

export interface SolanaDonationResponse {
  signature: string;
}

// Instruction types matching the Anchor contract
enum DonationInstruction {
  Initialize = 0,
  Donate = 1,
  UpdateFeeWallet = 2,
  TransferOwnership = 3,
}

// Program state structure matching your Anchor contract
interface ProgramState {
  owner: any;
  feeWallet: any;
  feePercentage: number;
}

// Wallet provider types
interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<void>;
  publicKey?: { toString: () => string };
  signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
}

interface MetaMaskProvider {
  isMetaMask?: boolean;
  request: (args: any) => Promise<any>;
  solana?: PhantomProvider;
}

export class SolanaContractService {
  private connection: any;
  private programId: any;

  constructor() {
    // Use API key service like Alchemy/Helius instead of public RPC
    const apiKey = process.env.NEXT_PUBLIC_SOLANA_API_KEY;
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'testnet';
    
    if (!apiKey) {
      throw new Error('SOLANA_API_KEY environment variable is required');
    }
    
    // Example endpoints (adjust based on your provider):
    // Alchemy: https://solana-testnet.g.alchemy.com/v2/{apiKey}
    // Helius: https://rpc.helius.xyz/?api-key={apiKey}
    // QuickNode: https://your-endpoint.solana-testnet.quiknode.pro/{apiKey}/
    const endpoint = `https://solana-${network}.g.alchemy.com/v2/${apiKey}`;
    
    this.connection = new (require('@solana/web3.js').Connection)(endpoint, 'confirmed');
    this.programId = new (require('@solana/web3.js').PublicKey)(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!);
  }

  async donate(params: SolanaDonationParams): Promise<SolanaDonationResponse> {
    const { recipient, cryptoType, message, anonymous, amount } = params;
    
    // Connect to available Solana wallet (Phantom or MetaMask)
    let provider: PhantomProvider | undefined = (window as any).solana;
    let walletType = 'phantom';
    
    // Check if MetaMask supports Solana
    if (!provider && (window as any).ethereum?.isMetaMask) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        // Check if MetaMask supports Solana
        if ((window as any).ethereum.solana) {
          provider = (window as any).ethereum.solana;
          walletType = 'metamask';
        }
      } catch (error) {
        console.log('MetaMask Solana support not available');
      }
    }
    
    if (!provider) {
      throw new Error('No Solana wallet found. Please install Phantom or use MetaMask with Solana support.');
    }
    
    // Connect to the wallet
    if (walletType === 'phantom') {
      await provider.connect();
    } else if (walletType === 'metamask') {
      // MetaMask Solana connection is handled differently
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x65' }], // Solana testnet chainId
      });
    }
    
    if (!provider.publicKey) {
      throw new Error('Failed to get wallet public key');
    }
    
    const donorPubkey = new (require('@solana/web3.js').PublicKey)(provider.publicKey.toString());
    const recipientPubkey = new (require('@solana/web3.js').PublicKey)(recipient);
    
    // Convert SOL to lamports
    const lamports = Math.floor(parseFloat(amount) * (require('@solana/web3.js').LAMPORTS_PER_SOL));
    
    // Derive PDAs
    const [programStateAccount] = await (require('@solana/web3.js').PublicKey).findProgramAddress(
      [Buffer.from('program_state')],
      this.programId
    );
    
    const [projectDonationsAccount] = await (require('@solana/web3.js').PublicKey).findProgramAddress(
      [Buffer.from('project_donations'), recipientPubkey.toBuffer()],
      this.programId
    );
    
    const [donorDonationsAccount] = await (require('@solana/web3.js').PublicKey).findProgramAddress(
      [Buffer.from('donor_donations'), donorPubkey.toBuffer()],
      this.programId
    );
    
    // Get program state to find the actual fee wallet
    const programStateInfo = await this.connection.getAccountInfo(programStateAccount);
    if (!programStateInfo) {
      throw new Error('Program not initialized. Please contact the administrator.');
    }
    
    // Deserialize program state to get the fee wallet
    const programState = this.deserializeProgramState(programStateInfo.data);
    const feeWallet = programState.feeWallet;
    
    console.log('Fee wallet:', feeWallet.toString());
    console.log('Fee percentage:', programState.feePercentage);
    
    // Create the donate instruction
    const instruction = this.createDonateInstruction(
      donorPubkey,
      recipientPubkey,
      lamports,
      cryptoType,
      message,
      anonymous,
      programStateAccount,
      projectDonationsAccount,
      donorDonationsAccount,
      feeWallet
    );
    
    const transaction = new (require('@solana/web3.js').Transaction)().add(instruction);
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = donorPubkey;
    
    // Sign and send transaction based on wallet type
    let signature: string = '';
    
    if (walletType === 'phantom') {
      const result = await provider.signAndSendTransaction(transaction);
      signature = result.signature;
    } else if (walletType === 'metamask') {
      // MetaMask Solana transaction signing
      const result = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: this.programId.toString(),
          data: instruction.data.toString('hex'),
          from: provider.publicKey!.toString(),
        }]
      });
      signature = result;
    } else {
      throw new Error('Unsupported wallet type');
    }
    
    if (!signature) {
      throw new Error('Failed to get transaction signature');
    }
    
    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');
    
    return { signature };
  }

  private deserializeProgramState(data: Buffer): ProgramState {
    // Skip the 8-byte discriminator
    let offset = 8;
    
    // Read owner (32 bytes)
    const owner = new (require('@solana/web3.js').PublicKey)(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read fee wallet (32 bytes)
    const feeWallet = new (require('@solana/web3.js').PublicKey)(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read fee percentage (2 bytes, u16)
    const feePercentage = data.readUint16LE(offset);
    
    return {
      owner,
      feeWallet,
      feePercentage
    };
  }

  private createDonateInstruction(
    donor: any,
    recipient: any,
    amount: number,
    cryptoType: string,
    message: string,
    isAnonymous: boolean,
    programStateAccount: any,
    projectDonationsAccount: any,
    donorDonationsAccount: any,
    feeWallet: any
  ): any {
    // Create instruction data buffer
    const data = Buffer.alloc(1 + 8 + 4 + cryptoType.length + 4 + message.length + 1);
    let offset = 0;
    
    // Instruction discriminator
    data.writeUint8(DonationInstruction.Donate, offset);
    offset += 1;
    
    // Amount (u64)
    data.writeBigUint64LE(BigInt(amount), offset);
    offset += 8;
    
    // Crypto type length and string
    data.writeUint32LE(cryptoType.length, offset);
    offset += 4;
    data.write(cryptoType, offset);
    offset += cryptoType.length;
    
    // Message length and string
    data.writeUint32LE(message.length, offset);
    offset += 4;
    data.write(message, offset);
    offset += message.length;
    
    // Anonymous flag
    data.writeUint8(isAnonymous ? 1 : 0, offset);

    return new (require('@solana/web3.js').TransactionInstruction)({
      keys: [
        { pubkey: donor, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
        { pubkey: feeWallet, isSigner: false, isWritable: true },
        { pubkey: programStateAccount, isSigner: false, isWritable: false },
        { pubkey: projectDonationsAccount, isSigner: false, isWritable: true },
        { pubkey: donorDonationsAccount, isSigner: false, isWritable: true },
        { pubkey: (require('@solana/web3.js').SystemProgram).programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }
} 
