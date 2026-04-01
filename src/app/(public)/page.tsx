'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart,
  CheckCircle2,
  ArrowRight,
  Globe,
  GraduationCap,
  TreePine,
  Shield,
  ChevronRight,
} from 'lucide-react'

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: 'easeOut' as const },
  }
}

export default function LandingPage() {
  // const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <div className="overflow-x-hidden">
      {/* ──────────────────────────── HERO ──────────────────────────── */}
      <section className="min-h-screen bg-[#faf9f7] pt-[72px] grid lg:grid-cols-2 gap-0">
        {/* LEFT: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-24 space-y-10">
          <motion.p
            {...fadeUpProps(0)}
            className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c81e51]"
          >
            Winner&apos;s Circle
          </motion.p>

          <motion.h1
            {...fadeUpProps(0.1)}
            className="display-xl text-[#0a1628]"
          >
            Play. Win.{' '}
            <span className="serif-i text-[#c81e51]">Give Back.</span>
          </motion.h1>

          <motion.p
            {...fadeUpProps(0.2)}
            className="text-base text-[#3d4151] leading-relaxed font-medium max-w-md"
          >
            A membership designed for the modern philanthropist. Experience elite access while creating measurable, generational impact through our curated prize pools.
          </motion.p>

          <motion.div
            {...fadeUpProps(0.3)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/memberships" className="btn-primary px-8 py-3.5 text-sm">
              Join the Legacy
            </Link>
            <Link
              href="/draws"
              className="btn-secondary px-8 py-3.5 text-sm font-semibold"
            >
              View Prize Pool
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            {...fadeUpProps(0.4)}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#eceae7] border-2 border-white overflow-hidden">
                  <img src={`https://i.pravatar.cc/80?u=lumina${i}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-[#0a1628]">12,400+ members</p>
              <p className="text-xs text-[#8a8f9e]">across 45 countries</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Editorial image with floating card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden bg-[#0a1628] min-h-[560px] lg:min-h-0"
        >
          <img
            src="https://images.unsplash.com/photo-1541233349642-6e425fe6190e?auto=format&fit=crop&q=80&w=1200"
            alt="Lumina philanthropy"
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/60 to-transparent" />

          {/* Floating notification card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute bottom-10 left-8 right-8 md:left-10 md:right-auto md:max-w-xs"
          >
            <div className="glass-crystal rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c81e51] flex items-center justify-center">
                  <Heart size={16} className="text-white fill-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e]">Latest Impact</p>
                  <p className="text-sm font-bold text-[#0a1628]">$2.4M raised for clean water in Q3</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ──────────────────────────── IMPACT MATRIX ──────────────────────────── */}
      <section className="bg-[#faf9f7] py-28 px-8 md:px-16">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <h2 className="display-lg text-[#0a1628]">The Impact Matrix</h2>
            <p className="text-base text-[#3d4151] leading-relaxed">
              Real-time transparency on the change we catalyze together. Your play fuels these outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              icon={<Heart size={22} className="text-[#c81e51]" />}
              value="12,400"
              label="Lives touched this month"
              bg="bg-white"
            />
            <StatCard
              icon={<TreePine size={22} className="text-white" />}
              value="Give Projects →"
              label="Trees planted globally"
              bg="bg-[#003731]"
              dark
              link="/charities"
            />
            <StatCard
              icon={<GraduationCap size={22} className="text-[#6366f1]" />}
              value="42"
              label="Scholarships awarded"
              bg="bg-white"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────── PRIZE POOL + ELITE REWARDS ──────────────────────────── */}
      <section className="bg-[#f4f3f1] py-28 px-8 md:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Prize pool card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-[#eceae7] rounded-[2rem] p-12 space-y-8 relative overflow-hidden"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c81e51]">Monthly Prize Pool</p>
            <p className="display-xl serif-i text-[#0a1628]">$1,250,000</p>

            {/* Avatar stack */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-[3px] border-[#eceae7] overflow-hidden bg-[#d8d6d3]">
                    <img src={`https://i.pravatar.cc/80?u=pool${i}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-[3px] border-[#eceae7] bg-[#c81e51] flex items-center justify-center text-[9px] font-black text-white">
                  +18k
                </div>
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a8f9e]">
              Drawing in 12 days, 08 hours
            </p>
          </motion.div>

          {/* Elite rewards text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-8"
          >
            <h2 className="display-lg text-[#0a1628]">
              Elite rewards for the{' '}
              <span className="serif-i text-[#c81e51]">committed donor.</span>
            </h2>
            <p className="text-[#3d4151] leading-relaxed">
              Our prize pools aren&apos;t just about winning—they&apos;re a celebration of collective giving. Every entry scales our ability to support high-impact charities globally.
            </p>
            <ul className="space-y-5">
              {[
                'Guaranteed payout structures',
                'Tax-efficient contribution models',
                'Exclusive donor-only invitational',
              ].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#dcfce7] flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-[#15803d]" />
                  </div>
                  <span className="text-sm font-semibold text-[#0a1628]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────── BENEFICIARIES ──────────────────────────── */}
      <section className="bg-[#faf9f7] py-28 px-8 md:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-3">
              <h2 className="display-md text-[#0a1628]">Our Beneficiaries</h2>
              <p className="text-sm text-[#8a8f9e]">We partner with organizations that demonstrate radical efficiency and measurable outcomes.</p>
            </div>
            <Link href="/charities" className="text-[11px] font-black uppercase tracking-widest text-[#c81e51] hover:underline flex items-center gap-1">
              View Full Directory <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'AquaPure', type: 'Clean Water', icon: <Globe size={20} className="text-[#3b82f6]" /> },
              { name: 'GeriHealth', type: 'Medical Research', icon: <Heart size={20} className="text-[#c81e51]" /> },
              { name: 'EarthRenew', type: 'Reforestation', icon: <TreePine size={20} className="text-[#15803d]" /> },
              { name: 'CoreShelter', type: 'Urban Housing', icon: <Shield size={20} className="text-[#6366f1]" /> },
            ].map((org) => (
              <motion.div
                key={org.name}
                whileHover={{ y: -4 }}
                className="card-lumina p-8 flex flex-col items-center text-center space-y-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f4f3f1] flex items-center justify-center">
                  {org.icon}
                </div>
                <p className="font-bold text-[#0a1628]">{org.name}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e]">{org.type}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── CHOOSE YOUR LEGACY (PRICING) ──────────────────────────── */}
      <section className="bg-[#f4f3f1] py-28 px-8 md:px-16">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="display-lg text-[#0a1628]">Choose Your Legacy</h2>
            <p className="text-sm text-[#8a8f9e] max-w-lg mx-auto">
              Select a membership that aligns with your philanthropic goals and desired level of engagement.
            </p>
            {/* Billing toggle - Disabled for now
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm mt-4">
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    billing === b
                      ? 'bg-[#c81e51] text-white shadow-sm'
                      : 'text-[#8a8f9e] hover:text-[#0a1628]'
                  }`}
                >
                  {b === 'yearly' ? 'Yearly (Save 20%)' : 'Monthly'}
                </button>
              ))}
            </div>
            */}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-end">
            <PricingCard
              title="Ethereal"
              price="99"
              features={['5 Monthly Foundation Nodes', 'Legacy Impact Report', 'Community Access']}
            />
            <PricingCard
              title="Apex"
              price="499"
              highlighted
              badge="Most Popular"
              features={[
                '25 Monthly Foundation Nodes',
                'Quarterly Concierge Ledger',
                'VIP Gala Access',
                'Priority Legacy Rights',
              ]}
            />
            <PricingCard
              title="Luminary"
              price="1,999"
              features={['100 Monthly Foundation Nodes', 'Custom Foundation Hub', 'Advisory Board Appointment']}
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────── FINAL CTA BAND ──────────────────────────── */}
      <section className="bg-[#0a1628] py-24 px-8 md:px-16 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="display-lg text-white">
            Ready to build your{' '}
            <span className="serif-i text-[#c81e51]">legacy?</span>
          </h2>
          <p className="text-[#8a8f9e] text-base leading-relaxed">
            Join thousands of digital philanthropists who are winning prizes while funding a better future.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/memberships" className="btn-primary px-10 py-4 text-base">
              Initiate Impact <ArrowRight size={18} />
            </Link>
            <Link href="/impact" className="px-10 py-4 text-white font-semibold text-base border border-white/20 rounded-full hover:bg-white/5 transition-all">
              View Impact Report
            </Link>
          </div>
          <p className="text-[11px] text-[#8a8f9e]">Cancel anytime. No commitment required.</p>
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ── */

function StatCard({
  icon, value, label, bg, dark = false, link,
}: {
  icon: React.ReactNode
  value: string
  label: string
  bg: string
  dark?: boolean
  link?: string
}) {
  const content = (
    <motion.div
      whileHover={{ y: -4 }}
      className={`${bg} rounded-[1.5rem] p-10 space-y-6 relative overflow-hidden cursor-default`}
      style={{ boxShadow: dark ? '0 8px 32px rgba(0,55,49,0.25)' : '0 1px 3px rgba(15,21,35,0.04), 0 8px 24px rgba(15,21,35,0.05)' }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-[#f4f3f1]'}`}>
        {icon}
      </div>
      <div>
        <p className={`display-md ${dark ? 'text-white' : 'text-[#0a1628]'} leading-none`}>{value}</p>
        <div className="mt-3 h-0.5 w-8 bg-[#c81e51]/30" />
      </div>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${dark ? 'text-white/50' : 'text-[#8a8f9e]'}`}>{label}</p>
    </motion.div>
  )

  if (link) return <Link href={link}>{content}</Link>
  return content
}

function PricingCard({
  title, price, features, highlighted = false, badge,
}: {
  title: string
  price: string
  features: string[]
  highlighted?: boolean
  badge?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-[1.5rem] p-10 space-y-8 relative ${
        highlighted
          ? 'bg-white shadow-[0_20px_60px_rgba(200,30,81,0.1)] scale-[1.03]'
          : 'bg-[#eceae7]'
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 btn-primary text-[10px] px-4 py-1 font-black tracking-wider">
          {badge}
        </div>
      )}
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a8f9e]">{title}</p>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="display-lg serif-i text-[#0a1628]">${price}</span>
          <span className="text-[11px] font-bold text-[#8a8f9e]">/ mo</span>
        </div>
      </div>

      <ul className="space-y-4">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm font-medium text-[#3d4151]">
            <CheckCircle2 size={15} className="text-[#c81e51] shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/memberships"
        className={`block text-center py-3.5 rounded-full text-sm font-bold transition-all ${
          highlighted
            ? 'btn-primary w-full'
            : 'bg-[#0a1628] text-white hover:bg-[#0a1628]/90 w-full'
        }`}
      >
        {highlighted ? `Become a ${title}` : 'Select Tier'}
      </Link>
    </motion.div>
  )
}
