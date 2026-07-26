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
          className="relative group py-2 px-6 flex items-center justify-center select-none cursor-pointer transform -skew-x-12"
        >
          {/* Ambient Crimson/Magenta Glow behind text */}
          <div className="absolute inset-0 bg-[#ff0055]/20 rounded-full blur-xl opacity-70 group-hover:opacity-100 group-hover:bg-[#ff0055]/40 transition-all duration-500" />
          
          {/* Jagged Cat Claw Slash Overlay across the text */}
          <svg 
            className="absolute -inset-x-8 -inset-y-4 w-[140%] h-[180%] pointer-events-none stroke-[#ff0055] transition-all duration-300 transform group-hover:scale-105 group-hover:stroke-[#ff2a75] group-hover:drop-shadow-[0_0_15px_rgba(255,0,85,0.95)]"
            viewBox="0 0 200 60"
            fill="none"
          >
            {/* Multi-stroke Jagged Cat Claw Slashes */}
            <path d="M 8 52 L 35 12 M 25 55 L 55 10 M 45 54 L 75 8 M 70 56 L 105 6 M 98 52 L 128 10 M 122 55 L 152 8 M 145 54 L 180 6" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
            <path d="M 10 48 C 50 30 110 18 185 6" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" strokeDasharray="14 4 8 2" />
            <path d="M 18 52 C 60 32 120 20 192 8" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" strokeDasharray="18 6 6 3" />
          </svg>

          {/* Scratched Crimson & White SANSKAR Typography */}
          <span 
            className="font-scratchy relative z-10 text-2xl sm:text-4xl tracking-[0.12em] uppercase text-[#ff0055] group-hover:text-[#ff3377] transition-all duration-300 font-black"
            style={{
              textShadow: '0 0 12px rgba(255, 0, 85, 0.9), 0 0 25px rgba(255, 0, 85, 0.5), 2px 2px 0px #000',
            }}
          >
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
