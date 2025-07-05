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

pub fn process_donate(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
    crypto_type: String,
    message: String,
    is_anonymous: bool,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let donor = next_account_info(account_info_iter)?;
    let recipient = next_account_info(account_info_iter)?;
    let fee_wallet = next_account_info(account_info_iter)?;
    let program_state_account = next_account_info(account_info_iter)?;
    let project_donations_account = next_account_info(account_info_iter)?;
    let donor_donations_account = next_account_info(account_info_iter)?;
    let _system_program = next_account_info(account_info_iter)?;

    // Check that the donor signed the transaction
    if !donor.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check that the donation amount is greater than 0
    if amount == 0 {
        return Err(ProgramError::InvalidArgument);
    }

    // Check that recipient is not zero address
    if recipient.key == &Pubkey::default() {
        return Err(ProgramError::InvalidAccountData);
    }

    // Load program state
    let program_state = ProgramState::try_from_slice(&program_state_account.data.borrow())?;

    // Check that the fee wallet matches
    if fee_wallet.key != &program_state.fee_wallet {
        return Err(ProgramError::InvalidAccountData);
    }

    // Check that recipient is not the fee wallet
    if recipient.key == &program_state.fee_wallet {
        return Err(ProgramError::InvalidAccountData);
    }

    // Calculate fee and recipient amount (10% fee like in Solidity)
    let fee = (amount * program_state.fee_percentage as u64) / 10000;
    let recipient_amount = amount - fee;

    // Transfer fee to fee wallet
    let transfer_fee_ix = system_instruction::transfer(donor.key, fee_wallet.key, fee);
    solana_program::program::invoke(&transfer_fee_ix, &[donor.clone(), fee_wallet.clone()])?;

    // Transfer remaining amount to recipient
    let transfer_recipient_ix =
        system_instruction::transfer(donor.key, recipient.key, recipient_amount);
    solana_program::program::invoke(&transfer_recipient_ix, &[donor.clone(), recipient.clone()])?;

    // Create donation record
    let donation = Donation {
        amount,
        crypto_type: crypto_type.clone(),
        message: message.clone(),
        is_anonymous,
        donor: if is_anonymous { None } else { Some(*donor.key) },
        timestamp: solana_program::clock::Clock::get()?.unix_timestamp,
    };

    // Store donation in project donations account
    let mut project_donations = if project_donations_account.data_is_empty() {
        ProjectDonations {
            donations: Vec::new(),
        }
    } else {
        ProjectDonations::try_from_slice(&project_donations_account.data.borrow())?
    };

    project_donations.donations.push(donation.clone());
    project_donations.serialize(&mut &mut project_donations_account.data.borrow_mut()[..])?;

    // Store donation in donor donations account (if not anonymous)
    if !is_anonymous {
        let mut donor_donations = if donor_donations_account.data_is_empty() {
            DonorDonations {
                donations: Vec::new(),
            }
        } else {
            DonorDonations::try_from_slice(&donor_donations_account.data.borrow())?
        };

        donor_donations.donations.push(donation);
        donor_donations.serialize(&mut &mut donor_donations_account.data.borrow_mut()[..])?;
    }

    msg!("DonationReceived: donor={}, recipient={}, amount={}, fee={}, cryptoType={}, message={}, anonymous={}", 
         donor.key, recipient.key, amount, fee, crypto_type, message, is_anonymous);

    Ok(())
}

pub fn process_update_fee_wallet(
    accounts: &[AccountInfo],
    new_fee_wallet: Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let owner = next_account_info(account_info_iter)?;
    let program_state_account = next_account_info(account_info_iter)?;
    let _new_fee_wallet_account = next_account_info(account_info_iter)?;

    // Check that the owner signed the transaction
    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check that new fee wallet is not zero address
    if new_fee_wallet == Pubkey::default() {
        return Err(ProgramError::InvalidAccountData);
    }

    // Load and update program state
    let mut program_state = ProgramState::try_from_slice(&program_state_account.data.borrow())?;

    // Check that the caller is the owner
    if program_state.owner != *owner.key {
        return Err(ProgramError::InvalidAccountData);
    }

    let _old_fee_wallet = program_state.fee_wallet;
    program_state.fee_wallet = new_fee_wallet;
    program_state.serialize(&mut &mut program_state_account.data.borrow_mut()[..])?;

    msg!("FeeWalletUpdated: newFeeWallet={}", new_fee_wallet);
    Ok(())
}

pub fn process_transfer_ownership(accounts: &[AccountInfo], new_owner: Pubkey) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let current_owner = next_account_info(account_info_iter)?;
    let program_state_account = next_account_info(account_info_iter)?;
    let _new_owner_account = next_account_info(account_info_iter)?;

    // Check that the current owner signed the transaction
    if !current_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check that new owner is not zero address
    if new_owner == Pubkey::default() {
        return Err(ProgramError::InvalidAccountData);
    }

    // Load and update program state
    let mut program_state = ProgramState::try_from_slice(&program_state_account.data.borrow())?;

    // Check that the caller is the current owner
    if program_state.owner != *current_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }

    let previous_owner = program_state.owner;
    program_state.owner = new_owner;
    program_state.serialize(&mut &mut program_state_account.data.borrow_mut()[..])?;

    msg!(
        "OwnershipTransferred: previousOwner={}, newOwner={}",
        previous_owner,
        new_owner
    );
    Ok(())
}

