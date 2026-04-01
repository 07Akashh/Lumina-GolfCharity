import { requireAuth } from "@/lib/supabase/server-utils";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'
import { MetricsCSR } from "@/components/user/metrics/MetricsCSR";
import { StatsSkeleton, ChartSkeleton, ImpactGridSkeleton } from "@/components/user/dashboard/DashboardSkeletons";

export default async function MetricsPage() {
  await requireAuth("USER");

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* <div className="mb-10 space-y-3">
        <h1 className="display-lg text-[#0a1628] mb-1">Impact Metrics</h1>
        <p className="text-sm text-[#8a8f9e]">Detailed visualization of your philanthropic yields and node contributions.</p>
      </div> */}

      <Suspense fallback={
        <div className="space-y-10">
          <StatsSkeleton />
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <div className="space-y-6">
              <ImpactGridSkeleton />
              <div className="card-lumina h-80 bg-[#eceae7]/20 rounded-3xl" />
            </div>
          </div>
        </div>
      }>
        <MetricsCSR />
      </Suspense>
    </div>
  );
}
