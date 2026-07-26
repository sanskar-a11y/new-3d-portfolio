'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface TextRevealProps {
  children: string
  delay?: number
}

export function TextReveal({ children, delay = 0 }: TextRevealProps) {
  return (
    <div className="overflow-hidden inline-block">
      <motion.div
        initial={{ y: '100%', rotate: 10, opacity: 0 }}
        animate={{ y: '0%', rotate: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] }}
        className="inline-block origin-left"
      >
        {children}
      </motion.div>
    </div>
  )
}
