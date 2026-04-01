import { Shield } from 'lucide-react'
import { AdminSidebarMenu } from '@/components/admin/dashboard/AdminSidebarMenu'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    // If not admin, kick back to user dashboard
    redirect('/user')
  }

  return (
    <div className="h-screen bg-[#faf9f7] flex text-[#0a1628] font-inter overflow-hidden">
      {/* Admin Sidebar (Light Mode) */}
      <aside className="w-[260px] bg-white border-r border-[#eceae7] flex flex-col py-10 px-6 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">
        <div className="mb-12 px-4 flex items-center gap-3">
          <Shield className="text-[#c81e51]" size={24} strokeWidth={2.5} />
          <span className="serif-i text-2xl font-black tracking-tight text-[#0a1628]">Lumina <span className="text-[#c81e51]">Admin</span></span>
        </div>

        <div className="flex-1 w-full">
          <Suspense fallback={<div className="mt-8 space-y-2 animate-pulse"><div className="w-full h-12 bg-[#f4f3f1] rounded-xl"></div><div className="w-full h-12 bg-[#f4f3f1] rounded-xl"></div></div>}>
            <AdminSidebarMenu />
          </Suspense>
        </div>

        <div className="mt-auto border-t border-[#f4f3f1] pt-8">
           <div className="px-5 py-4 bg-[#fafafc] rounded-2xl border border-[#eceae7] shadow-inner">
              <p className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8] mb-1.5 flex items-center gap-1.5"><Shield size={10} className="text-[#15803d]" /> Security Clearance</p>
              <p className="text-[11px] font-bold text-[#0a1628] truncate">{user.email}</p>
           </div>
        </div>
      </aside>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar relative">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
