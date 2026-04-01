'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { signup } from '@/modules/auth/actions'
import { getCharities } from '@/modules/charity/actions'
import { getCountries } from '@/modules/country/actions'
import { Mail, Lock, User, Heart, Globe, ArrowRight } from 'lucide-react'
import { LoadingButton } from '@/components/common/LoadingButton'
import { Charity, Country } from '@/types'

import { useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const plan = searchParams?.get('plan')
  
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [charities, setCharities] = useState<Charity[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')

  useEffect(() => {
    Promise.all([getCountries(), getCharities()])
      .then(([c, ch]) => {
        setCountries(c || [])
        setCharities(ch || [])
      })
      .catch(() => {
        console.warn('Network active but environment keys may be placeholder.')
      })
  }, [])

  const filteredCharities = selectedCountry
    ? charities.filter(c => !c.country_id || c.country_id === selectedCountry)
    : charities

  const handleSubmit = async (fd: FormData) => {
    setPending(true)
    setError(null)
    const res = await signup(fd)
    if (res?.error) { 
      setError(res.error)
      setPending(false) 
    } else {
      // Success - Redirect to purchase with preference
      const redirectUrl = plan ? `/purchase?plan=${plan}` : '/purchase'
      window.location.href = redirectUrl
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex relative">
      {/* Editorial Branding Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0a1628] flex-col justify-between p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0a1628] to-[#003731]/40" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c81e51]/10 blur-[100px] -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10">
          <Link href="/" className="serif-i text-3xl font-black text-white tracking-tight hover:text-[#c81e51] transition-colors">Lumina</Link>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-4">Membership Department</p>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="display-lg text-white leading-[1.1] tracking-tight">
              Begin your <br />
              <span className="serif-i text-[#c81e51] italic">Legacy.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Join a verified network of philanthropists directing impact to high-yield global foundations.
            </p>
          </motion.div>

          <ul className="space-y-6">
            {[
              { t: 'Strategic Draws', d: 'Monthly prize pools with dynamic weighted logic.' },
              { t: 'Verified Impact', d: '100% of your charity fee goes to the foundation.' },
              { t: 'Real-Time Ledger', d: 'Track every node and settlement in your portfolio.' },
            ].map((item, idx) => (
              <motion.li 
                key={item.t} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="flex items-start gap-4 group"
              >
                <div className="w-5 h-5 rounded-full border border-[#c81e51]/40 flex items-center justify-center mt-1 group-hover:bg-[#c81e51] transition-all">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#c81e51] group-hover:bg-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">{item.t}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{item.d}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-4">
           <div className="flex -space-x-3">
              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a1628] bg-[#f4f3f1]" />)}
           </div>
           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">12.4k Authorized Members</p>
        </div>
      </div>

      {/* Structured Application Form */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white lg:rounded-l-[3rem] shadow-2xl shadow-black/5 z-20 overflow-y-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           className="w-full max-w-xl space-y-12 py-10"
        >
          <header className="space-y-4">
            <div className="w-16 h-1 bg-[#c81e51] rounded-full" />
            <div className="space-y-1">
              <h1 className="display-md text-[#0a1628] leading-tight">Membership <span className="serif-i text-[#c81e51]">Application</span></h1>
              <p className="text-[#8a8f9e] text-sm font-medium">Verify your identity and set your philanthropic foundation.</p>
            </div>
          </header>

          <form action={handleSubmit} className="space-y-10">
            {/* Identity Group */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#f4f3f1] pb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c81e51]">01 / Identity</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Full Name" icon={<User size={16} />}>
                  <input name="fullName" disabled={pending} placeholder="Alexander Whitmore" className="input-lumina py-4 bg-[#fcfbf9] disabled:opacity-50" required />
                </Field>
                <Field label="Email Address" icon={<Mail size={16} />}>
                  <input name="email" type="email" disabled={pending} placeholder="you@lumina.com" className="input-lumina py-4 bg-[#fcfbf9] disabled:opacity-50" required />
                </Field>
              </div>
              <Field label="Security Key (Password)" icon={<Lock size={16} />}>
                <input name="password" type="password" disabled={pending} placeholder="Min. 8 characters" className="input-lumina py-4 bg-[#fcfbf9] disabled:opacity-50" required minLength={8} />
              </Field>
            </div>

            {/* Impact Group */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#f4f3f1] pb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c81e51]">02 / Foundation</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Your Country" icon={<Globe size={16} />}>
                  <select
                    name="countryId" required
                    disabled={pending}
                    className="input-lumina py-4 bg-[#fcfbf9] appearance-none disabled:opacity-50"
                    onChange={e => setSelectedCountry(e.target.value)}
                  >
                    <option value="">Select Country…</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Region / State" icon={<Globe size={16} />}>
                  <input name="region" disabled={pending} placeholder="e.g. California" className="input-lumina py-4 bg-[#fcfbf9] disabled:opacity-50" required />
                </Field>
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <Field label="Partner Charity" icon={<Heart size={16} />}>
                  <select name="charityId" disabled={pending} required className="input-lumina py-4 bg-[#fcfbf9] appearance-none disabled:opacity-50">
                    <option value="">Select Foundation…</option>
                    {filteredCharities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3d4151] opacity-60 block ml-1">
                  Default Impact Allocation
                </label>
                <div className="flex gap-4">
                  {[10, 20, 30, 50].map(pct => (
                    <label key={pct} className={`flex-1 cursor-pointer group ${pending ? 'pointer-events-none' : ''}`}>
                      <input 
                        type="radio" 
                        name="contributionPercentage" 
                        value={pct} 
                        disabled={pending}
                        className="sr-only peer" 
                        defaultChecked={pct === 20} 
                      />
                      <div className="text-center py-4 rounded-2xl bg-[#fcfbf9] border border-[#f4f3f1] text-sm font-bold text-[#3d4151] transition-all
                                   peer-checked:bg-[#c81e51] peer-checked:text-white peer-checked:border-[#c81e51] peer-checked:shadow-lg peer-checked:shadow-[#c81e51]/20
                                   peer-disabled:opacity-50
                                   group-hover:border-[#eceae7]">
                        {pct}%
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-[#8a8f9e] italic ml-1">Of every prize pool distribution allocated to your chosen charity.</p>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#fee2e2]/30 border border-[#fee2e2] rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-[#c81e51]">{error}</p>
              </motion.div>
            )}

            <div className="space-y-6 pt-4">
               <LoadingButton
                 type="submit"
                 loading={pending}
                 className="w-full py-4 text-sm font-bold shadow-xl shadow-[#c81e51]/20"
               >
                 Submit Application <ArrowRight size={16} />
               </LoadingButton>

               <p className="text-center text-xs font-medium text-[#8a8f9e]">
                 By applying, you agree to our <Link href="/terms" className="text-[#0a1628] underline decoration-divider hover:text-[#c81e51] transition-colors">Philanthropic Charter</Link>.
               </p>
            </div>
          </form>

          <footer className="pt-10 border-t border-[#f4f3f1] text-center">
             <p className="text-xs font-medium text-[#8a8f9e]">
               Already an authorized member?{' '}
               <Link href="/login" className="text-[#0a1628] font-bold underline decoration-[#c81e51] underline-offset-4 hover:text-[#c81e51] transition-colors">Authorize Access</Link>
             </p>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#3d4151] opacity-60 ml-1 block">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8f9e] group-focus-within:text-[#c81e51] transition-colors pointer-events-none z-10">{icon}</div>
        {children}
      </div>
    </div>
  )
}
