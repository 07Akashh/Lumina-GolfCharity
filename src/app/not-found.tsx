import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-8">
      <div className="text-center space-y-8 max-w-lg">
        <div className="w-16 h-16 bg-[#fee2e2] rounded-2xl flex items-center justify-center mx-auto">
          <Compass size={28} className="text-[#c81e51]" />
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c81e51]">404 — Not Found</p>
          <h1 className="display-lg text-[#0a1628]">This page doesn&apos;t exist.</h1>
          <p className="text-[#8a8f9e] leading-relaxed">
            The contribution node you&apos;re looking for has been archived or doesn&apos;t exist in this ledger.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/" className="btn-primary px-8 py-3 text-sm">
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <Link href="/dashboard" className="btn-secondary px-8 py-3 text-sm">
            My Portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}
