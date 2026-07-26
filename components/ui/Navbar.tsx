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
          aria-label="Home"
          className="relative group p-1.5 flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
          {/* Subtle ambient glow behind logo */}
          <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Elegant Cyber Cat SVG Logo */}
          <svg 
            className="w-7 h-7 text-white stroke-current fill-none transition-all duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
            viewBox="0 0 32 32" 
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sleek Pointed Ears & Face Outline */}
            <path d="M 5 12 L 10 3 L 15 9 L 17 9 L 22 3 L 27 12 C 29 16 28 22 24 26 C 20 29 12 29 8 26 C 4 22 3 16 5 12 Z" />
            
            {/* Inner Ear Structural Facets */}
            <path d="M 10 3 L 14 9" strokeWidth="1.2" opacity="0.5" />
            <path d="M 22 3 L 18 9" strokeWidth="1.2" opacity="0.5" />
            
            {/* Sharp Almond Eyes */}
            <polygon points="8.5,14.5 13.5,12.5 12.5,16" fill="currentColor" stroke="none" />
            <polygon points="23.5,14.5 18.5,12.5 19.5,16" fill="currentColor" stroke="none" />
            
            {/* Nose & Muzzle */}
            <polygon points="16,19 14.5,17.5 17.5,17.5" fill="currentColor" stroke="none" />
            <path d="M 16 19 L 16 21" strokeWidth="1.4" />
            
            {/* Whisker Details */}
            <path d="M 4 17 L 10 18" opacity="0.8" />
            <path d="M 4 20 L 10 20" opacity="0.8" />
            <path d="M 28 17 L 22 18" opacity="0.8" />
            <path d="M 28 20 L 22 20" opacity="0.8" />
          </svg>
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
