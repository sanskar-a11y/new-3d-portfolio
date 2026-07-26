'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Magnetic } from '@/components/ui/Magnetic'

export function Navbar() {
  const pathname = usePathname()

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
      className="fixed top-0 left-0 w-full z-50 px-6 py-6 sm:px-12 flex justify-between items-center text-xs sm:text-sm tracking-widest uppercase text-white/80 bg-[#050505]/30 backdrop-blur-md"
    >
      <div className="flex gap-6 sm:gap-12">
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

      <Magnetic>
        <Link 
          href="/" 
          aria-label="SANSKAR"
          className="relative group py-2 px-6 flex items-center justify-center select-none cursor-pointer"
        >
          {/* Ambient Center of Attraction Cyan Glow */}
          <div className="absolute inset-0 bg-cyan-500/15 rounded-full blur-xl opacity-60 group-hover:opacity-100 group-hover:bg-cyan-400/25 transition-all duration-500" />
          
          {/* Fierce Cat Claw Scratch Slashes Overlay (3 Curved Tapered Claw Slash Lines) */}
          <svg 
            className="absolute -inset-x-4 -inset-y-2 w-[130%] h-[160%] pointer-events-none transition-all duration-300 transform group-hover:scale-105"
            viewBox="0 0 160 50"
            fill="none"
          >
            {/* 3 Electric Cyan & White Cat Claw Scratches */}
            <path 
              d="M 12 42 C 45 28 95 18 148 6" 
              className="stroke-white/90 group-hover:stroke-cyan-300 transition-colors duration-300"
              strokeWidth="2.8" 
              strokeLinecap="round" 
            />
            <path 
              d="M 20 46 C 55 30 105 20 154 9" 
              className="stroke-cyan-400 group-hover:stroke-cyan-200 transition-colors duration-300"
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
            <path 
              d="M 30 48 C 65 32 115 22 158 12" 
              className="stroke-white/80 group-hover:stroke-cyan-300 transition-colors duration-300"
              strokeWidth="1.6" 
              strokeLinecap="round" 
            />

            {/* Micro Scratch Sparks */}
            <path d="M 52 26 L 56 21" stroke="currentColor" className="stroke-cyan-300" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 98 16 L 102 11" stroke="currentColor" className="stroke-cyan-300" strokeWidth="1.2" strokeLinecap="round" />
          </svg>

          {/* Wild & Elegant Scratched SANSKAR Typography */}
          <span className="relative z-10 font-extrabold text-2xl sm:text-3xl tracking-[0.22em] uppercase bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:via-white group-hover:to-cyan-300 transition-all duration-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            SANSKAR
          </span>
        </Link>
      </Magnetic>

      <div className="flex gap-6 sm:gap-12">
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
    </motion.nav>
  )
}
