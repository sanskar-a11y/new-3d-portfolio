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
          
          {/* Playboy-Style Cat Head Silhouette Logo with Bowtie */}
          <svg 
            className="w-7 h-7 text-white fill-current transition-all duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" 
            viewBox="0 0 24 24"
          >
            {/* Playboy Style Cat Head Silhouette with Almond Eye Cutout */}
            <path 
              d="M 11.2,1.8 C 10.8,1.0 9.6,1.1 9.4,2.0 C 8.5,5.9 8.7,9.2 9.8,11.9 C 8.2,13.5 7.2,15.6 7.2,18.0 C 7.2,21.9 10.1,24.5 14.2,24.5 C 18.3,24.5 21.2,21.9 21.2,18.0 C 21.2,15.6 20.2,13.5 18.6,11.9 C 19.7,9.2 19.9,5.9 19.0,2.0 C 18.8,1.1 17.6,1.0 17.2,1.8 C 15.6,5.0 14.8,7.9 14.2,9.8 C 13.6,7.9 12.8,5.0 11.2,1.8 Z M 11.8,15.8 C 12.6,15.8 13.2,16.5 13.2,17.3 C 13.2,18.1 12.6,18.8 11.8,18.8 C 11.0,18.8 10.4,18.1 10.4,17.3 C 10.4,16.5 11.0,15.8 11.8,15.8 Z" 
              fillRule="evenodd" 
            />
            
            {/* Iconic Playboy Bowtie */}
            <path 
              d="M 10.5,22.8 L 14.2,23.8 L 10.5,24.8 Z M 17.9,22.8 L 14.2,23.8 L 17.9,24.8 Z M 14.2,23.3 C 14.6,23.3 14.9,23.5 14.9,23.8 C 14.9,24.1 14.6,24.3 14.2,24.3 C 13.8,24.3 13.5,24.1 13.5,23.8 C 13.5,23.5 13.8,23.3 14.2,23.3 Z" 
            />
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
