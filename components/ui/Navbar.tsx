'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Magnetic } from '@/components/ui/Magnetic'

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close mobile dropdown when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const allLinks = [
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Playground', href: '/playground' },
    { name: 'Contact', href: '/contact' },
  ]

  const leftLinks = [
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' },
  ]

  const rightLinks = [
    { name: 'Contact', href: '/contact' },
    { name: 'Playground', href: '/playground' },
  ]

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-5 sm:px-12 flex justify-between items-center text-xs sm:text-sm tracking-widest uppercase text-white/80 bg-[#050505]/40 backdrop-blur-md"
    >
      {/* Desktop Left Links */}
      <div className="hidden md:flex gap-6 sm:gap-12">
        {leftLinks.map((link) => (
          <Magnetic key={link.name}>
            <Link 
              href={link.href}
              className={`relative hover:text-white transition-colors duration-300 ${pathname === link.href ? 'text-white' : ''}`}
            >
              {link.name}
              {pathname === link.href && (
                <motion.div 
                  layoutId="nav-dot-left"
                  className="absolute -bottom-2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2"
                />
              )}
            </Link>
          </Magnetic>
        ))}
      </div>

      {/* SANSKAR Center Logo (Desktop & Mobile) */}
      <Magnetic>
        <Link 
          href="/" 
          aria-label="SANSKAR"
          className="relative group py-1.5 px-4 flex items-center justify-center select-none cursor-pointer transform -skew-x-12"
        >
          {/* Subtle Ambient Glow behind text */}
          <div className="absolute inset-0 bg-[#ff0055]/15 rounded-full blur-lg opacity-60 group-hover:opacity-100 group-hover:bg-[#ff0055]/30 transition-all duration-500" />
          
          {/* Elegant Fine Cat Claw Slash Overlay */}
          <svg 
            className="absolute -inset-x-6 -inset-y-2 w-[135%] h-[150%] pointer-events-none stroke-[#ff0055] transition-all duration-300 transform group-hover:scale-105 group-hover:stroke-[#ff3377] group-hover:drop-shadow-[0_0_10px_rgba(255,0,85,0.9)]"
            viewBox="0 0 180 50"
            fill="none"
          >
            {/* Fine Jagged Cat Claw Slashes */}
            <path d="M 10 42 L 32 12 M 25 45 L 48 10 M 42 44 L 68 8 M 65 46 L 95 6 M 90 42 L 115 10 M 112 45 L 138 8 M 132 44 L 162 6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
            <path d="M 10 40 C 45 25 100 15 170 6" strokeWidth="2" strokeLinecap="round" opacity="0.85" strokeDasharray="12 3 6 2" />
            <path d="M 16 44 C 52 27 110 17 175 8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" strokeDasharray="14 4 5 2" />
          </svg>

          {/* Elegant Scratched SANSKAR Typography */}
          <span 
            className="font-scratchy relative z-10 text-lg sm:text-2xl tracking-[0.22em] uppercase text-[#ff0055] group-hover:text-[#ff3377] transition-all duration-300 font-bold"
            style={{
              textShadow: '0 0 8px rgba(255, 0, 85, 0.8), 0 0 16px rgba(255, 0, 85, 0.4), 1.5px 1.5px 0px #000',
            }}
          >
            SANSKAR
          </span>
        </Link>
      </Magnetic>

      {/* Desktop Right Links */}
      <div className="hidden md:flex gap-6 sm:gap-12">
        {rightLinks.map((link) => (
          <Magnetic key={link.name}>
            <Link 
              href={link.href}
              className={`relative hover:text-white transition-colors duration-300 ${pathname === link.href ? 'text-white' : ''}`}
            >
              {link.name}
              {pathname === link.href && (
                <motion.div 
                  layoutId="nav-dot-right"
                  className="absolute -bottom-2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2"
                />
              )}
            </Link>
          </Magnetic>
        ))}
      </div>

      {/* Mobile Top-Right MENU Button & Dropdown */}
      <div className="md:hidden relative">
        <Magnetic>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-black/60 hover:bg-white/10 border border-white/20 hover:border-white/50 text-white rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer font-bold tracking-widest text-xs uppercase"
            aria-label="Toggle Navigation Menu"
          >
            <span>{isOpen ? 'CLOSE' : 'MENU'}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-cyan-400' : 'bg-white'} transition-colors duration-300`} />
          </button>
        </Magnetic>

        {/* Dropdown Menu Panel (Matches user screenshot) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 top-12 w-48 bg-[#0a0a0c]/95 border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4 text-right z-50"
            >
              {allLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-mono font-bold tracking-widest uppercase transition-colors duration-200 ${
                    pathname === link.href ? 'text-cyan-400' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
