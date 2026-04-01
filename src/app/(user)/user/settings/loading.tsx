import React from "react";
import { SettingsSkeleton } from "@/components/user/dashboard/DashboardSkeletons";

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-10 space-y-3">
        <div className="h-10 w-64 bg-[#eceae7]/40 rounded-xl" />
        <div className="h-4 w-96 bg-[#eceae7]/20 rounded-lg" />
      </div>
      <SettingsSkeleton />
    </div>
  );
}
