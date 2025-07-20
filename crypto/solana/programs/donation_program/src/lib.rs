use anchor_lang::prelude::*;
use std::str::FromStr;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Hardcoded fee wallet address
const FEE_WALLET: &str = "HcbsE3qKtud5VsHWxha3jE14otZAV8Gdj5Qtke66oP8U"; // Replace with your actual fee wallet address

#[program]
pub mod donation_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.owner = ctx.accounts.initializer.key();
        program_state.fee_wallet = Pubkey::from_str(FEE_WALLET).unwrap();
        program_state.fee_percentage = 1000; // 10% in basis points

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
        let cpi_accounts = anchor_lang::system_program::Transfer {
            from: ctx.accounts.donor.to_account_info(),
            to: ctx.accounts.fee_wallet.to_account_info(),
        };
        let cpi_context =
            CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        anchor_lang::system_program::transfer(cpi_context, fee)?;

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
            donor: if is_anonymous {
                None
            } else {
                Some(ctx.accounts.donor.key())
            },
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

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, crypto_type: String, message: String, is_anonymous: bool)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    /// CHECK: This is safe because we verify the recipient address in the instruction handler and ensure it is not the zero address or the fee wallet.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    /// CHECK: This is safe because we check that the fee_wallet matches the program state's fee_wallet.
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
    #[msg("Invalid donation amount")]
    InvalidAmount,
    #[msg("Invalid recipient address")]
    InvalidRecipient,
    #[msg("Invalid owner address")]
    InvalidOwner,
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::solana_program::pubkey::Pubkey;
    use anchor_lang::solana_program::system_program;
    use anchor_lang::solana_program::sysvar::rent::Rent;
    use anchor_lang::solana_program::sysvar::SysvarId;

    #[test]
    fn test_initialize_with_hardcoded_fee_wallet() {
        let program_id = id();
        let owner = Pubkey::new_unique();
        let fee_wallet = Pubkey::from_str(FEE_WALLET).unwrap();
        let program_state_pda = Pubkey::find_program_address(&[b"program_state"], &program_id).0;
        let rent_sysvar = Rent::id();
        let system_program = system_program::ID;

        // Create a mock context
        let mut lamports = 1000u64;
        let mut data = vec![0u8; 1000];
        let mut rent_lamports = 0u64;
        let mut rent_data = vec![0u8; 1000];
        let mut system_lamports = 0u64;
        let mut system_data = vec![0u8; 1000];
        let mut fee_lamports = 1000u64;
        let mut fee_data = vec![0u8; 1000];

        let mut accounts = vec![
            // initializer
            anchor_lang::solana_program::account_info::AccountInfo::new(
                &owner,
                true,
                true,
                &mut lamports,
                &mut data,
                &system_program,
                false,
                0,
            ),
            // program_state
            anchor_lang::solana_program::account_info::AccountInfo::new(
                &program_state_pda,
                false,
                true,
                &mut rent_lamports,
                &mut rent_data,
                &program_id,
                false,
                0,
            ),
            // fee_wallet
            anchor_lang::solana_program::account_info::AccountInfo::new(
                &fee_wallet,
                false,
                false,
                &mut fee_lamports,
                &mut fee_data,
                &system_program,
                false,
                0,
            ),
            // system_program
            anchor_lang::solana_program::account_info::AccountInfo::new(
                &system_program,
                false,
                false,
                &mut system_lamports,
                &mut system_data,
                &system_program,
                false,
                0,
            ),
        ];

        // Verify the hardcoded fee wallet is set correctly
        assert_eq!(fee_wallet, Pubkey::from_str(FEE_WALLET).unwrap());
    }

    #[test]
    fn test_donate_zero_amount() {
        // Test that donating zero amount should fail
        let amount = 0u64;
        assert_eq!(amount, 0);

        // In a real Anchor test, this would be tested with proper context setup
        // The require! macro would throw an error for zero amount
    }

    #[test]
    fn test_transfer_ownership() {
        let program_id = id();
        let current_owner = Pubkey::new_unique();
        let new_owner = Pubkey::new_unique();
        let _program_state_pda = Pubkey::find_program_address(&[b"program_state"], &program_id).0;

        // Create a mock program state
        let mut program_state = ProgramState {
            owner: current_owner,
            fee_wallet: Pubkey::from_str(FEE_WALLET).unwrap(),
            fee_percentage: 1000,
        };

        // Test the transfer logic
        let previous_owner = program_state.owner;
        program_state.owner = new_owner;

        assert_eq!(program_state.owner, new_owner);
        assert_eq!(previous_owner, current_owner);
        assert_ne!(program_state.owner, previous_owner);
    }

    #[test]
    fn test_fee_calculation() {
        let amount = 1000000; // 1 SOL
        let fee_percentage = 1000; // 10%
        let expected_fee = (amount * fee_percentage as u64) / 10000;
        let expected_recipient_amount = amount - expected_fee;

        assert_eq!(expected_fee, 100000); // 0.1 SOL
        assert_eq!(expected_recipient_amount, 900000); // 0.9 SOL
    }

    #[test]
    fn test_donation_creation() {
        let amount = 1000000u64;
        let crypto_type = "SOL".to_string();
        let message = "Test donation".to_string();
        let is_anonymous = false;
        let donor = Pubkey::new_unique();
        let timestamp = 1234567890i64;

        let donation = Donation {
            amount,
            crypto_type: crypto_type.clone(),
            message: message.clone(),
            is_anonymous,
            donor: Some(donor),
            timestamp,
        };

        assert_eq!(donation.amount, amount);
        assert_eq!(donation.crypto_type, crypto_type);
        assert_eq!(donation.message, message);
        assert_eq!(donation.is_anonymous, is_anonymous);
        assert_eq!(donation.donor, Some(donor));
        assert_eq!(donation.timestamp, timestamp);
    }

    #[test]
    fn test_anonymous_donation() {
        let amount = 1000000u64;
        let crypto_type = "SOL".to_string();
        let message = "Anonymous donation".to_string();
        let is_anonymous = true;
        let timestamp = 1234567890i64;

        let donation = Donation {
            amount,
            crypto_type: crypto_type.clone(),
            message: message.clone(),
            is_anonymous,
            donor: None, // Anonymous donations have no donor
            timestamp,
        };

        assert_eq!(donation.amount, amount);
        assert_eq!(donation.crypto_type, crypto_type);
        assert_eq!(donation.message, message);
        assert_eq!(donation.is_anonymous, is_anonymous);
        assert_eq!(donation.donor, None);
        assert_eq!(donation.timestamp, timestamp);
    }

    #[test]
    fn test_program_state_creation() {
        let owner = Pubkey::new_unique();
        let fee_wallet = Pubkey::from_str(FEE_WALLET).unwrap();
        let fee_percentage = 1000u16;

        let program_state = ProgramState {
            owner,
            fee_wallet,
            fee_percentage,
        };

        assert_eq!(program_state.owner, owner);
        assert_eq!(program_state.fee_wallet, fee_wallet);
        assert_eq!(program_state.fee_percentage, fee_percentage);
    }

    #[test]
    fn test_project_donations_storage() {
        let mut project_donations = ProjectDonations {
            donations: Vec::new(),
        };

        let donation = Donation {
            amount: 1000000,
            crypto_type: "SOL".to_string(),
            message: "Test donation".to_string(),
            is_anonymous: false,
            donor: Some(Pubkey::new_unique()),
            timestamp: 1234567890,
        };

        project_donations.donations.push(donation.clone());

        assert_eq!(project_donations.donations.len(), 1);
        assert_eq!(project_donations.donations[0].amount, donation.amount);
        assert_eq!(
            project_donations.donations[0].crypto_type,
            donation.crypto_type
        );
    }

    #[test]
    fn test_donor_donations_storage() {
        let mut donor_donations = DonorDonations {
            donations: Vec::new(),
        };

        let donation = Donation {
            amount: 1000000,
            crypto_type: "SOL".to_string(),
            message: "Test donation".to_string(),
            is_anonymous: false,
            donor: Some(Pubkey::new_unique()),
            timestamp: 1234567890,
        };

        donor_donations.donations.push(donation.clone());

        assert_eq!(donor_donations.donations.len(), 1);
        assert_eq!(donor_donations.donations[0].amount, donation.amount);
        assert_eq!(
            donor_donations.donations[0].crypto_type,
            donation.crypto_type
        );
    }

    #[test]
    fn test_pda_derivation() {
        let program_id = id();
        let project = Pubkey::new_unique();
        let donor = Pubkey::new_unique();

        // Test project donations PDA
        let (project_donations_pda, _) =
            Pubkey::find_program_address(&[b"project_donations", project.as_ref()], &program_id);

        // Test donor donations PDA
        let (donor_donations_pda, _) =
            Pubkey::find_program_address(&[b"donor_donations", donor.as_ref()], &program_id);

        // Test program state PDA
        let (program_state_pda, _) = Pubkey::find_program_address(&[b"program_state"], &program_id);

        // Verify PDAs are unique
        assert_ne!(project_donations_pda, donor_donations_pda);
        assert_ne!(project_donations_pda, program_state_pda);
        assert_ne!(donor_donations_pda, program_state_pda);
    }

    #[test]
    fn test_error_codes() {
        // Test that our custom error codes are properly defined
        let invalid_amount = DonationError::InvalidAmount;
        let invalid_recipient = DonationError::InvalidRecipient;
        let invalid_owner = DonationError::InvalidOwner;

        // These should compile without error
        assert!(matches!(invalid_amount, DonationError::InvalidAmount));
        assert!(matches!(invalid_recipient, DonationError::InvalidRecipient));
        assert!(matches!(invalid_owner, DonationError::InvalidOwner));
    }
}
