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
        <Link href="/" className="font-bold text-xl tracking-tighter text-white">
          YA
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
