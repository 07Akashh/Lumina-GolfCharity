import { requireAuth } from "@/lib/supabase/server-utils";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'
import { PortfolioCSR } from "@/components/user/portfolio/PortfolioCSR";
import { TableSkeleton, StatsSkeleton, RightPanelSkeleton } from "@/components/user/dashboard/DashboardSkeletons";

export default async function PortfolioPage() {
  await requireAuth("USER");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* <div>
        <h1 className="display-md text-[#0a1628] mb-1">Giving Portfolio</h1>
        <p className="text-sm text-[#8a8f9e]">Your complete score ledger, prize history, and subscription overview.</p>
      </div> */}

      <Suspense fallback={
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TableSkeleton />
            <TableSkeleton />
          </div>
          <div className="space-y-6">
            <StatsSkeleton />
            <RightPanelSkeleton />
          </div>
        </div>
      }>
        <PortfolioCSR />
      </Suspense>
    </div>
  );
}
