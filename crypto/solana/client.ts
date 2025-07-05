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

