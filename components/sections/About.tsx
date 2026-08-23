'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

const TIMELINE = [
  { year: '2023', title: 'Diploma in Computer Science', org: 'Sanskriti University', desc: 'Commenced foundational computer science, algorithmics, and core software engineering.' },
  { year: '2025', title: 'Digital Learning Platform (PWA)', org: 'React.js + Firebase', desc: 'Architected offline-capable PWA with Firebase Auth, Firestore, and AI-prompt workflows.' },
  { year: '2025', title: 'National Hackathon Team Leader', org: 'COER University', desc: 'Led a cross-functional team in high-pressure rapid prototyping and live product presentation.' },
  { year: '2026', title: 'AI Productivity Suite', org: 'Next.js + AI Tooling', desc: 'Engineering next-generation workflow and context automation pipelines.' },
  { year: '2026', title: 'CS Graduation', org: 'Sanskriti University', desc: 'Completing final-semester degree with focus on full-stack web and creative media.' },
]

const SKILL_GROUPS = [
  {
    category: 'Frontend & Creative Web',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'Bootstrap', 'Three.js / WebGL', 'HTML5 / CSS3'],
  },
  {
    category: 'Backend & Cloud',
    skills: ['Firebase', 'Firestore', 'Vercel', 'Netlify', 'GitHub', 'Linux Basics'],
  },
  {
    category: 'Programming Languages',
    skills: ['JavaScript', 'TypeScript', 'Python', 'C'],
  },
  {
    category: 'Visual & Creative Direction',
    skills: ['Video Editing', 'Motion Graphics', 'Thumbnail Design', 'Sound Design', 'Prompt Engineering', 'PWA Development'],
  },
]

const CERTIFICATES = [
  {
    title: 'AI & Generative AI Internship',
    issuer: 'YBI Foundation',
    badge: 'AI / LLM',
  },
  {
    title: 'Introduction to Modern AI',
    issuer: 'Cisco',
    badge: 'Foundations',
  },
  {
    title: 'Computer Hardware Basics',
    issuer: 'Cisco',
    badge: 'Hardware',
  },
  {
    title: 'AI Workshop',
    issuer: 'Sanskriti University',
    badge: 'Applied AI',
  },
]

export function About() {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <div ref={container} className="relative w-full text-white px-5 sm:px-10 lg:px-16 py-16 sm:py-24 max-w-6xl mx-auto flex flex-col gap-24">
      
      {/* 01: Hero Intro */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
            [ 01 // IDENTITY ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            The person behind the work.
          </h2>
        </div>

        <motion.div style={{ y }} className="md:col-span-8 flex flex-col gap-6">
          <p className="text-lg sm:text-2xl font-light text-white/90 leading-relaxed">
            I&apos;m <span className="font-bold text-white">Sanskar Sharma</span>, a final-semester Computer Science student from Uttar Pradesh, India. I build web apps, edit videos, and design thumbnails — and I care deeply about making things that look and feel premium.
          </p>

          <blockquote className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <p className="italic text-base sm:text-lg text-cyan-200/90 leading-relaxed font-light">
              “I treat every project like a product launch. Clean structure, premium feel, no shortcuts.”
            </p>
            <footer className="mt-3 text-xs font-mono tracking-widest uppercase text-white/40">
              — Sanskar // Creative Developer & Storyteller
            </footer>
          </blockquote>
        </motion.div>
      </section>

      {/* 02: Journey Timeline */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
            [ 02 // JOURNEY ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Timeline & Milestones
          </h2>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-cyan-400 via-cyan-400/30 to-transparent" />
          
          {TIMELINE.map((item, idx) => (
            <div key={idx} className="flex items-start gap-5 relative pl-2">
              <div className="w-5 h-5 rounded-full border-2 border-cyan-400 bg-[#080810] flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(0,240,255,0.6)]">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <div className="flex flex-col gap-1 pb-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                    {item.year}
                  </span>
                  <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
                    {item.org}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed font-mono">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03: Skills & Tooling */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
            [ 03 // EXPERTISE ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Skills & Technical Stack
          </h2>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SKILL_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
            >
              <h3 className="font-mono text-xs font-bold tracking-widest uppercase text-cyan-400 mb-3">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04: Certificates */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
            [ 04 // CREDENTIALS ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Certificates & Honors
          </h2>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CERTIFICATES.map((cert, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-950/10 transition-all duration-300 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] font-bold text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 rounded-full tracking-widest uppercase">
                  {cert.badge}
                </span>
                <svg className="w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-snug">
                  {cert.title}
                </h3>
                <p className="text-xs font-mono text-white/50 mt-1">
                  {cert.issuer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05: Call to Action */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/15 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Want to collaborate on your next project?
        </h2>
        <p className="text-white/60 font-mono text-sm max-w-xl">
          Available for freelance web development, full-stack builds, high-CTR thumbnail design, and visual storytelling.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-8 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            Get In Touch
          </Link>
          <a
            href="https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200"
          >
            Order On Fiverr
          </a>
        </div>
      </section>

    </div>
  )
}

