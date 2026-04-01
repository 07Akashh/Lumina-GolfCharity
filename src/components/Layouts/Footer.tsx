import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const LINKS = {
  Platform: [
    { label: 'Charity Partners', href: '/partners' },
    { label: 'Impact Report 2024', href: '/reports' },
    { label: 'Membership Perks', href: '/memberships' },
    { label: 'Draw Guide', href: '/guide' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Concierge Desk', href: '/concierge' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="footer-lumina">
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-10">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row gap-16 pb-16">
          {/* Brand column */}
          <div className="lg:w-80 shrink-0 space-y-6">
            <Link href="/" className="serif-i text-2xl font-bold text-[#0a1628] hover:text-[#c81e51] transition-colors block">
              Lumina Ethereal
            </Link>
            <p className="text-sm text-[#8a8f9e] leading-relaxed font-medium">
              Redefining the architecture of modern giving through transparency, luxury, and collective impact.
            </p>
            {/* Newsletter micro */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-10 bg-white rounded-lg px-3 text-sm border border-[#e3e2e0] focus:outline-none focus:border-[#c81e51] transition-colors"
              />
              <button className="btn-primary px-4 py-2 text-xs rounded-lg" style={{ borderRadius: '0.5rem' }}>
                Join
              </button>
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-10">
            {Object.entries(LINKS).map(([title, links]) => (
              <div key={title} className="space-y-5">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0f1523] opacity-40">{title}</p>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-[#8a8f9e] hover:text-[#c81e51] transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Security badges column */}
            <div className="space-y-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0f1523] opacity-40">Security</p>
              <div className="space-y-3">
                {['ISO 27001', 'AES-256', 'SOC 2 Type II'].map((badge) => (
                  <div key={badge} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-[#3d4151] border border-[#e3e2e0] mr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#eceae7] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#8a8f9e] font-medium">
            © 2024 Lumina Ethereal. Secure Philanthropy.
          </p>
          <div className="flex items-center gap-8">
            {['Privacy Policy', 'Impact Report', 'Security', 'Contact'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-[11px] font-semibold text-[#8a8f9e] hover:text-[#c81e51] uppercase tracking-wider transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
