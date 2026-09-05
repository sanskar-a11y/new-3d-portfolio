'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

export function ContactClient() {
  const [copied, setCopied] = useState(false)
  const email = 'sanskarsharma923@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <main
      className="relative min-h-screen w-full pt-28 sm:pt-36 pb-24 sm:pb-36 bg-[var(--col-black)] text-[var(--col-white)] antialiased overflow-hidden"
      style={{ fontFamily: 'var(--font-syne), sans-serif' }}
    >
      {/* 3D Liquid Wave Shader Background */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        <AboutBackground />
      </div>

      {/* Main Content Container — Zero Boxes */}
      <div className="relative z-[15] max-w-6xl mx-auto px-5 sm:px-10 lg:px-20 flex flex-col gap-16 sm:gap-28">
        
        {/* 01. Hero Header */}
        <section className="flex flex-col gap-6 sm:gap-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-blue)] animate-pulse" />
            <p
              className="uppercase text-[11px]"
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                letterSpacing: '0.22em',
                color: 'var(--col-blue)',
              }}
            >
              Contact // Inquiries
            </p>
          </motion.div>

          <h1 className="text-[clamp(2.2rem,6vw,5.5rem)] font-extralight leading-[1.02] tracking-tighter text-white">
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
              className="block text-white/75 font-thin italic mt-1"
            >
              remarkable.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg font-light text-white/85 leading-[1.8] max-w-2xl mt-2"
          >
            Whether you need modern web engineering, full-stack software, creative coding, or cinematic visual direction — I&apos;m ready to hunt for the right solution.
          </motion.p>
        </section>

        {/* 02. Direct Email — Large Interactive Typography */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 border-t border-white/[0.12] pt-14 sm:pt-24">
          <div className="lg:col-span-3">
            <span className="uppercase text-[0.6875rem] sticky top-32 block" style={{ fontFamily: 'var(--font-space-mono), monospace', letterSpacing: '0.22em', color: 'var(--col-blue)' }}>
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
                className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight text-white hover:text-white/85 transition-colors leading-tight break-all sm:break-normal"
              >
                {email}
              </a>

              <div className="flex items-center gap-6 pt-3">
                <button
                  onClick={copyEmail}
                  className="link-sweep group relative inline-flex items-center gap-2 uppercase py-1 cursor-pointer transition-opacity duration-300 opacity-70 hover:opacity-100"
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: 'max(12px, 0.75rem)',
                    letterSpacing: '0.2em',
                    color: 'var(--col-white)',
                  }}
                >
                  <span>{copied ? '✓ Copied to clipboard' : 'Copy Email'}</span>
                </button>

                <a
                  href={`mailto:${email}`}
                  className="link-sweep group relative inline-flex items-center gap-2 uppercase py-1 transition-opacity duration-300 opacity-70 hover:opacity-100"
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: 'max(12px, 0.75rem)',
                    letterSpacing: '0.2em',
                    color: 'var(--col-white)',
                  }}
                >
                  <span>Send Mail ↗</span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 03. Directory & Channels — Clean Typographic Rows */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 border-t border-white/[0.12] pt-16 sm:pt-24">
          <div className="lg:col-span-3">
            <span className="uppercase text-[0.6875rem] sticky top-32 block" style={{ fontFamily: 'var(--font-space-mono), monospace', letterSpacing: '0.22em', color: 'var(--col-blue)' }}>
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
                    className={`group flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-4 border-b border-white/[0.1] transition-colors ${
                      item.href ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-white/70">
                        {item.category}
                      </span>
                      <h2 className="text-lg sm:text-xl font-light text-white group-hover:text-white/90 transition-colors flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.href && (
                          <span className="text-xs text-white/60 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            ↗
                          </span>
                        )}
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm font-light text-white/80 group-hover:text-white transition-colors mt-1 sm:mt-0">
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
