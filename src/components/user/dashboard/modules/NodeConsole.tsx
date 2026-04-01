'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { LoadingButton } from '@/components/common/LoadingButton'
import { useApiMutation } from '@/lib/api-client'
import { addScore } from '@/modules/scores/actions'
import { useQueryClient } from '@tanstack/react-query'

interface NodeConsoleProps {
  scores?: Array<{ value: number; id: string }>;
}

export function NodeConsole({ scores }: NodeConsoleProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  
  return (
    <div className="card-lumina p-8 bg-[#f4f3f1]/20 border border-[#f4f3f1] rounded-[2.5rem] space-y-8">
       <ScoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
       
       <h3 className="text-lg font-bold text-[#0a1628]">Active Draw Nodes</h3>
       <div className="grid grid-cols-2 gap-4">
          {scores && scores.length > 0 ? (
            scores.map((s, i) => (
              <div 
                key={s.id || i} 
                className="h-14 rounded-xl flex items-center justify-center text-sm font-black transition-all bg-white text-[#0a1628] border border-[#f4f3f1] hover:scale-105"
              >
                {s.value < 10 ? `0${s.value}` : s.value}
              </div>
            ))
          ) : (
            <div className="col-span-2 py-4 text-center border-2 border-dashed border-[#eceae7] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
              No active nodes.
            </div>
          )}
       </div>
       <LoadingButton 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 text-[10px] font-black uppercase tracking-widest font-bold"
       >
          Manage Draw Nodes
       </LoadingButton>
    </div>
  )
}

function ScoreModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const queryClient = useQueryClient()

  if (!isOpen) return null

  const handleAdd = async () => {
    if (!value) return
    setLoading(true)
    setError(null)
    
    try {
      const result = await addScore(parseInt(value))
      if (result && 'error' in result) {
        setError(result.error as string)
      } else {
        // GRANULAR INVALIDATION: Only refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['/user/dashboard'] })
        onClose()
      }
    } catch (err) {
      setError('Systemic sync failure. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#0a1628]/40 backdrop-blur-md" onClick={onClose} />
      <div className="card-lumina w-full max-w-md p-10 bg-white relative z-10 space-y-8 animate-in zoom-in-95 duration-500">
         <header>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c81e51] mb-2">Gaming Node</p>
            <h2 className="text-2xl font-black text-[#0a1628]">Sync Entry Number</h2>
            <p className="text-[13px] font-medium text-[#8a8f9e] mt-1">Lumina algorithm rotates the oldest entry automatically.</p>
         </header>

         <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Entry Value (1-45)</label>
            </div>
            <input 
               type="number" min="1" max="45"
               value={value}
               onChange={(e) => setValue(e.target.value)}
               className="w-full text-4xl font-black text-[#0a1628] border-b-2 border-[#f4f3f1] focus:border-[#c81e51] py-4 outline-none transition-all placeholder:opacity-10"
               placeholder="00"
               autoFocus
            />
         </div>

         {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}

         <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-4 bg-[#f4f3f1] text-[#0a1628] rounded-2xl text-[11px] font-black uppercase tracking-widest">Abort</button>
            <LoadingButton 
               loading={loading} 
               onClick={handleAdd}
               className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#c81e51]/20 font-bold"
            >
               Authorize Sync Node <Sparkles size={14} className="ml-2" />
            </LoadingButton>
         </div>
      </div>
    </div>
  )
}
