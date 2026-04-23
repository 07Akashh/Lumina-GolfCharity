'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoadingStore } from '@/store/use-loading-store'

export function GlobalLoader() {
  const { isLoading, loadingMessage } = useLoadingStore()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf9f7]/80 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center">
            {/* Concentric spinning rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 border-t-2 border-r-2 border-[#c81e51] rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute w-12 h-12 border-b-2 border-l-2 border-[#0a1628] rounded-full"
            />
            {/* Pulsing center node */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute w-4 h-4 bg-[#c81e51] rounded-full shadow-[0_0_20px_rgba(200,30,81,0.5)]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0a1628] opacity-40">
              {loadingMessage || 'Synchronizing Data Layer'}
            </p>
            <div className="mt-4 flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 h-1 bg-[#c81e51] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
