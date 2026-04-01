import { requireAuth } from "@/lib/supabase/server-utils";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'
import { SettingsCSR } from "@/components/user/setting/SettingsCSR";
import { SettingsSkeleton } from "@/components/user/dashboard/DashboardSkeletons";

export default async function SettingsPage() {
  await requireAuth("USER");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* <div className="mb-10 space-y-3">
        <h1 className="display-lg text-[#0a1628] mb-1">Account Governance</h1>
        <p className="text-sm text-[#8a8f9e]">Manage your global credentials, communication nodes, and security protocols.</p>
      </div> */}

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsCSR />
      </Suspense>
    </div>
  );
}
