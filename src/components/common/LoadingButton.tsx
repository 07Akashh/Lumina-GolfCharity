'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function LoadingButton({ 
  loading: manualLoading, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}: LoadingButtonProps) {
  const { pending: formPending } = useFormStatus()
  const isLoading = manualLoading || formPending
  
  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden";
  
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "border-2 border-[#eceae7] hover:bg-[#fafafc] text-[#0a1628] font-bold py-2.5 px-6 rounded-xl",
    danger: "bg-[#fee2e2] hover:bg-[#fecaca] text-[#c81e51] font-bold py-2.5 px-6 rounded-xl"
  }

  const variantClass = variants[variant] || variants.primary;

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variantClass} ${className} ${isLoading ? 'pointer-events-none' : ''}`}
      {...props}
    >
      <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0 scale-90 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
        {children}
      </span>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Processing...</span>
        </div>
      )}
    </button>
  )
}
