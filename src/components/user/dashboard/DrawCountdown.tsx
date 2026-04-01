'use client'

import React, { useEffect, useState } from 'react'

interface DrawCountdownProps {
  targetDate?: string // ISO string
}

export function DrawCountdown({ targetDate }: DrawCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!targetDate) return

    const target = new Date(targetDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft('DRAW IN PROGRESS')
        clearInterval(interval)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <p className="text-lg text-[#0a1628] font-black tracking-tighter leading-none animate-pulse">
      {timeLeft || 'SYNCHRONIZING...'}
    </p>
  )
}
