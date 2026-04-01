'use client'

import React from 'react'
import { ShieldCheck, User, Camera, Calendar, CheckCircle2 } from 'lucide-react'
import { useApi } from '@/lib/api-client'
import { TableSkeleton } from '@/components/user/dashboard/DashboardSkeletons'

interface VerificationData {
  profile?: {
    full_name?: string;
  };
}

export function VerificationCSR() {
  const { data, loading, error } = useApi<VerificationData>('/user/dashboard')

  if (loading) return <TableSkeleton />

  if (error) return <p className="p-12 text-center text-red-500 font-bold">Failed to synchronize verification protocol.</p>

  const profile = data?.profile

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 pt-4">
      {/* Header Info */}
      <div className="flex justify-between items-start">
         <div className="space-y-4 max-w-2xl">
            <h1 className="display-xl text-[#0a1628]">
               Identity <span className="serif-i text-[#c81e51] italic">Verification</span>
            </h1>
            <p className="text-[13px] font-medium text-[#94a3b8] leading-relaxed">
               Secure verification to ensure the integrity of your philanthropic claim.
            </p>
         </div>
         <div className="flex items-center gap-3 bg-[#f4f3f1] px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-[#0a1628]">
            <ShieldCheck size={18} className="text-[#2dd4bf]" />
            SECURE PROTOCOL ACTIVE
         </div>
      </div>

      {/* Stepper Logic */}
      <div className="grid grid-cols-4 gap-4">
         <StepNode step="01" label="Confirm" active completed />
         <StepNode step="02" label="Verify" active />
         <StepNode step="03" label="Settle" disabled />
         <StepNode step="04" label="Report" disabled />
      </div>

      <div className="grid lg:grid-cols-3 gap-12 pt-4">
         <div className="lg:col-span-2 space-y-12">
            <section className="space-y-8">
               <SectionHeader index="PERSONAL" title="Identity Records" />
               <div className="grid md:grid-cols-2 gap-8">
                  <Field label="FULL LEGAL NAME">
                     <input className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1]" placeholder="As it appears on your passport..." defaultValue={profile?.full_name} />
                  </Field>
                  <Field label="DATE OF BIRTH">
                     <div className="relative">
                       <input className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1]" type="text" placeholder="mm / dd / yyyy" />
                       <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                     </div>
                  </Field>
                  <Field label="TAX ID / SSN">
                     <input className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1]" placeholder="•••• ••• ••••" />
                  </Field>
                  <Field label="PHONE NUMBER">
                     <input className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1]" placeholder="+1 (555) 000-0000" />
                  </Field>
               </div>
            </section>

            <section className="space-y-8">
               <SectionHeader index="UPLOAD" title="Foundational ID" />
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="card-lumina p-8 bg-[#f4f3f1]/30 border-2 border-dashed border-[#eceae7] rounded-[2rem] flex flex-col items-center gap-4 text-center group cursor-pointer hover:bg-white hover:border-[#c81e51]/20 transition-all">
                     <div className="w-12 h-12 rounded-xl bg-[#0a1628] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                        <Camera size={20} />
                     </div>
                     <div>
                        <p className="text-[12px] font-black text-[#0a1628] mb-0.5 uppercase tracking-wider">Front of ID</p>
                        <p className="text-[9px] font-medium text-[#94a3b8] uppercase tracking-widest">JPEG/PDF UP TO 5MB</p>
                     </div>
                  </div>

                  <div className="card-lumina p-8 bg-[#f4f3f1]/30 border-2 border-dashed border-[#eceae7] rounded-[2rem] flex flex-col items-center gap-4 text-center group cursor-pointer hover:bg-white hover:border-[#c81e51]/20 transition-all">
                     <div className="w-12 h-12 rounded-xl bg-[#0a1628] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                        <Camera size={20} />
                     </div>
                     <div>
                        <p className="text-[12px] font-black text-[#0a1628] mb-0.5 uppercase tracking-wider">Back of ID</p>
                        <p className="text-[9px] font-medium text-[#94a3b8] uppercase tracking-widest">CLEAR TEXT REQUIRED</p>
                     </div>
                  </div>
               </div>
               
               <div className="flex gap-4 pt-4">
                  <button className="flex-2 btn-primary py-4 text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all">
                     Submit for Audit →
                  </button>
                  <button className="flex-1 py-4 rounded-xl border border-[#f4f3f1] text-[9px] font-black uppercase tracking-widest text-[#94a3b8] hover:bg-[#fafafc] transition-all">
                     Save
                  </button>
               </div>
            </section>
         </div>

         <div className="space-y-12">
            <div className="card-lumina p-10 bg-white border border-[#f4f3f1] rounded-[3rem] space-y-8 text-center relative group shadow-xl shadow-black/[0.02]">
               <div className="w-24 h-24 rounded-full border-4 border-[#fafafa] bg-[#f4f3f1] mx-auto flex items-center justify-center relative overflow-hidden group-hover:bg-[#0a1628] group-hover:text-white transition-all">
                  <User size={48} className="opacity-20 group-hover:opacity-10 transition-opacity" />
                  <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-[#2dd4bf] flex items-center justify-center text-white border-4 border-white animate-pulse">
                     <CheckCircle2 size={10} />
                  </div>
               </div>
               <div className="space-y-3">
                  <h4 className="text-lg font-bold text-[#0a1628]">Biometric Scan</h4>
                  <p className="text-[11px] font-medium text-[#94a3b8] leading-relaxed">
                     Liveness detection requested after document submission.
                  </p>
               </div>
               <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#f4f3f1] rounded-full mx-auto group-hover:bg-[#0a1628] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-ping" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#0a1628] group-hover:text-white">Processor Sync</span>
               </div>
            </div>

            <div className="card-lumina p-8 bg-white border border-[#f4f3f1] rounded-[2.5rem] space-y-6">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c81e51]">Verification Checklist</h3>
               <div className="space-y-5">
                  <ChecklistRow label="Valid Passport / ID" checked />
                  <ChecklistRow label="Sharp metadata clarity" checked />
                  <ChecklistRow label="Identity name alignment" />
                  <ChecklistRow label="Residency matching claim" />
               </div>
            </div>

            <div className="card-lumina p-8 bg-[#003731] text-white rounded-[2.5rem] space-y-6 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform shadow-xl shadow-[#003731]/20">
               <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 skew-y-12 translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2dd4bf]">ETHICAL CLAIMS</p>
               <h3 className="text-xl font-bold leading-tight serif-i">100% Impact Yield</h3>
               <p className="text-[10px] font-medium text-white/50 leading-relaxed">
                  Direct yields to chosen recipients with zero intermediary loss.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}

function SectionHeader({ index, title }: { index: string; title: string }) {
   return (
      <div className="flex justify-between items-end border-b border-[#f4f3f1] pb-4">
         <h2 className="text-lg lg:text-xl font-black text-[#0a1628] uppercase tracking-wide">{title}</h2>
         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#94a3b8]">{index}</span>
      </div>
   )
}

interface StepNodeProps {
  step: string;
  label: string;
  active?: boolean;
  completed?: boolean;
  disabled?: boolean;
}

function StepNode({ step, label, active, completed }: StepNodeProps) {
   return (
      <div className={`p-6 rounded-2xl border-t-8 transition-all duration-700 ${
         active ? 'bg-white shadow-xl shadow-black/[0.03] border-[#c81e51]' : 'bg-[#f4f3f1]/40 border-transparent opacity-40'
      }`}>
         <div className="flex items-center gap-3 mb-1.5 leading-none">
            <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${active ? 'text-[#c81e51]' : 'text-[#94a3b8]'}`}>{step}</p>
            {completed && <CheckCircle2 size={12} className="text-[#2dd4bf]" />}
         </div>
         <p className={`text-base font-black text-[#0a1628] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</p>
      </div>
   )
}

interface ChecklistRowProps {
  label: string;
  checked?: boolean;
}

function ChecklistRow({ label, checked }: ChecklistRowProps) {
  return (
    <div className="flex items-start gap-4 transition-all">
       <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          checked ? 'bg-[#2dd4bf] border-[#2dd4bf] text-white shadow-lg shadow-[#2dd4bf]/20' : 'border-[#eceae7] bg-white'
       }`}>
          {checked && <CheckCircle2 size={10} />}
       </div>
       <p className={`text-[12px] font-medium leading-tight ${checked ? 'text-[#0a1628]' : 'text-[#94a3b8]'}`}>{label}</p>
    </div>
  )
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">{label}</label>
      {children}
    </div>
  )
}
