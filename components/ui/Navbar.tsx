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
          
          {/* Sharp Edgy Low-Poly Cat Head Vector Logo */}
          <svg 
            className="w-8 h-8 text-white transition-all duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" 
            viewBox="0 0 100 100"
          >
            {/* Razor-Sharp Angular Cat Head Base Polygon */}
            <polygon 
              points="50,84 22,66 18,45 25,32 28,12 40,24 50,22 60,24 72,12 75,32 82,45 78,66" 
              fill="currentColor" 
            />

            {/* Sharp Inner Ear Cutouts */}
            <polygon points="31,18 38,25 31,28" fill="#050505" />
            <polygon points="69,18 62,25 69,28" fill="#050505" />

            {/* 3 Sharp Triangular Forehead Stripes */}
            <polygon points="46,23 47.5,23 47,36 45.5,36" fill="#050505" />
            <polygon points="49.5,22 50.5,22 51.5,40 48.5,40" fill="#050505" />
            <polygon points="52.5,23 54,23 54.5,36 53,36" fill="#050505" />

            {/* Razor-Sharp Angular Diamond Eyes */}
            <polygon points="32,44 44,40 46,47 34,49" fill="#050505" />
            <polygon points="68,44 56,40 54,47 66,49" fill="#050505" />
            
            {/* Eye Pupil Highlights */}
            <polygon points="38,43 43,42 41,46" fill="currentColor" />
            <polygon points="62,43 57,42 59,46" fill="currentColor" />

            {/* Edgy Cheekbone Facet Cuts */}
            <polygon points="43,48.5 41.5,56 39.5,54" fill="#050505" />
            <polygon points="57,48.5 58.5,56 60.5,54" fill="#050505" />

            {/* Sharp Triangular Nose & Angular Mouth */}
            <polygon points="50,60 46.5,55 53.5,55" fill="#050505" />
            <polyline points="40,59 50,61 60,59" stroke="#050505" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />

            {/* Sharp Straight Whiskers */}
            <line x1="20" y1="52" x2="37" y2="56" stroke="#050505" strokeWidth="2" strokeLinecap="square" />
            <line x1="18" y1="58" x2="36" y2="60" stroke="#050505" strokeWidth="2" strokeLinecap="square" />
            <line x1="20" y1="64" x2="37" y2="63" stroke="#050505" strokeWidth="2" strokeLinecap="square" />

            <line x1="80" y1="52" x2="63" y2="56" stroke="#050505" strokeWidth="2" strokeLinecap="square" />
            <line x1="82" y1="58" x2="64" y2="60" stroke="#050505" strokeWidth="2" strokeLinecap="square" />
            <line x1="80" y1="64" x2="63" y2="63" stroke="#050505" strokeWidth="2" strokeLinecap="square" />
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
