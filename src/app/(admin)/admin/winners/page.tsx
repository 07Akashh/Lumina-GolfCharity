import { requireAuth } from "@/lib/supabase/server-utils";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { WinnersTab } from "@/components/admin/dashboard/AdminDashboardCSR";
import { Profile } from "@/types";

interface JoinedWithProfile {
  profiles: Profile | null;
}

export const dynamic = 'force-dynamic'

export default async function WinnersPage() {
  await requireAuth("ADMIN");

  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { data: winners },
    { data: kycRecords },
    { data: claims }
  ] = await Promise.all([
    adminDb.from('winners').select('*, profiles:user_id!inner(full_name, email, role), draws(type, prize_pool_total)').eq('profiles.role', 'USER').order('created_at', { ascending: false }),
    adminDb.from('kyc_records').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    adminDb.from('claims').select('*, profiles:user_id!inner(full_name, email, role), charities(name), winners(prize_amount)').eq('profiles.role', 'USER').order('created_at', { ascending: false })
  ]);
  
  // Fail-safe JS filter
  const filteredWinners = (winners || []).filter((w) => ((w as unknown as JoinedWithProfile).profiles)?.role === 'USER');
  const filteredClaims = (claims || []).filter((c) => ((c as unknown as JoinedWithProfile).profiles)?.role === 'USER');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="mb-0">
        <h1 className="display-lg text-[#0a1628] mb-2">Redistribution <span className="serif-i text-[#c81e51] italic">Hub</span></h1>
        <p className="text-[13px] text-[#94a3b8] font-medium uppercase tracking-[0.2em] font-black">Governance & Settlement Pipeline</p>
      </div>
      
      <WinnersTab 
        winners={filteredWinners} 
        kycRecords={kycRecords || []} 
        claims={filteredClaims} 
      />
    </div>
  );
}
