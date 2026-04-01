import React from "react";
import {
  AdminStatsSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/dashboard/AdminSkeletons";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-12 space-y-3">
        <div className="h-12 w-80 bg-white/10 rounded-2xl" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      <AdminStatsSkeleton />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AdminTableSkeleton />
          <AdminTableSkeleton />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-96 bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
