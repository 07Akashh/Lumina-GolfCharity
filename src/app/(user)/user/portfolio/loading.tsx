import React from "react";
import {
  StatsSkeleton,
  TableSkeleton,
  RightPanelSkeleton,
} from "@/components/user/dashboard/DashboardSkeletons";

export default function PortfolioLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-10 space-y-3">
        <div className="h-10 w-64 bg-[#eceae7]/40 rounded-xl" />
        <div className="h-4 w-96 bg-[#eceae7]/20 rounded-lg" />
      </div>

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
    </div>
  );
}
