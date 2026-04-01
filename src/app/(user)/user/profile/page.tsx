import { requireAuth } from "@/lib/supabase/server-utils";
import { Suspense } from "react";
import { ProfileCSR } from "@/components/user/profile/ProfileCSR";
import { TableSkeleton } from "@/components/user/dashboard/DashboardSkeletons";

export default async function ProfilePage() {
  await requireAuth("USER");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Suspense fallback={<TableSkeleton />}>
        <ProfileCSR />
      </Suspense>
    </div>
  );
}
