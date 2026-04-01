import { requireAuth } from "@/lib/supabase/server-utils";
import { Suspense } from "react";
import { VerificationCSR } from "@/components/user/portfolio/VerificationCSR";
import { TableSkeleton } from "@/components/user/dashboard/DashboardSkeletons";

export default async function VerificationPage() {
  await requireAuth("USER");

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
       <Suspense fallback={<TableSkeleton />}>
          <VerificationCSR />
       </Suspense>
    </div>
  );
}
