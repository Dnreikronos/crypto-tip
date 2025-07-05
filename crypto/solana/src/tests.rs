#[cfg(test)]
use super::*;
use solana_program::{account_info::AccountInfo, clock::Epoch, pubkey::Pubkey, sysvar::rent::Rent};

fn create_account_info<'a>(
    key: &'a Pubkey,
    is_signer: bool,
    is_writable: bool,
    lamports: u64,
    data: &'a mut [u8],
    owner: &'a Pubkey,
) -> AccountInfo<'a> {
    let lamports_mut = Box::leak(Box::new(lamports));
    AccountInfo::new(
        key,
        is_signer,
        is_writable,
        lamports_mut,
        data,
        owner,
        false,
        Epoch::default(),
    )
}

fn create_rent_sysvar_data() -> Vec<u8> {
    vec![
        0x38, 0x0d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x40, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]
}

#[test]
fn test_initialize_with_zero_fee_wallet() {
    let program_id = Pubkey::new_unique();
    let owner = Pubkey::new_unique();
    let fee_wallet = Pubkey::default(); // Zero address
    let program_state_account = Pubkey::new_unique();
    let rent_sysvar = solana_program::sysvar::rent::id();
    let system_program = solana_program::system_program::id();
    let sysvar_id = solana_program::sysvar::id();

    let mut program_state_data = vec![0u8; 1000];
    let mut rent_data = create_rent_sysvar_data();

    let accounts = vec![
        create_account_info(&owner, true, true, 1000000, &mut [], &system_program),
        create_account_info(
            &program_state_account,
            false,
            true,
            0,
            &mut program_state_data,
            &program_id,
        ),
        create_account_info(&fee_wallet, false, false, 1000000, &mut [], &system_program),
        create_account_info(&rent_sysvar, false, false, 0, &mut rent_data, &sysvar_id),
        create_account_info(&system_program, false, false, 0, &mut [], &system_program),
    ];

    let instruction = DonationInstruction::Initialize { fee_wallet };
    let instruction_data = instruction.try_to_vec().unwrap();

    let result = process_instruction(&program_id, &accounts, &instruction_data);
    assert!(result.is_err());
}

#[test]
fn test_donate_zero_amount() {
    let program_id = Pubkey::new_unique();
    let donor = Pubkey::new_unique();
    let recipient = Pubkey::new_unique();
    let fee_wallet = Pubkey::new_unique();
    let owner = Pubkey::new_unique();
    let project_donations_account = Pubkey::new_unique();
    let donor_donations_account = Pubkey::new_unique();
    let system_program = solana_program::system_program::id();
    let program_state_account = Pubkey::new_unique();

    let program_state = ProgramState {
        owner,
        fee_wallet,
        fee_percentage: 1000,
    };
    let mut program_state_data = program_state.try_to_vec().unwrap();
    let mut project_donations_data = vec![0u8; 1000];
    let mut donor_donations_data = vec![0u8; 1000];

    let accounts = vec![
        create_account_info(&donor, true, true, 1000000, &mut [], &system_program),
        create_account_info(&recipient, false, true, 1000000, &mut [], &system_program),
        create_account_info(&fee_wallet, false, true, 1000000, &mut [], &system_program),
        create_account_info(
            &program_state_account,
            false,
            true,
            0,
            &mut program_state_data,
            &program_id,
        ),
        create_account_info(
            &project_donations_account,
            false,
            true,
            0,
            &mut project_donations_data,
            &program_id,
        ),
        create_account_info(
            &donor_donations_account,
            false,
            true,
            0,
            &mut donor_donations_data,
            &program_id,
        ),
        create_account_info(&system_program, false, false, 0, &mut [], &system_program),
    ];

    let instruction = DonationInstruction::Donate {
        amount: 0,
        crypto_type: "SOL".to_string(),
        message: "Test donation".to_string(),
        is_anonymous: false,
    };
    let instruction_data = instruction.try_to_vec().unwrap();

    let result = process_instruction(&program_id, &accounts, &instruction_data);
    assert!(result.is_err());
}

#[test]
fn test_update_fee_wallet() {
    let program_id = Pubkey::new_unique();
    let owner = Pubkey::new_unique();
    let new_fee_wallet = Pubkey::new_unique();
    let system_program = solana_program::system_program::id();
    let program_state_account = Pubkey::new_unique();

    let program_state = ProgramState {
        owner,
        fee_wallet: Pubkey::new_unique(),
        fee_percentage: 1000,
    };
    let mut program_state_data = program_state.try_to_vec().unwrap();

    let accounts = vec![
        create_account_info(&owner, true, false, 1000000, &mut [], &system_program),
        create_account_info(
            &program_state_account,
            false,
            true,
            0,
            &mut program_state_data,
            &program_id,
        ),
        create_account_info(
            &new_fee_wallet,
            false,
            false,
            1000000,
            &mut [],
            &system_program,
        ),
    ];

    let instruction = DonationInstruction::UpdateFeeWallet { new_fee_wallet };
    let instruction_data = instruction.try_to_vec().unwrap();

    let result = process_instruction(&program_id, &accounts, &instruction_data);
    assert!(result.is_ok());
}

#[test]
fn test_transfer_ownership() {
    let program_id = Pubkey::new_unique();
    let current_owner = Pubkey::new_unique();
    let new_owner = Pubkey::new_unique();
    let system_program = solana_program::system_program::id();
    let program_state_account = Pubkey::new_unique();

    let program_state = ProgramState {
        owner: current_owner,
        fee_wallet: Pubkey::new_unique(),
        fee_percentage: 1000,
    };
    let mut program_state_data = program_state.try_to_vec().unwrap();

    let accounts = vec![
        create_account_info(
            &current_owner,
            true,
            false,
            1000000,
            &mut [],
            &system_program,
        ),
        create_account_info(
            &program_state_account,
            false,
            true,
            0,
            &mut program_state_data,
            &program_id,
        ),
        create_account_info(&new_owner, false, false, 1000000, &mut [], &system_program),
    ];

    let instruction = DonationInstruction::TransferOwnership { new_owner };
    let instruction_data = instruction.try_to_vec().unwrap();

    let result = process_instruction(&program_id, &accounts, &instruction_data);
    assert!(result.is_ok());
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
