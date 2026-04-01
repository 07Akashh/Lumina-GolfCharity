import React from "react";
import {
  StatsSkeleton,
  ChartSkeleton,
  ImpactGridSkeleton,
} from "@/components/user/dashboard/DashboardSkeletons";

export default function MetricsLoading() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="mb-10 space-y-3">
        <div className="h-10 w-64 bg-[#eceae7]/40 rounded-xl" />
        <div className="h-4 w-96 bg-[#eceae7]/20 rounded-lg" />
      </div>

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
  );
}
