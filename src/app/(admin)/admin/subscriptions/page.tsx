import { requireAuth } from "@/lib/supabase/server-utils";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { SubscriptionsTab } from "@/components/admin/dashboard/AdminDashboardCSR";

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  await requireAuth("ADMIN");
  
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: subscriptions }, { data: profiles }] = await Promise.all([
    adminDb.from('subscriptions').select('*').order('created_at', { ascending: false }),
    adminDb.from('profiles').select('*')
  ]);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="display-lg text-[#0a1628] mb-2">Subscription <span className="serif-i text-[#c81e51] italic">Ledgers</span></h1>
        <p className="text-[13px] text-[#94a3b8] font-medium">Stripe synchronization and active plan integrity.</p>
      </div>
      <SubscriptionsTab subscriptions={subscriptions || []} profiles={profiles || []} />
    </div>
  );
}
