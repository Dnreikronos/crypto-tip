use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod donation_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee_wallet: Pubkey) -> Result<()> {
        // Check that the fee wallet is not zero address
        require!(fee_wallet != Pubkey::default(), DonationError::InvalidFeeWallet);

        let program_state = &mut ctx.accounts.program_state;
        program_state.owner = ctx.accounts.initializer.key();
        program_state.fee_wallet = fee_wallet;
        program_state.fee_percentage = 1000; // 10% in basis points

        msg!(
            "Program initialized with owner: {} and fee wallet: {}",
            ctx.accounts.initializer.key(),
            fee_wallet
        );

        Ok(())
    }

    pub fn donate(
        ctx: Context<Donate>,
        amount: u64,
        crypto_type: String,
        message: String,
        is_anonymous: bool,
    ) -> Result<()> {
        // Check that the donation amount is greater than 0
        require!(amount > 0, DonationError::InvalidAmount);

        // Check that recipient is not zero address
        require!(
            ctx.accounts.recipient.key() != Pubkey::default(),
            DonationError::InvalidRecipient
        );

        // Check that recipient is not the fee wallet
        require!(
            ctx.accounts.recipient.key() != ctx.accounts.program_state.fee_wallet,
            DonationError::InvalidRecipient
        );

        // Calculate fee and recipient amount (10% fee)
        let fee = (amount * ctx.accounts.program_state.fee_percentage as u64) / 10000;
        let recipient_amount = amount - fee;

        // Transfer fee to fee wallet
        let transfer_fee_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donor.key(),
            &ctx.accounts.fee_wallet.key(),
            fee,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_fee_ix,
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.fee_wallet.to_account_info(),
            ],
        )?;

        // Transfer remaining amount to recipient
        let transfer_recipient_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donor.key(),
            &ctx.accounts.recipient.key(),
            recipient_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_recipient_ix,
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
            ],
        )?;

        // Create donation record
        let donation = Donation {
            amount,
            crypto_type: crypto_type.clone(),
            message: message.clone(),
            is_anonymous,
            donor: if is_anonymous { None } else { Some(ctx.accounts.donor.key()) },
            timestamp: Clock::get()?.unix_timestamp,
        };

        // Store donation in project donations account
        let project_donations = &mut ctx.accounts.project_donations;
        project_donations.donations.push(donation.clone());

        // Store donation in donor donations account (if not anonymous)
        if !is_anonymous {
            let donor_donations = &mut ctx.accounts.donor_donations;
            donor_donations.donations.push(donation);
        }

        msg!("DonationReceived: donor={}, recipient={}, amount={}, fee={}, cryptoType={}, message={}, anonymous={}", 
             ctx.accounts.donor.key(), ctx.accounts.recipient.key(), amount, fee, crypto_type, message, is_anonymous);

        Ok(())
    }

    pub fn update_fee_wallet(ctx: Context<UpdateFeeWallet>, new_fee_wallet: Pubkey) -> Result<()> {
        // Check that new fee wallet is not zero address
        require!(new_fee_wallet != Pubkey::default(), DonationError::InvalidFeeWallet);

        let program_state = &mut ctx.accounts.program_state;
        let _old_fee_wallet = program_state.fee_wallet;
        program_state.fee_wallet = new_fee_wallet;

        msg!("FeeWalletUpdated: newFeeWallet={}", new_fee_wallet);
        Ok(())
    }

    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
        // Check that new owner is not zero address
        require!(new_owner != Pubkey::default(), DonationError::InvalidOwner);

        let program_state = &mut ctx.accounts.program_state;
        let previous_owner = program_state.owner;
        program_state.owner = new_owner;

        msg!(
            "OwnershipTransferred: previousOwner={}, newOwner={}",
            previous_owner,
            new_owner
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
        init,
        payer = initializer,
        space = 8 + ProgramState::INIT_SPACE,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: This is the fee wallet account
    pub fee_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    #[account(mut)]
    pub fee_wallet: AccountInfo<'info>,

    #[account(
        seeds = [b"program_state"],
        bump,
        constraint = fee_wallet.key() == program_state.fee_wallet
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        init_if_needed,
        payer = donor,
        space = 8 + ProjectDonations::INIT_SPACE,
        seeds = [b"project_donations", recipient.key().as_ref()],
        bump
    )]
    pub project_donations: Account<'info, ProjectDonations>,

    #[account(
        init_if_needed,
        payer = donor,
        space = 8 + DonorDonations::INIT_SPACE,
        seeds = [b"donor_donations", donor.key().as_ref()],
        bump
    )]
    pub donor_donations: Account<'info, DonorDonations>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFeeWallet<'info> {
    #[account(
        constraint = owner.key() == program_state.owner
    )]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: This is the new fee wallet account
    pub new_fee_wallet: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(
        constraint = current_owner.key() == program_state.owner
    )]
    pub current_owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: This is the new owner account
    pub new_owner: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub owner: Pubkey,
    pub fee_wallet: Pubkey,
    pub fee_percentage: u16, // Basis points (1000 = 10%)
}

#[account]
#[derive(InitSpace)]
pub struct ProjectDonations {
    #[max_len(1000)]
    pub donations: Vec<Donation>,
}

#[account]
#[derive(InitSpace)]
pub struct DonorDonations {
    #[max_len(1000)]
    pub donations: Vec<Donation>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, InitSpace)]
pub struct Donation {
    pub amount: u64,
    #[max_len(50)]
    pub crypto_type: String,
    #[max_len(500)]
    pub message: String,
    pub is_anonymous: bool,
    pub donor: Option<Pubkey>,
    pub timestamp: i64,
}

#[error_code]
pub enum DonationError {
    #[msg("Invalid fee wallet address")]
    InvalidFeeWallet,
    #[msg("Invalid donation amount")]
    InvalidAmount,
    #[msg("Invalid recipient address")]
    InvalidRecipient,
    #[msg("Invalid owner address")]
    InvalidOwner,
}

#[cfg(test)]
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

