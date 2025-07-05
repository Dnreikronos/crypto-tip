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

