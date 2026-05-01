'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CommandStatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  color: 'green' | 'red' | 'blue' | 'purple' | 'cyan' | 'amber'
  subValue: string
  delay: number
}

const colorClasses = {
  green: 'border-kura-green/20 bg-kura-green/10 text-kura-green',
  red: 'border-kura-red/20 bg-kura-red/10 text-kura-red',
  blue: 'border-kura-blue/20 bg-kura-blue/10 text-kura-blue',
  purple: 'border-kura-purple/20 bg-kura-purple/10 text-kura-purple',
  cyan: 'border-kura-cyan/20 bg-kura-cyan/10 text-kura-cyan',
  amber: 'border-kura-amber/20 bg-kura-amber/10 text-kura-amber',
}

const colorBarClasses = {
  green: 'bg-kura-green/10',
  red: 'bg-kura-red/10',
  blue: 'bg-kura-blue/10',
  purple: 'bg-kura-purple/10',
  cyan: 'bg-kura-cyan/10',
  amber: 'bg-kura-amber/10',
}

export default function CommandStatCard({ 
  label, 
  value, 
  icon, 
  color, 
  subValue, 
  delay 
}: CommandStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08 }}
      className="relative rounded-xl border border-[#1E1E24] bg-[#111114] p-5 overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-[#71717A] mb-2">
            {label}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {value}
          </div>
          <div className="text-xs text-[#52525B]">
            {subValue}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${colorBarClasses[color]}`}></div>
    </motion.div>
  )
}
