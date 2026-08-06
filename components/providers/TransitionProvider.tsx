'use client'

import { Suspense } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="popLayout">
      <motion.div key={pathname} className="relative z-30 w-full h-full">
        {/* Top-down curtain exit/enter overlay (skipped if user prefers reduced motion) */}
        {!shouldReduceMotion && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#050505] origin-top pointer-events-none"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
          />
        )}
        {/* Instant responsive page entry with smooth subtle fade */}
        <Suspense fallback={null}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}
