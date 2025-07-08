import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as borsh from 'borsh';

// Classes for borsh serialization
export class Donation {
  amount: number = 0;
  cryptoType: string = '';
  message: string = '';
  isAnonymous: boolean = false;
  donor: PublicKey | null = null;
  timestamp: number = 0;

  constructor(fields?: Partial<Donation>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class ProjectDonations {
  donations: Donation[] = [];

  constructor(fields?: Partial<ProjectDonations>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class DonorDonations {
  donations: Donation[] = [];

  constructor(fields?: Partial<DonorDonations>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class ProgramState {
  owner: PublicKey = new PublicKey(0);
  feeWallet: PublicKey = new PublicKey(0);
  feePercentage: number = 0;

  constructor(fields?: Partial<ProgramState>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

// Instruction types
export enum DonationInstruction {
  Initialize = 0,
  Donate = 1,
  UpdateFeeWallet = 2,
  TransferOwnership = 3,
}

// Borsh schemas for serialization
const DONATION_SCHEMA = new Map([
  [
    Donation,
    {
      kind: 'struct',
      fields: [
        ['amount', 'u64'],
        ['cryptoType', 'string'],
        ['message', 'string'],
        ['isAnonymous', 'bool'],
        ['donor', { kind: 'option', type: [32] }],
        ['timestamp', 'i64'],
      ],
    },
  ],
]);

const PROJECT_DONATIONS_SCHEMA = new Map([
  [
    ProjectDonations,
    {
      kind: 'struct',
      fields: [['donations', [Donation]]],
    },
  ],
]);

const DONOR_DONATIONS_SCHEMA = new Map([
  [
    DonorDonations,
    {
      kind: 'struct',
      fields: [['donations', [Donation]]],
    },
  ],
]);

const PROGRAM_STATE_SCHEMA = new Map([
  [
    ProgramState,
    {
      kind: 'struct',
      fields: [
        ['owner', [32]],
        ['feeWallet', [32]],
        ['feePercentage', 'u16'],
      ],
    },
  ],
]);

export class SolanaDonationClient {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  /**
   * Initialize the donation program
   */
  async initialize(
    payer: Keypair,
    programStateAccount: Keypair,
    feeWallet: PublicKey
  ): Promise<string> {
    const instruction = this.createInitializeInstruction(
      payer.publicKey,
      programStateAccount.publicKey,
      feeWallet
    );

    const transaction = new Transaction().add(instruction);
    return await sendAndConfirmTransaction(this.connection, transaction, [payer, programStateAccount]);
  }

  /**
   * Make a donation
   */
  async donate(
    donor: Keypair,
    recipient: PublicKey,
    amount: number,
    cryptoType: string,
    message: string,
    isAnonymous: boolean,
    programStateAccount: PublicKey,
    projectDonationsAccount: PublicKey,
    donorDonationsAccount: PublicKey
  ): Promise<string> {
    const instruction = this.createDonateInstruction(
      donor.publicKey,
      recipient,
      amount,
      cryptoType,
      message,
      isAnonymous,
      programStateAccount,
      projectDonationsAccount,
      donorDonationsAccount
    );

    const transaction = new Transaction().add(instruction);
    return await sendAndConfirmTransaction(this.connection, transaction, [donor]);
  }

  /**
   * Update the fee wallet (owner only)
   */
  async updateFeeWallet(
    owner: Keypair,
    programStateAccount: PublicKey,
    newFeeWallet: PublicKey
  ): Promise<string> {
    const instruction = this.createUpdateFeeWalletInstruction(
      owner.publicKey,
      programStateAccount,
      newFeeWallet
    );

    const transaction = new Transaction().add(instruction);
    return await sendAndConfirmTransaction(this.connection, transaction, [owner]);
  }

  /**
   * Transfer ownership (owner only)
   */
  async transferOwnership(
    currentOwner: Keypair,
    programStateAccount: PublicKey,
    newOwner: PublicKey
  ): Promise<string> {
    const instruction = this.createTransferOwnershipInstruction(
      currentOwner.publicKey,
      programStateAccount,
      newOwner
    );

    const transaction = new Transaction().add(instruction);
    return await sendAndConfirmTransaction(this.connection, transaction, [currentOwner]);
  }

  /**
   * Get project donations
   */
  async getProjectDonations(projectDonationsAccount: PublicKey): Promise<Donation[]> {
    const accountInfo = await this.connection.getAccountInfo(projectDonationsAccount);
    if (!accountInfo || accountInfo.data.length === 0) {
      return [];
    }

    try {
      const projectDonations = borsh.deserialize(
        PROJECT_DONATIONS_SCHEMA,
        ProjectDonations,
        accountInfo.data
      ) as ProjectDonations;
      return projectDonations.donations;
    } catch (error) {
      console.error('Error deserializing project donations:', error);
      return [];
    }
  }

  /**
   * Get donor donations
   */
  async getDonorDonations(donorDonationsAccount: PublicKey): Promise<Donation[]> {
    const accountInfo = await this.connection.getAccountInfo(donorDonationsAccount);
    if (!accountInfo || accountInfo.data.length === 0) {
      return [];
    }

    try {
      const donorDonations = borsh.deserialize(
        DONOR_DONATIONS_SCHEMA,
        DonorDonations,
        accountInfo.data
      ) as DonorDonations;
      return donorDonations.donations;
    } catch (error) {
      console.error('Error deserializing donor donations:', error);
      return [];
    }
  }

  /**
   * Get program state
   */
  async getProgramState(programStateAccount: PublicKey): Promise<ProgramState | null> {
    const accountInfo = await this.connection.getAccountInfo(programStateAccount);
    if (!accountInfo || accountInfo.data.length === 0) {
      return null;
    }

    try {
      return borsh.deserialize(PROGRAM_STATE_SCHEMA, ProgramState, accountInfo.data) as ProgramState;
    } catch (error) {
      console.error('Error deserializing program state:', error);
      return null;
    }
  }

  /**
   * Derive PDA for project donations account
   */
  async deriveProjectDonationsAccount(project: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('project_donations'), project.toBuffer()],
      this.programId
    );
  }

  /**
   * Derive PDA for donor donations account
   */
  async deriveDonorDonationsAccount(donor: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('donor_donations'), donor.toBuffer()],
      this.programId
    );
  }

  // Private methods for creating instructions
  private createInitializeInstruction(
    payer: PublicKey,
    programStateAccount: PublicKey,
    feeWallet: PublicKey
  ): TransactionInstruction {
    const data = Buffer.alloc(1 + 32); // instruction discriminator + fee_wallet
    data.writeUint8(DonationInstruction.Initialize, 0);
    feeWallet.toBuffer().copy(data, 1);

    return new TransactionInstruction({
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: programStateAccount, isSigner: false, isWritable: true },
        { pubkey: feeWallet, isSigner: false, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  private createDonateInstruction(
    donor: PublicKey,
    recipient: PublicKey,
    amount: number,
    cryptoType: string,
    message: string,
    isAnonymous: boolean,
    programStateAccount: PublicKey,
    projectDonationsAccount: PublicKey,
    donorDonationsAccount: PublicKey
  ): TransactionInstruction {
    const data = Buffer.alloc(1 + 8 + 4 + cryptoType.length + 4 + message.length + 1);
    let offset = 0;
    data.writeUint8(DonationInstruction.Donate, offset);
    offset += 1;
    data.writeBigUInt64LE(BigInt(amount), offset);
    offset += 8;
    data.writeUint32LE(cryptoType.length, offset);
    offset += 4;
    data.write(cryptoType, offset);
    offset += cryptoType.length;
    data.writeUint32LE(message.length, offset);
    offset += 4;
    data.write(message, offset);
    offset += message.length;
    data.writeUint8(isAnonymous ? 1 : 0, offset);

    return new TransactionInstruction({
      keys: [
        { pubkey: donor, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
        { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: true }, // fee wallet
        { pubkey: programStateAccount, isSigner: false, isWritable: true },
        { pubkey: projectDonationsAccount, isSigner: false, isWritable: true },
        { pubkey: donorDonationsAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  private createUpdateFeeWalletInstruction(
    owner: PublicKey,
    programStateAccount: PublicKey,
    newFeeWallet: PublicKey
  ): TransactionInstruction {
    const data = Buffer.alloc(1 + 32); // instruction discriminator + new_fee_wallet
    data.writeUint8(DonationInstruction.UpdateFeeWallet, 0);
    newFeeWallet.toBuffer().copy(data, 1);

    return new TransactionInstruction({
      keys: [
        { pubkey: owner, isSigner: true, isWritable: false },
        { pubkey: programStateAccount, isSigner: false, isWritable: true },
        { pubkey: newFeeWallet, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  private createTransferOwnershipInstruction(
    currentOwner: PublicKey,
    programStateAccount: PublicKey,
    newOwner: PublicKey
  ): TransactionInstruction {
    const data = Buffer.alloc(1 + 32); // instruction discriminator + new_owner
    data.writeUint8(DonationInstruction.TransferOwnership, 0);
    newOwner.toBuffer().copy(data, 1);

    return new TransactionInstruction({
      keys: [
        { pubkey: currentOwner, isSigner: true, isWritable: false },
        { pubkey: programStateAccount, isSigner: false, isWritable: true },
        { pubkey: newOwner, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }
} 
