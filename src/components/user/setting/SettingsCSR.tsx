'use client'

import React, { useState, useEffect } from 'react'
import { Save, User, Camera, Bell, Award, Loader2, Lock, Smartphone, Fingerprint, LogOut } from 'lucide-react'
import { useApi } from '@/lib/api-client'
import { SettingsSkeleton } from '@/components/user/dashboard/DashboardSkeletons'
import { updateProfile, logout } from '@/modules/auth/actions'
import Image from 'next/image'

const TABS = [
  { id: 'profile', label: 'Profile Identity', icon: User },
  { id: 'tier', label: 'Membership Tier', icon: Award },
  { id: 'comm', label: 'Communication', icon: Bell },
  { id: 'security', label: 'Security & Privacy', icon: Lock },
]

interface SettingsData {
  profile?: {
    id?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
    role?: string;
    bio?: string;
    phone?: string;
    contribution_percentage?: number;
    comm_alerts?: boolean;
    comm_weekly?: boolean;
    comm_network?: boolean;
  };
  subscription?: {
    plan?: string;
  };
}

export function SettingsCSR() {
  const { data, loading, error } = useApi<SettingsData>('/user/dashboard')
  const [activeTab, setActiveTab] = useState('profile')
  const [updating, setUpdating] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.find(entry => entry.isIntersecting)
        if (intersecting) {
          setActiveTab(intersecting.target.id)
        }
      },
      { threshold: 0, rootMargin: '-100px 0px -60% 0px' }
    )

    TABS.forEach((tab) => {
      const el = document.getElementById(tab.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [loading])

  const scrollToSection = (id: string) => {
    setActiveTab(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) return <SettingsSkeleton />
  if (error) return <p className="p-8 text-center text-red-500 font-bold">Failed to synchronize governance node.</p>

  const profile = data?.profile
  const plan = data?.subscription?.plan || 'free'

  const handleUpdate = async (formDataPayload: FormData) => {
    setUpdating(true)
    setMsg(null)
    
    try {
      const res = await updateProfile(formDataPayload)
      if (res?.error) {
        setMsg({ type: 'error', text: res.error })
      } else {
        setMsg({ type: 'success', text: 'Identity ledger updated successfully.' })
        setTimeout(() => setMsg(null), 3000)
      }
    } catch {
      setMsg({ type: 'error', text: 'Critical connection failure.' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="space-y-3 max-w-2xl border-b border-[#f4f3f1] pb-8">
         <h1 className="display-xl text-[#0a1628]">
            System <span className="serif-i text-[#c81e51] italic">Settings</span>
         </h1>
         <p className="text-[13px] font-medium text-[#94a3b8] leading-relaxed">
            Refine your digital legacy experience. Manage your philanthropic identity and security protocols.
         </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-12 relative pt-4">
         {/* Navigation Tabs (ScrollSpy) */}
         <div className="hidden lg:block">
           <nav className="space-y-1.5 sticky top-8 z-10">
              {TABS.map(tab => {
                 const active = activeTab === tab.id
                 return (
                    <button 
                      key={tab.id}
                      type="button"
                      onClick={() => scrollToSection(tab.id)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                         active ? 'bg-[#f4f3f1] text-[#0a1628]' : 'text-[#94a3b8] hover:bg-[#fafafc] hover:text-[#0a1628]'
                      }`}
                    >
                       <span>{tab.label}</span>
                       {active && <div className="w-1 h-1 rounded-full bg-[#c81e51]" />}
                    </button>
                 )
              })}
              
              <div className="pt-4 mt-4 border-t border-[#f4f3f1]">
                <button 
                  type="button"
                  onClick={() => logout()} 
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group text-red-500 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
           </nav>
         </div>

         {/* Content Area */}
         <div className="lg:col-span-3 space-y-24 pb-40">
            {/* USE KEY PATTERN TO INITIALIZE FORM WITHOUT EFFECTS */}
            <ProfileIdentityForm 
              key={profile?.id || 'empty'}
              profile={profile} 
              updating={updating}
              msg={msg}
              onUpdate={handleUpdate}
            />

            {/* Section 02: Membership Tier */}
            <section id="tier" className="space-y-10 scroll-mt-20">
               <SectionHeader index="02" title="Membership Tier" />
               <div className="grid md:grid-cols-3 gap-5">
                  <TierCard label="Ethereal" price="$99" desc="Elite draw access and community insights." active={plan === 'ethereal'} />
                  <TierCard label="Apex" price="$499" desc="Dedicated high-volume node architecture." active={plan === 'apex'} />
                  <TierCard label="Luminary" price="$1999" desc="Enterprise-grade philanthropic advisory." active={plan === 'luminary'} />
               </div>
            </section>
         </div>
      </div>
    </div>
  )
}

function ProfileIdentityForm({ profile, updating, msg, onUpdate }: {
  profile: SettingsData['profile'];
  updating: boolean;
  msg: { type: 'success' | 'error', text: string } | null;
  onUpdate: (fd: FormData) => void;
}) {
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    commAlerts: profile?.comm_alerts ?? true,
    commWeekly: profile?.comm_weekly ?? true,
    commNetwork: profile?.comm_network ?? false,
    charityPercent: profile?.contribution_percentage ?? 10,
  })

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const fd = new FormData()
    fd.append('fullName', formData.fullName)
    fd.append('bio', formData.bio)
    fd.append('phone', formData.phone)
    fd.append('commAlerts', formData.commAlerts.toString())
    fd.append('commWeekly', formData.commWeekly.toString())
    fd.append('commNetwork', formData.commNetwork.toString())
    fd.append('charityPercent', formData.charityPercent.toString())
    onUpdate(fd)
  }

  return (
    <div className="space-y-24">
      <section id="profile" className="space-y-10 scroll-mt-20">
        <SectionHeader index="01" title="Profile Identity" />
        
        <div className="flex items-center gap-8 border-b border-[#f4f3f1] pb-10">
           <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#f4f3f1] ring-4 ring-white shadow-xl relative">
                 <Image fill src={profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} alt="Avatar" className="object-cover" sizes="96px" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#c81e51] text-white flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
                 <Camera size={14} />
              </button>
           </div>
           <div>
              <h3 className="text-xl font-black text-[#0a1628] leading-tight">{profile?.full_name || 'Not Configured'}</h3>
              <p className="text-[12px] font-medium text-[#94a3b8] mt-1">{profile?.role || 'Member Node'} • Verified</p>
              <button className="text-[9px] font-black uppercase tracking-widest text-[#c81e51] mt-3 hover:underline underline-offset-4 decoration-dotted">Change Avatar</button>
           </div>
        </div>
        
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
           <div className="grid md:grid-cols-2 gap-8">
             <Field label="Legal Full Name">
                <input 
                   name="fullName" 
                   className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1] focus:bg-white" 
                   value={formData.fullName}
                   onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                   placeholder="e.g. Alex Sterling" 
                />
             </Field>
             <Field label="Phone Contact (Optional)">
                <input 
                   name="phone" 
                   className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1] focus:bg-white" 
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   placeholder="+1 (555) 000-0000" 
                />
             </Field>
           </div>
           
           <Field label="Foundation Allocation Ratio (%)">
              <p className="text-[10px] font-medium text-[#c81e51] mb-2 uppercase tracking-widest pl-1">Strict System Constraint: Minimum 10% Required</p>
              <input 
                name="charityPercent" 
                type="number"
                min="10"
                max="100"
                className="input-lumina w-full bg-[#fafafc] border-[#f4f3f1] focus:bg-white text-lg font-black" 
                value={formData.charityPercent}
                onChange={(e) => setFormData({...formData, charityPercent: parseInt(e.target.value) || 10})}
                placeholder="10" 
              />
           </Field>
           
           <Field label="Impact Bio">
             <textarea 
               name="bio"
               className="input-lumina w-full min-h-[120px] bg-[#fafafc] border-[#f4f3f1] focus:bg-white pt-5 resize-none leading-relaxed text-[13px]" 
               value={formData.bio}
               onChange={(e) => setFormData({...formData, bio: e.target.value})}
               placeholder="Brief description of your philanthropic mission..."
             />
           </Field>

           {msg && (
             <div className={`p-4 rounded-xl text-[11px] font-bold ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
               {msg.text}
             </div>
           )}
        </form>
      </section>

      {/* Section 03: Communication */}
      <section id="comm" className="space-y-10 scroll-mt-20">
         <SectionHeader index="03" title="Communication Nodes" />
         <div className="space-y-1">
            <ToggleItem 
              label="Global Impact Alerts" desc="Real-time notifications on significant humanitarian events." 
              checked={formData.commAlerts} onChange={(c) => setFormData({...formData, commAlerts: c})} 
            />
            <ToggleItem 
              label="Weekly Performance Ledger" desc="A curated summary of your legacy growth." 
              checked={formData.commWeekly} onChange={(c) => setFormData({...formData, commWeekly: c})} 
            />
            <ToggleItem 
              label="Network Node Invitations" desc="Exclusive alerts for localized philanthropic golf events." 
              checked={formData.commNetwork} onChange={(c) => setFormData({...formData, commNetwork: c})} 
            />
         </div>
      </section>

      {/* Section 04: Security & Privacy */}
      <section id="security" className="space-y-10 scroll-mt-20">
         <SectionHeader index="04" title="Security & Privacy" />
         <div className="grid md:grid-cols-2 gap-8">
            <SecurityCard icon={Smartphone} label="Two-Factor Node Access" desc="Authenticated login using mobile hardware keys." action="Enable MFA" />
            <SecurityCard icon={Fingerprint} label="Biometric Signature" desc="Signed ledger entries via Face/Touch ID." action="Active Node" highlight />
         </div>
         
         <div className="p-8 bg-white border border-[#f4f3f1] rounded-[2rem] flex items-center justify-between">
            <div>
              <h4 className="text-[13px] font-black text-[#c81e51] uppercase tracking-wider">Danger Zone</h4>
              <p className="text-[11px] font-medium text-[#94a3b8] mt-1">Permanently prune your node from the network.</p>
            </div>
            <button type="button" className="px-6 py-2.5 rounded-xl border border-[#f4f3f1] text-[9px] font-black uppercase tracking-widest text-[#c81e51] hover:bg-[#c81e51] hover:text-white transition-all">Prune Node</button>
         </div>
      </section>

      {/* Floating Action Button within the form component scope */}
      <div className="fixed bottom-10 right-10 z-50">
         <button 
           onClick={() => handleSubmit()}
           disabled={updating}
           className="group flex items-center gap-3 bg-[#c81e51] hover:bg-[#b01a47] text-white pl-6 pr-8 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#c81e51]/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
         >
            {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {updating ? 'Persisting...' : 'Persist Changes'}
         </button>
      </div>
    </div>
  )
}

function SectionHeader({ index, title }: { index: string; title: string }) {
   return (
      <div className="flex justify-between items-end border-b border-[#f4f3f1] pb-5">
         <h2 className="text-xl lg:text-2xl font-black text-[#0a1628]">{title}</h2>
         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#94a3b8]">SECTION {index}</span>
      </div>
   )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">{label}</label>
      {children}
    </div>
  )
}

interface TierCardProps {
  label: string;
  price: string;
  desc: string;
  active?: boolean;
}

function TierCard({ label, price, desc, active }: TierCardProps) {
   return (
      <div className={`flex flex-col p-6 rounded-[2rem] relative transition-all border ${
         active ? 'bg-[#0a1628] text-white border-transparent shadow-xl' : 'bg-[#fafafc] border-[#f4f3f1] hover:bg-white hover:shadow-lg'
      }`}>
         <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3">TIER</p>
         <h4 className="text-lg font-black mb-1">{label}</h4>
         <p className="text-[10px] font-medium opacity-60 mb-6 h-8 leading-relaxed">{desc}</p>
         <div className="mb-8">
            <span className="text-2xl font-black">{price}</span>
            <span className="text-[9px] opacity-40 ml-1">/MON</span>
         </div>
         <button className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-white text-[#0a1628] hover:bg-[#f4f3f1]' : 'bg-[#f4f3f1] text-[#0a1628] hover:bg-[#eceae7]'
         }`}>
            {active ? 'Manage' : 'Select'}
         </button>
      </div>
   )
}

interface SecurityCardProps {
  icon: React.ElementType;
  label: string;
  desc: string;
  action: string;
  highlight?: boolean;
}

function SecurityCard({ icon: Icon, label, desc, action, highlight }: SecurityCardProps) {
   return (
      <div className="p-8 bg-[#fafafc] border border-[#f4f3f1] rounded-[2rem] flex items-center gap-6 group hover:bg-white hover:shadow-lg transition-all">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? 'bg-[#c81e51]/5 text-[#c81e51]' : 'bg-[#0a1628]/5 text-[#0a1628]'}`}>
            <Icon size={24} />
         </div>
         <div className="flex-1">
            <p className="text-[13px] font-black text-[#0a1628]">{label}</p>
            <p className="text-[10px] font-medium text-[#94a3b8] mt-0.5 leading-relaxed">{desc}</p>
            <button className="text-[9px] font-black uppercase tracking-widest text-[#c81e51] mt-3 hover:underline underline-offset-4">{action}</button>
         </div>
      </div>
   )
}

interface ToggleItemProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleItem({ label, desc, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl group hover:bg-[#fafafc] transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
       <div className="flex items-center gap-5">
          <div className={`w-1 h-5 rounded-full transition-colors ${checked ? 'bg-[#c81e51]' : 'bg-[#f4f3f1]'}`} />
          <div>
            <p className="text-[13px] font-black text-[#0a1628]">{label}</p>
            <p className="text-[10px] font-medium text-[#94a3b8] mt-0.5">{desc}</p>
          </div>
       </div>
       <div className={`w-10 h-6 rounded-full p-1 transition-all ${checked ? 'bg-[#c81e51]' : 'bg-[#eceae7]'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-all ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
       </div>
    </div>
  )
}
