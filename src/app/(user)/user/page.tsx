import { requireAuth } from "@/lib/supabase/server-utils";
import { Suspense } from "react";
import { 
  StatsSkeleton, 
  ChartSkeleton, 
  ImpactGridSkeleton, 
  RightPanelSkeleton 
} from "@/components/user/dashboard/DashboardSkeletons";
import { UserDashboardCSR } from "@/components/user/dashboard/UserDashboardCSR";

export default async function UserDashboardPage() {
  await requireAuth("USER");

  return (
    <div className="max-w-full">
      {/* <div className="mb-10">
        <h1 className="display-lg text-[#0a1628] mb-1">Portfolio Console</h1>
        <p className="text-sm text-[#8a8f9e]">
          Welcome back. Monitoring philanthropic performance and impact nodes.
        </p>
      </div> */}

      <Suspense fallback={
        <div className="space-y-8 animate-in fade-in duration-500">
          <StatsSkeleton />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ChartSkeleton />
              <div className="card-lumina p-8 h-64 bg-[#eceae7]/20 rounded-3xl" />
              <ImpactGridSkeleton />
            </div>
            <div className="space-y-6">
              <RightPanelSkeleton />
            </div>
          </div>
        </div>
      }>
        <UserDashboardCSR />
      </Suspense>
    </div>
  );
}
