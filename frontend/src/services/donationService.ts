import { getAuthHeaders } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface DonationInput {
  amount: number;
  crypto_type: string;
  tx_hash: string;
  from_addr: string;
  message?: string;
  anonymous: boolean;
  project_id: string;
}

export interface DonationResponse {
  id: string;
  amount: number;
  crypto_type: string;
  tx_hash: string;
  from_addr: string;
  message?: string;
  project_id: string;
  donor_id?: string;
  anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export async function createDonation(donationData: DonationInput): Promise<DonationResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(donationData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create donation');
  }

  return response.json();
} 