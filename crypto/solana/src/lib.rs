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

// Program entrypoint's implementation
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = DonationInstruction::try_from_slice(instruction_data)?;

    match instruction {
        DonationInstruction::Initialize { fee_wallet } => {
            msg!("Instruction: Initialize");
            process_initialize(_program_id, accounts, fee_wallet)
        }
        DonationInstruction::Donate {
            amount,
            crypto_type,
            message,
            is_anonymous,
        } => {
            msg!("Instruction: Donate");
            process_donate(
                _program_id,
                accounts,
                amount,
                crypto_type,
                message,
                is_anonymous,
            )
        }
        DonationInstruction::UpdateFeeWallet { new_fee_wallet } => {
            msg!("Instruction: UpdateFeeWallet");
            process_update_fee_wallet(accounts, new_fee_wallet)
        }
        DonationInstruction::TransferOwnership { new_owner } => {
            msg!("Instruction: TransferOwnership");
            process_transfer_ownership(accounts, new_owner)
        }
    }
}

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    fee_wallet: Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;
    let program_state_account = next_account_info(account_info_iter)?;
    let fee_wallet_account = next_account_info(account_info_iter)?;
    let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let _system_program = next_account_info(account_info_iter)?;

    // Check that the initializer signed the transaction
    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check that the fee wallet account exists and is not zero address
    if fee_wallet_account.key != &fee_wallet || fee_wallet == Pubkey::default() {
        return Err(ProgramError::InvalidAccountData);
    }

    // Check that the program state account is not already initialized
    if program_state_account.data_is_empty() {
        let program_state = ProgramState {
            owner: *initializer.key,
            fee_wallet,
            fee_percentage: 1000, // 10% in basis points (matching Solidity FEE_PERCENTAGE)
        };

        let space = program_state.try_to_vec()?.len();
        let lamports = rent.minimum_balance(space);

        let create_account_ix = system_instruction::create_account(
            initializer.key,
            program_state_account.key,
            lamports,
            space as u64,
            program_id,
        );

        solana_program::program::invoke(
            &create_account_ix,
            &[initializer.clone(), program_state_account.clone()],
        )?;

        program_state.serialize(&mut &mut program_state_account.data.borrow_mut()[..])?;

        msg!(
            "Program initialized with owner: {} and fee wallet: {}",
            initializer.key,
            fee_wallet
        );
    }

    Ok(())
}
