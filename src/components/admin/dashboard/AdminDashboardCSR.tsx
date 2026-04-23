'use client'

import React from 'react'
import { 
  Users, 
  CheckCircle2, 
  DollarSign, 
  Heart, 
  Search, 
  Fingerprint,
  ClipboardList,
  Trophy,
  ExternalLink,
  X,
  FileText
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LoadingButton } from '@/components/common/LoadingButton'
import { createCharity, deleteCharity } from '@/modules/charity/actions'
import { simulateDraw, publishDraw } from '@/modules/draws/actions'
import { updateUserRole } from '@/modules/admin/actions'
import { verifyKYC, processClaim } from '@/app/actions/admin'
import { Draw, Charity, Subscription, Profile, KYCRecord, Claim, Winner } from '@/types'
import { useRouter } from 'next/navigation'

// --- Shared Components ---

function StatCard({ label, value, icon, bg, badge }: {
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  bg: string; 
  badge?: string;
}) {
  return (
    <div className="rounded-[2rem] p-7 space-y-6 bg-white border border-[#eceae7] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl ${bg} border border-[#f4f3f1] flex items-center justify-center`}>
           {icon}
        </div>
        {badge && (
          <span className="text-[9px] font-black text-[#15803d] bg-[#dcfce7] px-3 py-1.5 rounded-full lowercase tracking-widest shadow-sm border border-[#15803d]/10">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-[#94a3b8]">{label}</p>
        <p className="text-3xl font-black text-[#0a1628]">{value}</p>
      </div>
    </div>
  )
}


export function DrawControlCard({ stagedDraw }: { stagedDraw?: Draw }) {
  const router = useRouter()
  const [isSimulating, setIsSimulating] = React.useState(false)
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [engineMode, setEngineMode] = React.useState('algorithmic')

  const handleSimulate = async () => {
    setIsSimulating(true)
    const result = await simulateDraw(engineMode as 'algorithmic' | 'random')
    setIsSimulating(false)
    if (result && 'error' in result) {
       alert(result.error)
    } else {
       router.refresh()
    }
  }

  const handlePublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPublishing(true)
    const fd = new FormData(e.currentTarget)
    const drawId = fd.get('drawId') as string
    if (drawId) await publishDraw(drawId)
    setIsPublishing(false)
    router.refresh()
  }

  return (
    <div className="card-lumina p-8 space-y-6 shadow-2xl bg-white border border-[#f4f3f1] rounded-[2.5rem]">
      <div className="flex justify-between items-start">
         <h2 className="font-bold text-lg text-[#0a1628]">Execution Controls</h2>
         {stagedDraw && (
           <span className="text-[8px] font-black bg-[#fee2e2] text-[#c81e51] px-3 py-1 rounded-full tracking-widest animate-pulse">STAGED</span>
         )}
      </div>
      <p className="text-[13px] leading-relaxed font-medium text-[#8a8f9e]">
        Trigger the stochastic sweep. Simulations log without public payloads. Active Broadcasts are strictly immutable.
      </p>
      
      {stagedDraw ? (
        <div className="rounded-[1.5rem] p-6 space-y-4 border bg-[#fafafc] border-[#f4f3f1]">
           <div className="flex justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Simulated Pool Breakdown</p>
              <p className="text-[10px] font-black text-[#c81e51]">{stagedDraw.type.toUpperCase()} ENGINE</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[18px] font-black text-[#0a1628] leading-tight serif-i">{formatCurrency(stagedDraw.prize_pool_total)}</p>
                <p className="text-[9px] font-bold text-[#94a3b8] uppercase">Total Pool</p>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-black text-[#15803d] leading-tight serif-i">{formatCurrency(stagedDraw.tier_5_pool)}</p>
                <p className="text-[9px] font-bold text-[#94a3b8] uppercase">Jackpot Allocation</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] p-6 space-y-2 border bg-[#fafafc] border-[#f4f3f1]">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Execution Engine Status</p>
          <p className="text-2xl font-black text-[#0a1628]">Awaiting Trigger</p>
          <p className="text-[11px] font-black text-[#c81e51] tracking-widest uppercase">System Ready</p>
        </div>
      )}

      <div className="space-y-3 pt-2">
        {!stagedDraw ? (
           <div className="space-y-4">
              <div className="flex flex-col gap-2 pb-2">
                 <label className="text-[10px] font-black tracking-widest uppercase text-[#94a3b8] px-1">Engine Algorithm</label>
                 <select 
                   value={engineMode} 
                   onChange={(e) => setEngineMode(e.target.value)} 
                   className="w-full bg-[#f4f3f1] border-none outline-none focus:ring-2 focus:ring-[#c81e51]/20 rounded-xl px-4 py-3 text-[11px] uppercase tracking-wider font-extrabold text-[#0a1628] cursor-pointer"
                 >
                   <option value="algorithmic">Algorithmic Match</option>
                   <option value="random">True Random (RNG)</option>
                 </select>
              </div>
              <LoadingButton 
                 onClick={handleSimulate} 
                 loading={isSimulating}
                 variant="outline"
                 className="w-full py-4 text-[11px] font-black uppercase tracking-widest"
              >
                 ▷ Run Simulation Sync
              </LoadingButton>
           </div>
        ) : (
           <form onSubmit={handlePublish}>
              <input type="hidden" name="drawId" value={stagedDraw.id} />
              <LoadingButton 
                type="submit" 
                loading={isPublishing}
                className="w-full py-4 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#c81e51]/30"
              >
                ⚡ Broadcast Latest Epoch
              </LoadingButton>
           </form>
        )}
      </div>
    </div>
  )
}

// --- Main Overview Hub ---

export function OverviewTab({ stats, totalRevenue, estimatedDistributed, charities }: {
  stats: {
    totalSubs: number;
    activeSubs: number;
    draws?: Draw[];
  };
  totalRevenue: number;
  estimatedDistributed: number;
  charities: Charity[];
}) {
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const formatDate = (dateStr: string) => {
    if (!isClient) return '...'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard label="Total Subscribers" value={(stats.totalSubs || 0).toLocaleString()} icon={<Users size={20} className="text-[#3b82f6]" />} bg="bg-[#eff6ff]" />
        <StatCard label="Active Members" value={(stats.activeSubs || 0).toLocaleString()} icon={<CheckCircle2 size={20} className="text-[#15803d]" />} bg="bg-[#dcfce7]" />
        <StatCard label="Monthly Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign size={20} className="text-[#c81e51]" />} bg="bg-[#fee2e2]" />
        <StatCard label="Impact Distributed" value={formatCurrency(estimatedDistributed)} icon={<Heart size={20} className="text-[#003731]" />} bg="bg-[#ccfbf1]" badge="15% Yield" />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="card-lumina p-10 space-y-8 bg-white border border-[#f4f3f1] rounded-[3rem] ">
            <h2 className="font-bold text-[#0a1628] text-xl">Recent Execution History</h2>
            <div className="space-y-6">
              {stats.draws?.slice(0, 5).map((d: Draw) => (
                <div key={d.id} className="flex items-center justify-between py-6 border-b border-[#f4f3f1] last:border-0 hover:bg-[#fafafc] transition-colors rounded-2xl px-4 -mx-4 group">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">{formatDate(d.created_at)}</span>
                  <span className="text-[13px] font-black text-[#0a1628]">{formatCurrency(d.prize_pool_total)}</span>
                  <div className="flex gap-2">
                    {d.numbers?.slice(0, 5).map((n: number, i: number) => (
                      <span key={i} className="w-8 h-8 rounded-full bg-[#f4f3f1] flex items-center justify-center text-[10px] font-black">{n}</span>
                    ))}
                  </div>
                  <span className={`text-[9px] font-black px-4 py-1.5 rounded-full ${d.status === 'published' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#c81e51]'}`}>
                    {d.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-10">
           <DrawControlCard stagedDraw={stats.draws?.find((d: Draw) => d.status === 'simulated')} />
           <div className="p-8 bg-[#0a1628] rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
              <Heart size={80} className="absolute -bottom-6 -right-6 opacity-5" />
              <h3 className="text-xl font-bold italic serif-i">Legacy Nodes</h3>
              <div className="space-y-4">
                 {charities.slice(0, 3).map((c: Charity) => (
                    <div key={c.id} className="flex justify-between items-center text-[11px] font-medium border-b border-white/5 pb-3 last:border-0">
                       <span className="opacity-60">{c.name}</span>
                       <span className="text-[#c81e51] font-black">ACTIVE</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

// --- Redistribution Hub ---

export function WinnersTab({ winners, kycRecords = [], claims = [] }: {
  winners: (Winner & { profiles: Profile; draws: Draw })[];
  kycRecords: (KYCRecord & { profiles: Profile })[];
  claims: (Claim & { profiles: Profile; charities: Charity })[];
}) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'kyc' | 'claims' | 'nodes'>('kyc')
  const [selectedKYC, setSelectedKYC] = React.useState<(KYCRecord & { profiles: Profile }) | null>(null)

  const handleVerifyKYC = async (userId: string, status: 'verified' | 'rejected') => {
    setLoadingAction(userId)
    try {
      const result = await verifyKYC(userId, status)
      if (result.success) {
        router.refresh()
      } else {
        alert("Authorization protocol failed. Check administrative logs.")
      }
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoadingAction(null)
      setSelectedKYC(null)
    }
  }

  const handleProcessClaim = async (claimId: string, status: 'approved' | 'paid') => {
    setLoadingAction(claimId)
    try {
      const result = await processClaim(claimId, status)
      if (result.success) {
        router.refresh()
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex gap-4 p-2 bg-[#f4f3f1] rounded-[2rem] w-fit shadow-inner">
         <button onClick={() => setActiveTab('kyc')} className={`px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'kyc' ? 'bg-[#0a1628] text-white shadow-xl' : 'text-[#94a3b8] hover:text-[#0a1628]'}`}>
            Identity (KYC)
         </button>
         <button onClick={() => setActiveTab('claims')} className={`px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'claims' ? 'bg-[#0a1628] text-white shadow-xl' : 'text-[#94a3b8] hover:text-[#0a1628]'}`}>
            Independent Claims
         </button>
         <button onClick={() => setActiveTab('nodes')} className={`px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'nodes' ? 'bg-[#0a1628] text-white shadow-xl' : 'text-[#94a3b8] hover:text-[#0a1628]'}`}>
            Winner Nodes
         </button>
      </div>

      <div className="card-lumina p-12 bg-white border border-[#f4f3f1] shadow-2xl rounded-[3.5rem] space-y-10 min-h-[500px]">
        {activeTab === 'kyc' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0a1628]">KYC Authorization Ledger</h3>
                <div className="flex gap-4">
                   <span className="text-[10px] font-black text-[#94a3b8] border-r pr-4">{kycRecords.length} Total</span>
                   <span className="text-[10px] font-black text-[#15803d]">{kycRecords.filter((k: KYCRecord)=>k.status==='verified').length} Verified</span>
                </div>
             </div>
             <div className="grid gap-4">
                {kycRecords.length === 0 ? <EmptyNode label="No KYC records found." /> : kycRecords.map((k: (KYCRecord & { profiles: Profile })) => (
                    <div key={k.id} onClick={() => setSelectedKYC(k)} className="p-8 bg-[#fafafc] rounded-[2.5rem] border border-[#f4f3f1] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                       <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${k.status === 'verified' ? 'bg-[#15803d]' : k.status === 'rejected' ? 'bg-[#c81e51]' : 'bg-[#0a1628]'}`}>
                             <Fingerprint size={24} />
                          </div>
                          <div>
                             <p className="font-black text-[#0a1628]">{k.profiles?.full_name}</p>
                             <p className="text-[11px] font-bold text-[#94a3b8]">{k.profiles?.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${k.status === 'verified' ? 'bg-[#dcfce7] text-[#15803d]' : k.status === 'rejected' ? 'bg-[#fee2e2] text-[#c81e51]' : 'bg-[#f4f3f1] text-[#94a3b8]'}`}>
                            {k.status}
                          </span>
                          <Search size={16} className="text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0a1628]">Disbursement Verification Hub</h3>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#c81e51]">{claims.length} Transactions</p>
             </div>
             <div className="grid gap-6">
                {claims.length === 0 ? <EmptyNode label="No claim transactions found." /> : claims.map((c: (Claim & { profiles: Profile; charities: Charity })) => (
                    <div key={c.id} className="p-10 bg-[#fafafc] rounded-[3rem] border border-[#f4f3f1] space-y-8">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 bg-white border border-[#eceae7] rounded-3xl flex items-center justify-center text-[#c81e51]">
                                <DollarSign size={28} />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-[#0a1628]">{formatCurrency(c.amount)}</h4>
                                <p className="text-[11px] font-bold text-[#94a3b8] uppercase">{c.profiles?.full_name}</p>
                             </div>
                          </div>
                          <div className="bg-white px-5 py-2.5 rounded-2xl border border-[#eceae7] flex items-center gap-3">
                             <Heart size={14} className="text-[#c81e51]" />
                             <span className="text-[10px] font-black uppercase text-[#0a1628]">{c.charities?.name}</span>
                          </div>
                       </div>
                       
                       <div className="grid md:grid-cols-3 gap-6 p-6 bg-white border border-[#f4f3f1] rounded-2xl">
                           <div>
                              <p className="text-[9px] font-black text-[#94a3b8] uppercase mb-1">Bank</p>
                              <p className="text-[12px] font-bold text-[#0a1628]">{c.account_details?.bank_name}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-[#94a3b8] uppercase mb-1">Account</p>
                              <p className="text-[12px] font-bold text-[#0a1628]">{c.account_details?.account_number}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-[#94a3b8] uppercase mb-1">Routing</p>
                              <p className="text-[12px] font-bold text-[#0a1628]">{c.account_details?.routing_number}</p>
                           </div>
                       </div>

                       <div className="flex justify-end gap-4">
                          {c.status === 'pending' && (
                             <LoadingButton onClick={() => handleProcessClaim(c.id, 'approved')} loading={loadingAction === c.id} className="px-10 py-5 bg-[#0a1628] text-white rounded-2xl text-[10px] font-black">Authorize Settlement</LoadingButton>
                          )}
                          {c.status === 'approved' && (
                             <LoadingButton onClick={() => handleProcessClaim(c.id, 'paid')} loading={loadingAction === c.id} className="px-10 py-5 bg-[#15803d] text-white rounded-2xl text-[10px] font-black">Finalize Payout</LoadingButton>
                          )}
                          {c.status === 'paid' && <span className="bg-[#dcfce7] text-[#15803d] px-8 py-3 rounded-full text-[9px] font-black uppercase">Settled</span>}
                       </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'nodes' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0a1628]">Winning Redistribution Nodes</h3>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">{winners.length} Epoch Winners</p>
             </div>
             <div className="grid gap-4">
                {winners.length === 0 ? (
                  <EmptyNode label="No winning nodes detected in current epoch." />
                ) : (
                  winners.map((w: (Winner & { profiles: Profile; draws: Draw })) => (
                    <div key={w.id} className="p-8 bg-[#fafafc] rounded-[2.5rem] flex items-center justify-between border border-[#f4f3f1]">
                       <div className="flex items-center gap-6">
                          <Trophy size={28} className="text-[#c81e51]" />
                          <div>
                            <p className="font-black text-[#0a1628]">{w.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-[11px] font-bold text-[#94a3b8]">{w.draws?.type?.toUpperCase()} Allocation</p>
                          </div>
                       </div>
                        <p className="text-2xl font-bold text-[#c81e51]">{formatCurrency(w.prize_amount)}</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>

      {/* KYC Details Modal */}
      {selectedKYC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a1628]/40 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[4rem] w-full max-w-4xl p-12 shadow-2xl relative overflow-hidden">
              <button onClick={() => setSelectedKYC(null)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-[#f4f3f1] flex items-center justify-center text-[#94a3b8] hover:text-[#c81e51] transition-colors"><X size={24} /></button>
              
              <header className="mb-10 flex items-center gap-6">
                 <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white ${selectedKYC.status === 'verified' ? 'bg-[#15803d]' : 'bg-[#0a1628]'}`}><Fingerprint size={32} /></div>
                 <div>
                    <h2 className="text-3xl font-black text-[#0a1628]">{selectedKYC.profiles?.full_name}</h2>
                    <p className="text-[13px] font-bold text-[#94a3b8] uppercase tracking-widest">Identity Sync Detail Record</p>
                 </div>
              </header>

              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <DetailItem label="Legal Multi-ledger" value={selectedKYC.full_name} />
                    <DetailItem label="Date of Birth" value={selectedKYC.dob || ''} />
                    <DetailItem label="Identity Node (Gov ID)" value={selectedKYC.id_number || ''} />
                    <DetailItem label="Mobile Terminal" value={selectedKYC.phone || ''} />
                    <DetailItem label="Residential Logic" value={selectedKYC.address || ''} />
                    <div className="pt-6 border-t border-[#f4f3f1]">
                       <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4">Authorization State</p>
                       <span className={`px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-widest ${selectedKYC.status === 'verified' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#c81e51]'}`}>{selectedKYC.status}</span>
                    </div>
                 </div>
                 
                 <div className="space-y-6 bg-[#fafafc] p-8 rounded-[3rem] border border-[#f4f3f1]">
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-[#0a1628] mb-4">Document Vault Proofs</h4>
                    <ProofLink label="Identity Asset (Front)" url={selectedKYC.id_front_url || ''} />
                    <ProofLink label="Fiscal Node (W9)" url={selectedKYC.w9_form_url || ''} />
                    
                    {selectedKYC.status === 'pending' && (
                       <div className="pt-8 flex gap-4">
                          <LoadingButton onClick={() => handleVerifyKYC(selectedKYC.user_id, 'verified')} loading={loadingAction === selectedKYC.user_id} className="flex-1 py-4 bg-[#15803d] rounded-2xl text-[11px] font-black uppercase tracking-widest">Authorize Node</LoadingButton>
                          <LoadingButton onClick={() => handleVerifyKYC(selectedKYC.user_id, 'rejected')} loading={loadingAction === selectedKYC.user_id} variant="danger" className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest">Reject Sync</LoadingButton>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
   return (
      <div className="space-y-1">
         <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">{label}</p>
         <p className="text-xl font-bold text-[#0a1628]">{value || 'N/A'}</p>
      </div>
   )
}


function ProofLink({ label, url }: { label: string; url: string }) {
   return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#f4f3f1] group hover:border-[#c81e51] transition-all">
         <div className="flex items-center gap-3">
            <FileText size={20} className="text-[#94a3b8] group-hover:text-[#c81e51]" />
            <span className="text-[11px] font-black uppercase text-[#0a1628]">{label}</span>
         </div>
         <ExternalLink size={14} className="text-[#94a3b8]" />
      </a>
   )
}

// --- Algorithm & Draws Tab ---

export function DrawsTab({ draws }: { draws: Draw[] }) {
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <div className="card-lumina p-12 bg-white border border-[#f4f3f1] shadow-2xl rounded-[3.5rem] space-y-10">
      <div className="flex justify-between items-center px-2">
         <h2 className="text-2xl font-black text-[#0a1628]">Algorithm <span className="serif-i text-[#c81e51] italic">History</span></h2>
         <p className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">{draws.length} Epochs Logged</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] border-b border-[#f4f3f1]">
              <th className="pb-6">Timestamp</th>
              <th className="pb-6">Tier Engine</th>
              <th className="pb-6">Total Pool</th>
              <th className="pb-6">Broadcast Status</th>
              <th className="pb-6 text-right">Numbers</th>
            </tr>
          </thead>
          <tbody>
            {draws.map((d: Draw) => (
              <tr key={d.id} className="border-b border-[#f4f3f1] font-bold text-[13px] hover:bg-[#fafafc] transition-colors">
                <td className="py-6">{isClient ? new Date(d.created_at).toLocaleString() : '...'}</td>
                <td className="py-6 uppercase tracking-widest text-[#c81e51] opacity-70">{d.type}</td>
                <td className="py-6 font-black">{formatCurrency(d.prize_pool_total)}</td>
                <td className="py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${d.status === 'published' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#c81e51]'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="py-6 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {d.numbers?.map((n: number, i: number) => (
                      <span key={i} className="w-7 h-7 rounded-sm bg-[#f4f3f1] flex items-center justify-center text-[9px] font-black">{n}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Directory Modules ---

export function UsersTab({ profiles, subscriptions }: {
  profiles: Profile[];
  subscriptions: Subscription[];
}) {
  return (
    <div className="card-lumina p-12 bg-white border border-[#f4f3f1] shadow-2xl rounded-[3rem] space-y-10">
      <h2 className="text-2xl font-black text-[#0a1628]">User Directory</h2>
      <div className="overflow-x-auto">
         <table className="w-full text-left">
            <thead>
               <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] border-b border-[#f4f3f1]">
                  <th className="pb-6">Member Node</th>
                  <th className="pb-6">Role Integrity</th>
                  <th className="pb-6">Active Plan</th>
                  <th className="pb-6 text-right">Administrative</th>
               </tr>
            </thead>
            <tbody>
               {profiles.map((p: Profile) => {
                  const sub = subscriptions?.find((s: Subscription) => s.user_id === p.id && s.status === 'active')
                  return (
                    <tr key={p.id} className="border-b border-[#f4f3f1] font-bold text-[13px] hover:bg-[#fafafc] transition-colors">
                       <td className="py-6">
                          <p>{p.full_name || 'Anonymous'}</p>
                          <p className="text-[11px] text-[#94a3b8]">{p.email}</p>
                       </td>
                       <td className="py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest ${p.role === 'ADMIN' ? 'bg-[#c81e51] text-white' : 'bg-[#fafafc] text-[#0a1628] border'}`}>{p.role}</span>
                       </td>
                       <td className="py-6">
                          {sub ? <span className="text-[#15803d]">{sub.plan} Plan</span> : <span className="opacity-20">—</span>}
                       </td>
                       <td className="py-6 text-right">
                          <LoadingButton onClick={() => updateUserRole(p.id, p.role === 'ADMIN' ? 'USER' : 'ADMIN')} className="text-[9px] uppercase font-black bg-white text-[#94a3b8] border px-4 py-2 rounded-xl">Toggle Role</LoadingButton>
                       </td>
                    </tr>
                  )
               })}
            </tbody>
         </table>
      </div>
    </div>
  )
}

export function SubscriptionsTab({ subscriptions, profiles }: {
  subscriptions: Subscription[];
  profiles: Profile[];
}) {
  return (
    <div className="card-lumina p-12 bg-white border border-[#f4f3f1] shadow-2xl rounded-[3rem] space-y-10">
       <h2 className="text-2xl font-black text-[#0a1628]">Subscription Ledgers</h2>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] border-b border-[#f4f3f1]">
                   <th className="pb-6">Subscriber</th>
                   <th className="pb-6">Plan Integrity</th>
                   <th className="pb-6">Status</th>
                   <th className="pb-6 text-right">Administrative</th>
                </tr>
             </thead>
             <tbody>
                {subscriptions.map((s: Subscription) => (
                  <tr key={s.id} className="border-b border-[#f4f3f1] font-black text-[13px] hover:bg-[#fafafc] transition-colors">
                     <td className="py-6">{profiles.find((p: Profile)=>p.id===s.user_id)?.full_name || 'Anonymous'}</td>
                     <td className="py-6 uppercase tracking-widest text-[#c81e51] opacity-70">{s.plan}</td>
                     <td className="py-6"><span className="px-3 py-1 bg-[#dcfce7] text-[#15803d] rounded-full text-[9px]">{s.status.toUpperCase()}</span></td>
                     <td className="py-6 text-right"><span className="text-[10px] opacity-40">LEDGER SYNCED</span></td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  )
}

export function CharityTab({ charities }: { charities: Charity[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleIntegrate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    await createCharity(fd)
    setIsModalOpen(false)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <div className="card-lumina p-12 bg-white border border-[#f4f3f1] shadow-2xl rounded-[3.5rem] space-y-10">
       <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black text-[#0a1628]">Impact Partners</h2>
          <LoadingButton onClick={() => setIsModalOpen(true)} className="px-8 py-4 text-[10px] uppercase font-black tracking-widest shadow-2xl">Integrate Partner</LoadingButton>
       </div>
       <div className="grid md:grid-cols-3 gap-8">
          {charities.map((ch: Charity) => (
             <div key={ch.id} className="p-8 rounded-[2.5rem] border border-[#f4f3f1] bg-[#fafafc] space-y-5 group hover:bg-white transition-all shadow-sm">
                <Heart size={32} className="text-[#c81e51]" />
                <h3 className="font-black text-xl text-[#0a1628] leading-tight">{ch.name}</h3>
                <p className="text-[12px] text-[#94a3b8] font-medium leading-relaxed line-clamp-3">{ch.description}</p>
                <div className="pt-4 border-t border-[#eceae7] flex justify-between items-center">
                   <span className="text-[9px] font-black uppercase text-[#15803d]">ACTIVE NODE</span>
                   <LoadingButton onClick={() => deleteCharity(ch.id)} variant="danger" className="text-[9px] uppercase px-4 py-2">Delink</LoadingButton>
                </div>
             </div>
          ))}
       </div>

       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a1628]/40 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl">
              <h3 className="text-2xl font-black text-[#0a1628] mb-8">Integrate Partner</h3>
              <form onSubmit={handleIntegrate} className="space-y-6">
                 <input name="name" required className="input-lumina" placeholder="Foundation Identity" />
                 <textarea name="description" required className="input-lumina h-32" placeholder="Impact Manifesto" />
                 <LoadingButton loading={isSubmitting} type="submit" className="w-full py-5 text-[12px] font-black uppercase shadow-2xl">Authorize Node</LoadingButton>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-center text-[11px] font-black text-[#94a3b8] uppercase mt-4">Abort</button>
              </form>
           </div>
         </div>
       )}
    </div>
  )
}

function EmptyNode({ label }: { label: string }) {
  return (
    <div className="text-center p-20 bg-[#fafafc] rounded-[3rem] border border-[#f4f3f1] border-dashed">
       <ClipboardList size={48} className="mx-auto mb-4 opacity-10" />
       <p className="text-[13px] font-bold text-[#94a3b8]">{label}</p>
    </div>
  )
}
