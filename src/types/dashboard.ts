export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'USER' | 'ADMIN';
  bio?: string;
  phone?: string;
  contribution_percentage: number;
  comm_alerts: boolean;
  comm_weekly: boolean;
  comm_network: boolean;
  charities?: CharityNode | null;
}

export interface CharityNode {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}

export interface DashboardStats {
  totalWon: number;
  totalDonated: number;
  totalLivesImpacted: number;
  activeSubs: number;
  charityName: string;
  selectedCharity: CharityNode | null;
}

export interface WinnerRecord {
  id: string;
  user_id: string;
  created_at: string;
  prize_amount: number;
  status: string;
  draws?: {
    type?: string;
    numbers?: number[];
    published_at?: string;
  } | null;
}

export interface LeaderboardEntry {
  name: string;
  amount: number;
  type: string;
  date: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan?: string;
  plan_name?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface DashboardData {
  profile: Profile | null;
  stats: DashboardStats;
  scores: Array<{ value: number; id: string }>;
  scoreDates: string[];
  winnings: Array<{
    id: string;
    prize_amount: number;
    status: string;
    created_at: string;
    type?: string;
  }>;
  charities?: CharityNode[];
  stories?: Array<{
    id: string;
    title: string;
    category?: string;
    description: string;
    image_url: string;
  }>;
  history: Array<{
    id: string;
    draw_numbers: number[];
    user_numbers: number[];
    date?: string;
  }>;
  topWinners: LeaderboardEntry[];
  nextDraw?: string | null;
  chartData?: Array<{ year: string; val: string; active?: boolean }>;
  grants?: Array<{
    id: string;
    name: string;
    region: string;
    lives_impacted: number;
    status: string;
  }>;
  ledger: Array<{
    partner_name: string;
    created_at: string;
    amount: number;
    allocation_type: string;
    status: string;
  }>;
  subscription?: Subscription | null;
  planLimits?: import('@/lib/plan-limits').PlanLimits;
  planId?: import('@/lib/plan-limits').PlanId;
}
