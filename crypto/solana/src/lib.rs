use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program state structures
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Donation {
    pub amount: u64,
    pub crypto_type: String,
    pub message: String,
    pub is_anonymous: bool,
    pub donor: Option<Pubkey>,
    pub timestamp: i64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProjectDonations {
    pub donations: Vec<Donation>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct DonorDonations {
    pub donations: Vec<Donation>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramState {
    pub owner: Pubkey,
    pub fee_wallet: Pubkey,
    pub fee_percentage: u16, // Basis points (1000 = 10%)
}

// Instructions enum
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum DonationInstruction {
    /// Initialize the program
    /// Accounts expected:
    /// 0. `[signer]` The account of the person initializing the program
    /// 1. `[writable]` The program state account
    /// 2. `[]` The fee wallet account
    /// 3. `[]` The rent sysvar
    /// 4. `[]` The system program
    Initialize { fee_wallet: Pubkey },

    /// Make a donation
    /// Accounts expected:
    /// 0. `[signer]` The donor account
    /// 1. `[writable]` The recipient account
    /// 2. `[writable]` The fee wallet account
    /// 3. `[writable]` The program state account
    /// 4. `[writable]` The project donations account (PDA)
    /// 5. `[writable]` The donor donations account (PDA, optional if anonymous)
    /// 6. `[]` The system program
    Donate {
        amount: u64,
        crypto_type: String,
        message: String,
        is_anonymous: bool,
    },

    /// Update fee wallet
    /// Accounts expected:
    /// 0. `[signer]` The owner account
    /// 1. `[writable]` The program state account
    /// 2. `[]` The new fee wallet account
    UpdateFeeWallet { new_fee_wallet: Pubkey },

    /// Transfer ownership
    /// Accounts expected:
    /// 0. `[signer]` The current owner account
    /// 1. `[writable]` The program state account
    /// 2. `[]` The new owner account
    TransferOwnership { new_owner: Pubkey },
}
