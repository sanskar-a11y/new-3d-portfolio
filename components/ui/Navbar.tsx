'use client'

import { useState, useEffect, useRef, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Magnetic } from '@/components/ui/Magnetic'

const LEFT_LINKS = [
  { name: 'Projects', href: '/projects' },
  { name: 'About', href: '/about' },
]

const RIGHT_LINKS = [
  { name: 'Playground', href: '/playground' },
  { name: 'Contact', href: '/contact' },
]

const ALL_LINKS = [
  { name: 'Projects', href: '/projects' },
  { name: 'About', href: '/about' },
  { name: 'Playground', href: '/playground' },
  { name: 'Contact', href: '/contact' },
]

export const Navbar = memo(function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 250)
  }

  const handlePrefetch = (href: string) => {
    router.prefetch(href)
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-5 sm:px-10 lg:px-16 py-4 sm:py-6 md:py-8 flex justify-between items-center pointer-events-none select-none"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ─── Desktop Left Links ─── */}
      <div className="hidden md:flex items-center gap-8 lg:gap-14 pointer-events-auto">
        {LEFT_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Magnetic key={link.name}>
              <Link
                href={link.href}
                onMouseEnter={() => handlePrefetch(link.href)}
                className={`relative group inline-flex items-center text-xs sm:text-sm font-light uppercase tracking-[0.25em] transition-all duration-300 py-1 ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-dot-left"
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                )}
              </Link>
            </Magnetic>
          )
        })}
      </div>

      {/* ─── SANSKAR Center Logo (Desktop & Mobile) ─── */}
      <div className="pointer-events-auto flex items-center justify-center">
        <Magnetic>
          <Link
            href="/"
            aria-label="SANSKAR"
            onMouseEnter={() => handlePrefetch('/')}
            className="group inline-flex items-center cursor-pointer py-1"
          >
            <Image
              src="/logo.png"
              alt="SANSKAR"
              width={200}
              height={66}
              priority
              className="h-8 sm:h-10 md:h-12 w-auto object-contain mix-blend-screen brightness-110 contrast-125 filter transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(255,255,255,0.85)]"
            />
          </Link>
        </Magnetic>
      </div>

      {/* ─── Desktop Right Links ─── */}
      <div className="hidden md:flex items-center gap-8 lg:gap-14 pointer-events-auto">
        {RIGHT_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Magnetic key={link.name}>
              <Link
                href={link.href}
                onMouseEnter={() => handlePrefetch(link.href)}
                className={`relative group inline-flex items-center text-xs sm:text-sm font-light uppercase tracking-[0.25em] transition-all duration-300 py-1 ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-dot-right"
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                )}
              </Link>
            </Magnetic>
          )
        })}
      </div>

      {/* ─── Mobile Top-Right Pure Text Menu (Hidden on Desktop) ─── */}
      <div
        className="md:hidden pointer-events-auto relative flex flex-col items-end"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group inline-flex items-center gap-2.5 text-xs font-light uppercase tracking-[0.25em] text-white/75 hover:text-white transition-colors duration-300 py-2 px-1 cursor-pointer focus:outline-none"
          aria-expanded={isOpen}
          aria-label="Toggle Navigation Menu"
        >
          <span>{isOpen ? 'Close' : 'Menu'}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isOpen ? 'bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.9)]' : 'bg-white/40 group-hover:bg-white'
            }`}
          />
        </button>

        {/* Mobile Floating Dropdown — Pure Typography, Zero Box */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full pt-3 flex flex-col items-end gap-3.5 z-50 min-w-[130px]"
            >
              {ALL_LINKS.map((link, idx) => {
                const isActive = pathname === link.href

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onMouseEnter={() => handlePrefetch(link.href)}
                      onClick={() => setIsOpen(false)}
                      className={`group relative inline-flex items-center gap-2 text-xs font-light uppercase tracking-[0.25em] transition-all duration-300 py-0.5 ${
                        isActive
                          ? 'text-white'
                          : 'text-white/45 hover:text-white hover:translate-x-[-3px]'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-white mr-1" />
                      )}
                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
})
