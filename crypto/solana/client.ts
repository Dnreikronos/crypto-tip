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

