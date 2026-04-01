import { requireAuth } from "@/lib/supabase/server-utils";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { UsersTab } from "@/components/admin/dashboard/AdminDashboardCSR";

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  await requireAuth("ADMIN");
  
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: authData },
    { data: profiles }, 
    { data: subscriptions }
  ] = await Promise.all([
    adminDb.auth.admin.listUsers(),
    adminDb.from('profiles').select('*, scores(value, created_at)'),
    adminDb.from('subscriptions').select('*').order('created_at', { ascending: false })
  ]);

  // Merge strategy ensuring explicit DB mocks and true auth nodes physically coexist.
  const authUsers = authData?.users || [];
  const integratedProfiles = [...(profiles || [])];
  
  authUsers.forEach(u => {
    if (!integratedProfiles.find(p => p.id === u.id)) {
      integratedProfiles.push({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Anonymous Ghost',
        role: 'USER',
        scores: [],
        created_at: u.created_at
      });
    }
  });

  const sortedProfiles = integratedProfiles.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="display-lg text-[#0a1628] mb-2">Member <span className="serif-i text-[#c81e51] italic">Directory</span></h1>
        <p className="text-[13px] text-[#94a3b8] font-medium">Global governance of all registered platform nodes.</p>
      </div>
      <UsersTab profiles={sortedProfiles} subscriptions={subscriptions || []} />
    </div>
  );
}
