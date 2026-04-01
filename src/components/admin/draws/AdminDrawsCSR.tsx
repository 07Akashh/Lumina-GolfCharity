"use client";

import React from "react";
import { RefreshCw, LayoutList, CheckCircle } from "lucide-react";
import { useApi } from "@/lib/api-client";
import { AdminTableSkeleton } from "../dashboard/AdminSkeletons";
import { formatCurrency } from "@/lib/utils";

export function AdminDrawsCSR() {
  const { data, loading, error } = useApi<any>("/admin/dashboard");

  const refreshData = () => window.location.reload();

  if (loading) {
    return (
      <div className="space-y-8">
        <AdminTableSkeleton />
        <AdminTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-lumina p-12 text-center space-y-4 bg-red-500/10 border-red-500/20">
        <p className="text-red-400 font-bold">
          Failed to synchronize stochastic ledger.
        </p>
        <button onClick={refreshData} className="btn-primary px-6 py-2">
          Retry Syncing Node
        </button>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end -mb-4">
        <button
          onClick={refreshData}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#c81e51] transition-colors group"
        >
          <RefreshCw
            size={12}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
          Synchronize Ledger
        </button>
      </div>

      <div className="card-lumina p-8 space-y-8 bg-[#0d1c31] border-white/5">
        <div className="flex items-center gap-3 text-white/80">
          <LayoutList size={20} className="text-[#c81e51]" />
          <h2 className="font-bold">Execution History</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 pb-4 border-b border-white/5">
            <span>Date</span>
            <span>Type</span>
            <span>Pool Total</span>
            <span>Numbers</span>
            <span>Winners</span>
            <span className="text-right">Status</span>
          </div>

          {stats.draws?.map((d: any) => (
            <div
              key={d.id}
              className="grid grid-cols-6 items-center py-5 border-b border-white/5 last:border-0 text-white/60 hover:text-white transition-colors"
            >
              <span className="text-[11px] font-bold">
                {String(d.created_at).split('T')[0]}
              </span>
              <span className="text-[11px] font-medium tracking-wider">
                {d.type}
              </span>
              <span className="text-[12px] font-black text-white">
                {formatCurrency(d.prize_pool_total)}
              </span>
              <div className="flex gap-1.5">
                {(d.numbers as number[])?.map((n: number, i: number) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black shadow-inner"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <span className="text-[11px] font-bold opacity-40">—</span>
              <div className="flex justify-end">
                {d.status === "published" ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#15803d]/10 border border-[#15803d]/20 text-[#15803d]">
                    <CheckCircle size={10} />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      LIVE
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 text-white/30">
                    STAGED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
