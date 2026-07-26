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
          className="relative group p-1 flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
          {/* Subtle ambient cyan glow behind logo on hover */}
          <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* White Cat Head Vector Logo (Inverted White Style from User Image) */}
          <svg 
            className="w-8 h-8 text-white transition-all duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" 
            viewBox="0 0 100 100"
          >
            {/* White Cat Head Base Silhouette */}
            <path 
              d="M 24 35 C 21 20 27 12 27 12 C 33 20 38 25 41 25 C 44 23.5 56 23.5 59 25 C 62 25 67 20 73 12 C 73 12 79 20 76 35 C 82 43 82 56 77 64 C 70 74 50 82 50 82 C 50 82 30 74 23 64 C 18 56 18 43 24 35 Z" 
              fill="currentColor" 
            />

            {/* Inner Ear Cutouts */}
            <polygon points="31,21 37,25 33,32" fill="#050505" />
            <polygon points="69,21 63,25 67,32" fill="#050505" />

            {/* 3 Forehead Stripes */}
            <path d="M 45 23 C 45.5 28 45.8 33 46 38 H 47.5 C 47.3 33 47 28 46.5 23 Z" fill="#050505" />
            <path d="M 49 22 C 49.5 28 49.8 35 50 41 H 52 C 51.8 35 51.5 28 51 22 Z" fill="#050505" />
            <path d="M 54.5 23 C 54 28 53.7 33 53.5 38 H 55 C 55.2 33 55.5 28 56 23 Z" fill="#050505" />

            {/* Sharp Almond Eyes */}
            <path d="M 33 45 C 37 40 44 44 45 47.5 C 41 49.5 35 48 33 45 Z" fill="#050505" />
            <path d="M 67 45 C 63 40 56 44 55 47.5 C 59 49.5 65 48 67 45 Z" fill="#050505" />
            
            {/* White Eye Pupils */}
            <polygon points="38,44 42,45 40,47" fill="currentColor" />
            <polygon points="62,44 58,45 60,47" fill="currentColor" />

            {/* Cheekbone Cuts */}
            <path d="M 43.5 48.5 L 42 56 L 40.5 55 Z" fill="#050505" />
            <path d="M 56.5 48.5 L 58 56 L 59.5 55 Z" fill="#050505" />

            {/* Triangular Nose & Curved Mouth */}
            <polygon points="50,60.5 46.5,56.5 53.5,56.5" fill="#050505" />
            <path d="M 50 60.5 C 46.5 63 42 62.5 40 60" stroke="#050505" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 50 60.5 C 53.5 63 58 62.5 60 60" stroke="#050505" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* 3 Muzzle Whiskers on Left & Right */}
            <path d="M 23 54 L 38 57" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
            <path d="M 21 59 L 37 60.5" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
            <path d="M 23 64 L 38 63.5" stroke="#050505" strokeWidth="2" strokeLinecap="round" />

            <path d="M 77 54 L 62 57" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
            <path d="M 79 59 L 63 60.5" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
            <path d="M 77 64 L 62 63.5" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
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
