'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProofUploadProps {
    winnerId: string;
    onComplete?: () => void;
}

export default function ProofUpload({ winnerId, onComplete }: ProofUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `winners/${winnerId}/${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('proof')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('proof')
        .getPublicUrl(filePath)

      // Update winner record via secure Server Action
      const { submitWinnerProof } = await import('@/modules/winners/actions')
      const result = await submitWinnerProof(winnerId, publicUrl)

      if (result.error) throw new Error(result.error)

      setIsSuccess(true)
      onComplete?.()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("glass p-8 border-dashed border-2 transition-all flex flex-col items-center justify-center text-center", isSuccess ? "border-green-500/50 bg-green-500/5" : "border-white/10 hover:border-blue-500/50")}>
      {isSuccess ? (
        <div className="space-y-4">
            <CheckCircle className="text-green-500 mx-auto" size={48} />
            <h3 className="text-xl font-bold">Proof Uploaded!</h3>
            <p className="text-gray-400">Admin will verify and approve your prize shortly.</p>
        </div>
      ) : (
        <>
            <Upload className={cn("mb-4", isUploading ? "animate-bounce text-blue-500" : "text-gray-500")} size={40} />
            <h3 className="text-xl font-bold mb-2">Upload Winning Proof</h3>
            <p className="text-gray-400 mb-6 text-sm">Please upload a photo of your ticket or score screen.</p>
            <label className="btn-primary cursor-pointer flex items-center">
                {isUploading ? <><Loader2 className="animate-spin mr-2" size={18} /> Uploading...</> : "Select File"}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
            </label>
        </>
      )}
    </div>
  )
}
