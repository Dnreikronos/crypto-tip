use anchor_lang::prelude::*;
use std::str::FromStr;

declare_id!("BmNf7XjZZsy19oGcV4YaFvzRDmERo9PWhbUeabTvfzYE");

const FEE_WALLET: &str = "HcbsE3qKtud5VsHWxha3jE14otZAV8Gdj5Qtke66oP8U";

#[program]
pub mod donation_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.owner = ctx.accounts.initializer.key();
        program_state.fee_wallet = Pubkey::from_str(FEE_WALLET).unwrap();
        program_state.fee_percentage = 1000;

        msg!(
            "Program initialized with owner: {} and fee wallet: {}",
            ctx.accounts.initializer.key(),
            program_state.fee_wallet
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
        require!(amount > 0, DonationError::InvalidAmount);
        require!(
            ctx.accounts.recipient.key() != Pubkey::default(),
            DonationError::InvalidRecipient
        );
        require!(
            ctx.accounts.recipient.key() != ctx.accounts.program_state.fee_wallet,
            DonationError::InvalidRecipient
        );

        let fee = (amount * ctx.accounts.program_state.fee_percentage as u64) / 10_000;
        let recipient_amount = amount - fee;

        let cpi_accounts = anchor_lang::system_program::Transfer {
            from: ctx.accounts.donor.to_account_info(),
            to: ctx.accounts.feeWallet.to_account_info(),
        };
        let cpi_ctx =
            CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        anchor_lang::system_program::transfer(cpi_ctx, fee)?;

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donor.key(),
            &ctx.accounts.recipient.key(),
            recipient_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
            ],
        )?;

        let donation = Donation {
            amount,
            crypto_type: crypto_type.clone(),
            message: message.clone(),
            is_anonymous,
            donor: if is_anonymous {
                None
            } else {
                Some(ctx.accounts.donor.key())
            },
            timestamp: Clock::get()?.unix_timestamp,
        };

        ctx.accounts.project_donations.donations.push(donation.clone());
        if !is_anonymous {
            ctx.accounts.donor_donations.donations.push(donation);
        }

        msg!(
            "DonationReceived: donor={}, recipient={}, amount={}, fee={}, cryptoType={}, message={}, anonymous={}",
            ctx.accounts.donor.key(),
            ctx.accounts.recipient.key(),
            amount,
            fee,
            crypto_type,
            message,
            is_anonymous
        );

        Ok(())
    }

    pub fn transfer_ownership(
        ctx: Context<TransferOwnership>,
        new_owner: Pubkey,
    ) -> Result<()> {
        require!(new_owner != Pubkey::default(), DonationError::InvalidOwner);
        let program_state = &mut ctx.accounts.program_state;
        let previous = program_state.owner;
        program_state.owner = new_owner;
        msg!(
            "OwnershipTransferred: previousOwner={}, newOwner={}",
            previous,
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

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, crypto_type: String, message: String, is_anonymous: bool)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    /// CHECK: validated in handler
    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    /// CHECK: must match program_state.fee_wallet
    #[account(mut)]
    pub feeWallet: AccountInfo<'info>,

    #[account(
        seeds = [b"program_state"],
        bump,
        constraint = feeWallet.key() == program_state.fee_wallet
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
pub struct TransferOwnership<'info> {
    #[account(constraint = current_owner.key() == program_state.owner)]
    pub current_owner: Signer<'info>,

    #[account(mut, seeds = [b"program_state"], bump)]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: new owner
    pub new_owner: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub owner: Pubkey,
    pub fee_wallet: Pubkey,
    pub fee_percentage: u16,
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
    #[msg("Invalid donation amount")]
    InvalidAmount,
    #[msg("Invalid recipient address")]
    InvalidRecipient,
    #[msg("Invalid owner address")]
    InvalidOwner,
}

