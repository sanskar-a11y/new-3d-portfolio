'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const email = 'sanskarsharma923@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <main className="relative min-h-screen w-full pt-32 pb-24 px-6 sm:px-12 flex flex-col justify-center max-w-6xl mx-auto">
      <div className="flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase">
              AVAILABLE FOR NEW PROJECTS // 2026
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
            Let&apos;s build something <span className="text-cyan-400">remarkable.</span>
          </h1>
          <p className="text-base sm:text-xl text-white/60 font-light max-w-2xl">
            Whether you need a high-performance web application, full-stack React PWA, cinematic video cut, or high-CTR thumbnail assets — my inbox is open.
          </p>
        </div>

        {/* Primary Email Direct Copy Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
              DIRECT INBOX
            </span>
            <a
              href={`mailto:${email}`}
              className="text-lg sm:text-2xl font-mono font-bold text-white hover:text-cyan-400 transition-colors"
            >
              {email}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyEmail}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200"
            >
              {copied ? '✓ COPIED' : 'COPY EMAIL'}
            </button>
            <a
              href={`mailto:${email}`}
              className="px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              SEND MAIL
            </a>
          </div>
        </div>

        {/* Social / Work Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Fiverr */}
          <a 
            href="https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between gap-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
                [ FREELANCE // SERVICES ]
              </span>
              <svg className="w-4 h-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Fiverr Profile</h2>
              <p className="text-xs font-mono text-white/50">Hire for Video Editing & Thumbnails</p>
            </div>
          </a>

          {/* LinkedIn */}
          <a 
            href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between gap-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
                [ NETWORK // CAREER ]
              </span>
              <svg className="w-4 h-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">LinkedIn</h2>
              <p className="text-xs font-mono text-white/50">Sanskar Sharma</p>
            </div>
          </a>

          {/* GitHub */}
          <a 
            href="https://github.com/sanskar-a11y" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between gap-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
                [ SOURCE // REPOSITORIES ]
              </span>
              <svg className="w-4 h-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">GitHub</h2>
              <p className="text-xs font-mono text-white/50">@sanskar-a11y</p>
            </div>
          </a>

        </div>

      </div>
    </main>
  )
}


