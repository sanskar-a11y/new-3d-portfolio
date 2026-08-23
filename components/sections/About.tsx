'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

const SKILL_GROUPS = [
  {
    category: 'Frontend & Creative Web',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'Three.js / WebGL', 'Framer Motion', 'HTML5 / CSS3'],
  },
  {
    category: 'AI, Automation & Systems',
    skills: ['Python', 'AI APIs', 'Prompt Engineering', 'Automation Pipelines', 'Firebase', 'Firestore', 'Vercel', 'Git & GitHub'],
  },
  {
    category: 'Visual & Creative Media',
    skills: ['Video Editing', 'Motion Graphics', 'High-CTR Thumbnails', 'Sound Design', 'Storytelling', 'Color Grading'],
  },
  {
    category: 'Core Disciplines',
    skills: ['Problem Solving', 'Human Behavior & Psychology', 'Rapid Prototyping', 'System Architecture', 'Product Design'],
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

  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <div ref={container} className="relative w-full text-white px-5 sm:px-10 lg:px-16 py-16 sm:py-24 max-w-6xl mx-auto flex flex-col gap-20 sm:gap-24">
      
      {/* 01: Hook & Core Manifesto */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 01 // MANIFESTO ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
            I don&apos;t just build. I hunt for the answer.
          </h2>
        </div>

        <motion.div style={{ y }} className="md:col-span-8 flex flex-col gap-6 text-white/85 text-base sm:text-lg leading-relaxed font-light">
          <p className="text-lg sm:text-2xl font-light text-white leading-relaxed">
            I&apos;m <span className="font-bold text-white">Sanskar</span>, a developer, problem solver, and relentless learner who likes turning curiosity into something real.
          </p>

          <p>
            I have never been very good at accepting <span className="italic text-white">“that&apos;s just how it works.”</span>
          </p>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col gap-2">
            <p className="font-mono text-xs sm:text-sm text-white/90 leading-relaxed">
              If something catches my attention, I investigate it.<br/>
              If I don&apos;t understand it, I learn it.<br/>
              If something can be built better, I rebuild it.<br/>
              And if there&apos;s a problem standing between me and the result, I keep pulling it apart until I find the way through.
            </p>
          </div>

          <p>
            That mindset is what pulled me into technology. I started with the fundamentals of programming and web development, then moved deeper into <span className="font-semibold text-white">Python, JavaScript, AI, automation, modern web technologies, APIs, databases, and creative digital experiences</span>. I&apos;m especially interested in the space where software stops being static and starts becoming intelligent, automated, and alive.
          </p>
        </motion.div>
      </section>

      {/* 02: Methodology - Stalking the Problem */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 02 // METHODOLOGY ]
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight">
            I observe before I move.
          </h2>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 text-white/80 text-base sm:text-lg leading-relaxed font-light">
          <p>
            One thing I value more than writing code is <span className="font-bold text-white">understanding the problem behind the code</span>.
          </p>
          <p>
            I like watching how people interact with a product, where a process breaks, what wastes time, what could be automated, and what nobody has thought about yet.
          </p>

          <blockquote className="p-6 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-md flex flex-col gap-3">
            <div className="font-mono text-sm sm:text-base font-bold tracking-widest uppercase text-white">
              Observe. Understand. Adapt. Execute.
            </div>
            <p className="text-sm sm:text-base text-white/70 italic leading-relaxed">
              “Like a cat stalking its target, I don&apos;t need to rush toward every opportunity. I watch. I learn the environment. I find the weak point. Then I move.”
            </p>
          </blockquote>
        </div>
      </section>

      {/* 03: Experimentation & Creation */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 03 // CRAFT ]
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight">
            I build what I want to see exist.
          </h2>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 text-white/80 text-base sm:text-lg leading-relaxed font-light">
          <p>
            My projects are where experimentation turns into something tangible. I&apos;ve worked across <span className="font-bold text-white">web development, AI-assisted development, automation, interactive interfaces, creative coding, and digital experiences</span>, constantly experimenting with new tools and approaches.
          </p>
          <p>
            Sometimes I&apos;m trying to solve a practical business problem. Sometimes I&apos;m building something simply because I want to know whether I can.
          </p>
          <p>
            And sometimes the most interesting projects begin with a completely unreasonable question:
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            “What if I actually built this?”
          </p>
          <p className="text-white/60 text-sm font-mono">
            That&apos;s usually where things get interesting.
          </p>
        </div>
      </section>

      {/* 04: Chasing Capability */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 04 // AMBITION ]
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight">
            I&apos;m not chasing a title. I&apos;m chasing capability.
          </h2>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 text-white/80 text-base sm:text-lg leading-relaxed font-light">
          <p>
            I want to become the kind of person who can walk into an unfamiliar problem and figure it out.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-white/50 block mb-1">A new framework?</span>
              <span className="text-white font-bold">I&apos;ll learn it.</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-white/50 block mb-1">A system I&apos;ve never touched?</span>
              <span className="text-white font-bold">I&apos;ll understand it.</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-white/50 block mb-1">A business process that takes hours?</span>
              <span className="text-white font-bold">I&apos;ll look for a way to automate it.</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-white/50 block mb-1">A problem nobody knows how to solve?</span>
              <span className="text-white font-bold">Give me some time.</span>
            </div>
          </div>
          <p className="text-white/90">
            I don&apos;t expect to know everything. I expect to be able to <span className="font-bold text-white">learn whatever I need next.</span>
          </p>
        </div>
      </section>

      {/* 05: Technology vs Mind & Never Stopping the Hunt */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 05 // PERSPECTIVE ]
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight">
            Technology is only the weapon.
          </h2>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 text-white/80 text-base sm:text-lg leading-relaxed font-light">
          <p className="text-lg sm:text-xl text-white font-normal">
            The real advantage is the mind using it.
          </p>
          <p>
            That&apos;s why my interests extend beyond code. I&apos;m fascinated by <span className="font-semibold text-white">psychology, human behavior, AI, automation, design, systems, and the way people make decisions</span>.
          </p>
          <p>
            Understanding technology lets me build things. Understanding people lets me build things that actually matter. And understanding both creates a much bigger playground.
          </p>
          <p>
            I&apos;m still early. And I&apos;m completely fine with that. I&apos;m building my skills, working on real projects, making mistakes, breaking things, fixing them, and learning faster with every iteration.
          </p>
          <p className="text-white/90">
            I don&apos;t want my portfolio to tell you that I&apos;m already the best. I&apos;d rather it show you <span className="font-bold text-white">how far I&apos;m willing to go to become better.</span> Because I&apos;m not building a career around knowing everything. I&apos;m building one around <span className="font-bold text-white underline decoration-white/30 underline-offset-8">never stopping the hunt for what&apos;s next.</span>
          </p>
        </div>
      </section>

      {/* 06: Technical Stack & Tooling */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 06 // EXPERTISE ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Skills & Technical Stack
          </h2>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SKILL_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <h3 className="font-mono text-xs font-bold tracking-widest uppercase text-white/90 mb-3">
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

      {/* 07: Credentials & Honors */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-white/10">
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="font-mono text-xs text-white/80 font-bold tracking-widest uppercase">
            [ 07 // CREDENTIALS ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Certificates & Honors
          </h2>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CERTIFICATES.map((cert, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/40 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] font-bold text-white/90 border border-white/30 bg-white/10 px-2 py-0.5 rounded-full tracking-widest uppercase">
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

      {/* 08: Final Mantra & Direct Links Call to Action */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.06] to-transparent border border-white/15 text-center flex flex-col items-center gap-6">
        <div className="font-mono text-xs tracking-widest uppercase text-white/60">
          [ CORE MANTRA ]
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight max-w-3xl">
          Observe. Learn. Build. Adapt.<br/>
          <span className="text-white/70">Then go after the next target.</span>
        </h2>
        
        <p className="text-white/60 font-mono text-xs sm:text-sm max-w-xl">
          Available for freelance web engineering, full-stack builds, creative coding, video editing, and high-CTR thumbnail strategy.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/contact"
            className="px-8 py-3 rounded-full bg-white hover:bg-white/90 text-black font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            Get In Touch
          </Link>
          <a
            href="https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200"
          >
            Fiverr Profile
          </a>
          <a
            href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/sanskar-a11y"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200"
          >
            GitHub
          </a>
        </div>
      </section>

    </div>
  )
}

