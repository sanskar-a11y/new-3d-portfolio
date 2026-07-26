'use client'

import { motion } from 'framer-motion'

export function AnimatedDivider() {
  return (
    <motion.div 
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
      className="w-full h-[1px] bg-white/10 origin-left"
    />
  )
}
