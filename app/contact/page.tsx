'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import dynamic from 'next/dynamic'

const AboutBackground = dynamic(
  () => import('@/components/canvas/AboutBackground').then((mod) => mod.AboutBackground),
  { ssr: false }
)

const CHANNELS = [
  {
    category: 'Freelance & Services',
    title: 'Fiverr Profile',
    desc: 'Video Editing, Motion Graphics & Visual Direction',
    href: 'https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile',
  },
  {
    category: 'Professional Network',
    title: 'LinkedIn',
    desc: 'Sanskar Sharma',
    href: 'https://www.linkedin.com/in/sanskar-sharma-b5830433a/',
  },
  {
    category: 'Source Code & Systems',
    title: 'GitHub',
    desc: '@sanskar-a11y',
    href: 'https://github.com/sanskar-a11y',
  },
  {
    category: 'Presence',
    title: 'Location & Availability',
    desc: 'India · Available Worldwide (Remote)',
    href: null,
  },
]

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const email = 'sanskarsharma923@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <main
      className="relative min-h-screen w-full pt-28 sm:pt-36 pb-24 sm:pb-36 bg-[#0a0a0a] text-white antialiased selection:bg-white selection:text-black overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* 3D Liquid Wave Shader Background */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        <AboutBackground />
      </div>

      {/* Main Content Container — Zero Boxes */}
      <div className="relative z-[15] max-w-6xl mx-auto px-6 sm:px-14 lg:px-24 flex flex-col gap-20 sm:gap-32">
        
        {/* 01. Hero Header */}
        <section className="flex flex-col gap-6 sm:gap-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <p className="uppercase tracking-[0.3em] text-white/50 text-[11px] font-light">
              Contact // Inquiries
            </p>
          </motion.div>

          <h1 className="text-[clamp(2.4rem,6vw,5.5rem)] font-extralight leading-[1.02] tracking-tighter text-white">
            <motion.span
              initial={{ opacity: 0, y: 35, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.95, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Let&apos;s build something
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 35, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.95, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white/40 font-thin italic mt-1"
            >
              remarkable.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg font-light text-white/60 leading-[1.8] max-w-2xl mt-2"
          >
            Whether you need modern web engineering, full-stack software, creative coding, or cinematic visual direction — I&apos;m ready to hunt for the right solution.
          </motion.p>
        </section>

        {/* 02. Direct Email — Large Interactive Typography */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 border-t border-white/[0.08] pt-16 sm:pt-24">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Direct Inbox
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3"
            >
              <a
                href={`mailto:${email}`}
                className="text-2xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white hover:text-white/75 transition-colors leading-tight"
              >
                {email}
              </a>

              <div className="flex items-center gap-6 pt-3">
                <button
                  onClick={copyEmail}
                  className="group relative inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-light text-white/60 hover:text-white transition-colors duration-300 py-1"
                >
                  <span>{copied ? '✓ Copied to clipboard' : 'Copy Email'}</span>
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/40 group-hover:bg-white transition-colors" />
                </button>

                <a
                  href={`mailto:${email}`}
                  className="group relative inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-light text-white/60 hover:text-white transition-colors duration-300 py-1"
                >
                  <span>Send Mail ↗</span>
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/40 group-hover:bg-white transition-colors" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 03. Directory & Channels — Clean Typographic Rows */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 border-t border-white/[0.08] pt-16 sm:pt-24">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Channels
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            {CHANNELS.map((item, idx) => {
              const ItemWrapper = item.href ? 'a' : 'div'
              const extraProps = item.href
                ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                : {}

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ItemWrapper
                    {...extraProps}
                    className={`group flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-4 border-b border-white/[0.06] transition-colors ${
                      item.href ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-white/35">
                        {item.category}
                      </span>
                      <h2 className="text-lg sm:text-xl font-light text-white group-hover:text-white/80 transition-colors flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.href && (
                          <span className="text-xs text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            ↗
                          </span>
                        )}
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm font-light text-white/50 group-hover:text-white/70 transition-colors mt-1 sm:mt-0">
                      {item.desc}
                    </p>
                  </ItemWrapper>
                </motion.div>
              )
            })}
          </div>
        </section>

      </div>
    </main>
  )
}
