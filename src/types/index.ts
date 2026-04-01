export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
export type DrawStatus = 'simulated' | 'published';
export type WinnerStatus = 'pending' | 'rejected' | 'paid' | 'dispensed' | 'claimed';

export interface Country {
  id: string;
  code: string;
  name: string;
  currency_code: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  country_id: string | null;
  charity_id: string | null;
  contribution_percentage: number;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  // Optional relations
  countries?: Country;
  charities?: Charity;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  country_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  plan: 'monthly' | 'yearly' | 'free';
  currency: string;
  current_period_end: string;
}

export interface Score {
  id: string;
  user_id: string;
  value: number;
  created_at: string;
}

export interface Draw {
  id: string;
  type: 'random' | 'algorithmic';
  numbers: number[];
  prize_pool_total: number;
  tier_5_pool: number;
  tier_4_pool: number;
  tier_3_pool: number;
  status: DrawStatus;
  country_id: string | null;
  published_at: string | null;
  score_cutoff_at: string | null;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_count: number;
  prize_amount: number;
  prize_currency: string;
  proof_url: string | null;
  status: WinnerStatus;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface AuditLog {
    id: string;
    user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, unknown> | string;
    created_at: string;
}

export interface KYCRecord {
  id: string;
  user_id: string;
  full_name: string;
  dob: string | null;
  phone: string | null;
  address: string | null;
  id_type: 'passport' | 'license' | 'national_id' | null;
  id_number: string | null;
  id_front_url: string | null;
  w9_form_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  winner_id: string;
  user_id: string;
  amount: number;
  account_details: {
    bank_name: string;
    account_number: string;
    routing_number: string;
  };
  charity_id: string | null;
  contribution_percentage: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'draft';
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}
