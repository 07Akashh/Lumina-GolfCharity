import { requireAuth } from "@/lib/supabase/server-utils";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { OverviewTab } from "@/components/admin/dashboard/AdminDashboardCSR";
import { getCharities } from "@/modules/charity/actions";

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  await requireAuth("ADMIN");
  
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { count: totalSubs },
    { count: activeSubs },
    { data: draws },
    { data: winners },
    charities,
    { data: activeSubsData }
  ] = await Promise.all([
    adminDb.from('subscriptions').select('*', { count: 'exact', head: true }),
    adminDb.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminDb.from('draws').select('*').order('created_at', { ascending: false }).limit(20),
    adminDb.from('winners').select('*, profiles(full_name, email), draws(type, prize_pool_total)').order('created_at', { ascending: false }),
    getCharities(),
    adminDb.from('subscriptions').select('amount, price, status, plan').eq('status', 'active')
  ]);

  const stats = {
    totalSubs: totalSubs || 0,
    activeSubs: activeSubs || 0,
    draws: draws || [],
    recentWinners: winners?.slice(0, 10) || []
  };

  // Calculate real metrics from DB ledgers
  const TIER_PRICES: Record<string, number> = { ethereal: 99, apex: 499, luminary: 1999, monthly: 99, yearly: 990 };
  const totalRevenue = (activeSubsData || []).reduce((acc, sub) => acc + (sub.amount || sub.price || TIER_PRICES[sub.plan] || 0), 0) || 0;
  const estimatedDistributed = (draws || []).reduce((acc, draw) => acc + Number(draw.prize_pool_total || 0), 0);

  return (
    <div className="space-y-6  animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="display-lg text-[#0a1628] mb-2">Governance <span className="serif-i text-[#c81e51] italic">Core</span></h1>
        <p className="text-[13px] text-[#94a3b8] font-medium">Platform Overview and systemic impact metrics.</p>
      </div>
      <OverviewTab stats={stats} totalRevenue={totalRevenue} estimatedDistributed={estimatedDistributed} charities={charities || []} />
    </div>
  );
}
