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
