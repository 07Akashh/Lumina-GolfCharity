import { requireAuth } from "@/lib/supabase/server-utils";
import { getCharities } from "@/modules/charity/actions";
import { CharityTab } from "@/components/admin/dashboard/AdminDashboardCSR";

export const dynamic = 'force-dynamic'

export default async function CharitiesPage() {
  await requireAuth("ADMIN");
  const charities = await getCharities();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="display-lg text-[#0a1628] mb-2">Foundation <span className="serif-i text-[#c81e51] italic">Network</span></h1>
        <p className="text-[13px] text-[#94a3b8] font-medium">Philanthropic partner nodes and synchronization details.</p>
      </div>
      <CharityTab charities={charities || []} />
    </div>
  );
}
