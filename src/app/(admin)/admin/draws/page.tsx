import { requireAuth } from "@/lib/supabase/server-utils";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DrawsTab } from "@/components/admin/dashboard/AdminDashboardCSR";

export const dynamic = 'force-dynamic'

export default async function DrawsPage() {
  await requireAuth("ADMIN");
  
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: draws } = await adminDb.from('draws').select('*').order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="display-lg text-[#0a1628] mb-2">Algorithm <span className="serif-i text-[#c81e51] italic">Engine</span></h1>
        <p className="text-[13px] text-[#94a3b8] font-medium">Simulation controls and historic broadcast verifications.</p>
      </div>
      <DrawsTab draws={draws || []} />
    </div>
  );
}
