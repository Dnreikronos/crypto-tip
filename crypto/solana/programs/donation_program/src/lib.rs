use anchor_lang::prelude::*;

declare_id!("BmNf7XjZZsy19oGcV4YaFvzRDmERo9PWhbUeabTvfzYE");

#[program]
pub mod donation_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.owner = ctx.accounts.initializer.key();
        program_state.fee_wallet = ctx.accounts.initializer.key(); // Default to initializer
        program_state.fee_percentage = 1000; // 10% (1000 basis points)

        msg!("Program initialized with owner: {}", program_state.owner);
        Ok(())
    }

    pub fn donate(
        ctx: Context<Donate>,
        amount: u64,
        crypto_type: String,
        message: String,
        is_anonymous: bool,
    ) -> Result<()> {
        require!(amount > 0, DonationError::InvalidAmount);
        require!(
            ctx.accounts.recipient.key() != ctx.accounts.fee_wallet.key(),
            DonationError::InvalidRecipient
        );

        let program_state = &ctx.accounts.program_state;

        // Calculate fee (10% = 1000 basis points)
        let fee = (amount as u128 * program_state.fee_percentage as u128 / 10000) as u64;
        let recipient_amount = amount - fee;

        // Transfer fee to fee wallet
        let fee_transfer = anchor_lang::system_program::Transfer {
            from: ctx.accounts.donor.to_account_info(),
            to: ctx.accounts.fee_wallet.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), fee_transfer),
            fee,
        )?;

        // Transfer remaining amount to recipient
        let recipient_transfer = anchor_lang::system_program::Transfer {
            from: ctx.accounts.donor.to_account_info(),
            to: ctx.accounts.recipient.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                recipient_transfer,
            ),
            recipient_amount,
        )?;

        // Update project stats
        let project_stats = &mut ctx.accounts.project_stats;
        project_stats.total_amount += amount;
        project_stats.donation_count += 1;
        project_stats.last_donation = Clock::get()?.unix_timestamp;

        // Update donor stats (only if not anonymous)
        if !is_anonymous {
            let donor_stats = &mut ctx.accounts.donor_stats;
            donor_stats.total_donated += amount;
            donor_stats.donation_count += 1;
            donor_stats.last_donation = Clock::get()?.unix_timestamp;
        }

        // Emit donation event with all details
        emit!(DonationEvent {
            donor: if is_anonymous {
                None
            } else {
                Some(ctx.accounts.donor.key())
            },
            recipient: ctx.accounts.recipient.key(),
            amount,
            fee,
            crypto_type,
            message,
            is_anonymous,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!(
            "Donation successful: {} SOL to {}",
            amount as f64 / 1_000_000_000.0,
            ctx.accounts.recipient.key()
        );
        Ok(())
    }

    pub fn update_fee_wallet(ctx: Context<UpdateFeeWallet>, new_fee_wallet: Pubkey) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        let old_fee_wallet = program_state.fee_wallet;
        program_state.fee_wallet = new_fee_wallet;

        emit!(FeeWalletUpdatedEvent {
            old_fee_wallet,
            new_fee_wallet,
            updated_by: ctx.accounts.owner.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!(
            "Fee wallet updated from {} to {}",
            old_fee_wallet,
            new_fee_wallet
        );
        Ok(())
    }

    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        let old_owner = program_state.owner;
        program_state.owner = new_owner;

        emit!(OwnershipTransferredEvent {
            old_owner,
            new_owner,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Ownership transferred from {} to {}", old_owner, new_owner);
        Ok(())
    }
}

// Account Structures (Much Lighter!)
#[account]
pub struct ProgramState {
    pub owner: Pubkey,
    pub fee_wallet: Pubkey,
    pub fee_percentage: u16, // Basis points (1000 = 10%)
}

#[account]
pub struct ProjectStats {
    pub total_amount: u64,
    pub donation_count: u32,
    pub last_donation: i64,
}

#[account]
pub struct DonorStats {
    pub total_donated: u64,
    pub donation_count: u32,
    pub last_donation: i64,
}

// Events (No Storage Limits!)
#[event]
pub struct DonationEvent {
    pub donor: Option<Pubkey>, // None if anonymous
    pub recipient: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub crypto_type: String,
    pub message: String, // Can be any length!
    pub is_anonymous: bool,
    pub timestamp: i64,
}

#[event]
pub struct FeeWalletUpdatedEvent {
    pub old_fee_wallet: Pubkey,
    pub new_fee_wallet: Pubkey,
    pub updated_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct OwnershipTransferredEvent {
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
    pub timestamp: i64,
}

// Context Structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
        init,
        payer = initializer,
        space = 8 + 32 + 32 + 2, // discriminator + owner + fee_wallet + fee_percentage
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    /// CHECK: Recipient can be any account
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    /// CHECK: Fee wallet from program state
    #[account(mut)]
    pub fee_wallet: UncheckedAccount<'info>,

    #[account(
        seeds = [b"program_state"],
        bump,
        constraint = program_state.fee_wallet == fee_wallet.key() @ DonationError::InvalidFeeWallet
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        init_if_needed,
        payer = donor,
        space = 8 + 8 + 4 + 8, // discriminator + total_amount + donation_count + last_donation
        seeds = [b"project_stats", recipient.key().as_ref()],
        bump
    )]
    pub project_stats: Account<'info, ProjectStats>,

    #[account(
        init_if_needed,
        payer = donor,
        space = 8 + 8 + 4 + 8, // discriminator + total_donated + donation_count + last_donation
        seeds = [b"donor_stats", donor.key().as_ref()],
        bump
    )]
    pub donor_stats: Account<'info, DonorStats>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFeeWallet<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump,
        constraint = program_state.owner == owner.key() @ DonationError::InvalidOwner
    )]
    pub program_state: Account<'info, ProgramState>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump,
        constraint = program_state.owner == current_owner.key() @ DonationError::InvalidOwner
    )]
    pub program_state: Account<'info, ProgramState>,

    pub current_owner: Signer<'info>,
}

// Error Codes
#[error_code]
pub enum DonationError {
    #[msg("Invalid donation amount")]
    InvalidAmount,
    #[msg("Invalid recipient address")]
    InvalidRecipient,
    #[msg("Invalid owner address")]
    InvalidOwner,
    #[msg("Invalid fee wallet")]
    InvalidFeeWallet,
}

