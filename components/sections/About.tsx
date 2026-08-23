'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'

/* ─── Data ─── */

const CAPABILITIES = [
  'React.js',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Three.js / WebGL',
  'Framer Motion',
  'Python',
  'AI & Automation',
  'Firebase',
  'GSAP',
  'Prompt Engineering',
  'Video Editing',
  'Motion Graphics',
  'Sound Design',
]

const CERTIFICATES = [
  { title: 'AI & Generative AI Internship', org: 'YBI Foundation', badge: 'AI / LLM' },
  { title: 'Introduction to Modern AI', org: 'Cisco', badge: 'Foundations' },
  { title: 'Computer Hardware Basics', org: 'Cisco', badge: 'Hardware' },
  { title: 'AI Workshop', org: 'Sanskriti University', badge: 'Applied AI' },
]

/* ─── Animated Reveal Block ─── */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function About() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start'],
  })

  const yHero = useTransform(scrollYProgress, [0, 0.4], [0, -50])
  const yParallax = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <div
      ref={container}
      className="relative w-full text-white antialiased selection:bg-white selection:text-black"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ═══════════════════════════════════════════════
          01. HERO — Name & Opening Hook
      ═══════════════════════════════════════════════ */}
      <section className="min-h-[75vh] flex flex-col justify-end px-6 sm:px-12 lg:px-24 pb-16 sm:pb-24">
        <motion.div style={{ y: yHero }} className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <p className="uppercase tracking-[0.25em] text-white/50 text-[11px] sm:text-xs font-light">
              Profile // Sanskar
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.2rem,6vw,5rem)] font-extralight leading-[1.08] tracking-tight text-white"
          >
            I don&apos;t just build.
            <br />
            <span className="text-white/40 font-thin italic">I hunt for the answer.</span>
          </motion.h1>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          02. MANIFESTO — Core Identity
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 01 // IDENTITY ]
            </span>
          </Reveal>

          <motion.div style={{ y: yParallax }} className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            <Reveal>
              <p className="text-lg sm:text-2xl font-light text-white/90 leading-[1.6]">
                I&apos;m <span className="text-white font-medium underline decoration-white/20 underline-offset-4">Sanskar</span>, a developer, problem solver, and relentless learner who likes turning curiosity into something real.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-base sm:text-lg font-light text-white/70 leading-[1.8]">
                I have never been very good at accepting <span className="text-white italic">“that&apos;s just how it works.”</span>
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm space-y-2">
                <p className="text-sm sm:text-base font-light text-white/80 leading-[1.8]">
                  If something catches my attention, I investigate it.<br />
                  If I don&apos;t understand it, I learn it.<br />
                  If something can be built better, I rebuild it.<br />
                  And if there&apos;s a problem standing between me and the result, I keep pulling it apart until I find the way through.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9]">
                That mindset is what pulled me into technology. I started with the fundamentals of programming and web development, then moved deeper into <span className="text-white/85">Python, JavaScript, AI, automation, modern web technologies, APIs, databases, and creative digital experiences</span>. I&apos;m especially interested in the space where software stops being static and starts becoming intelligent, automated, and alive.
              </p>
            </Reveal>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          03. METHODOLOGY — Observe Before I Move
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 02 // METHOD ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            <Reveal>
              <h2 className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight">
                I observe before I move.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                One thing I value more than writing code is <span className="text-white font-normal">understanding the problem behind the code</span>. I like watching how people interact with a product, where a process breaks, what wastes time, what could be automated, and what nobody has thought about yet.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <blockquote className="p-6 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm space-y-3">
                <div className="text-xs font-mono uppercase tracking-[0.25em] text-white/90 font-bold">
                  Observe · Understand · Adapt · Execute
                </div>
                <p className="text-sm sm:text-base font-light text-white/65 italic leading-[1.8]">
                  “Like a cat stalking its target, I don&apos;t need to rush toward every opportunity. I watch. I learn the environment. I find the weak point. Then I move.”
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          04. CRAFT — I Build What I Want to See Exist
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 03 // CRAFT ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            <Reveal>
              <h2 className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight">
                I build what I want to see exist.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                My projects are where experimentation turns into something tangible. I&apos;ve worked across <span className="text-white/90">web development, AI-assisted development, automation, interactive interfaces, creative coding, and digital experiences</span> — constantly experimenting with new tools and approaches.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                Sometimes I&apos;m trying to solve a practical business problem. Sometimes I&apos;m building something simply because I want to know whether I can. And sometimes the most interesting projects begin with a completely unreasonable question:
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="p-6 rounded-xl bg-white/[0.03] border border-white/15">
                <p className="text-xl sm:text-2xl font-light text-white tracking-tight">
                  “What if I actually built this?”
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono mt-2">
                  That&apos;s usually where things get interesting.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          05. AMBITION — Chasing Capability
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 04 // AMBITION ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            <Reveal>
              <h2 className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight">
                I&apos;m not chasing a title.
                <br />
                <span className="text-white/40 font-thin">I&apos;m chasing capability.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                I want to become the kind of person who can walk into an unfamiliar problem and figure it out.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors">
                  <span className="text-white/40 block mb-1">A new framework?</span>
                  <span className="text-white font-bold">I&apos;ll learn it.</span>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors">
                  <span className="text-white/40 block mb-1">A system never touched?</span>
                  <span className="text-white font-bold">I&apos;ll understand it.</span>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors">
                  <span className="text-white/40 block mb-1">Hours-long business task?</span>
                  <span className="text-white font-bold">I&apos;ll automate it.</span>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors">
                  <span className="text-white/40 block mb-1">Unsolved problem?</span>
                  <span className="text-white font-bold">Give me some time.</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-sm sm:text-[15px] font-light text-white/80 leading-[1.9]">
                I don&apos;t expect to know everything. I expect to be able to <span className="text-white font-medium underline decoration-white/30 underline-offset-4">learn whatever I need next.</span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          06. PERSPECTIVE — Weapon vs Mind
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 05 // OUTLOOK ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            <Reveal>
              <h2 className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight">
                Technology is only the weapon.
                <br />
                <span className="text-white/40 font-thin">The real advantage is the mind using it.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                That&apos;s why my interests extend beyond code. I&apos;m fascinated by <span className="text-white/90">psychology, human behavior, AI, automation, design, systems, and the way people make decisions</span>.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                Understanding technology lets me build things. Understanding people lets me build things that actually matter. And understanding both creates a much bigger playground.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.9]">
                I&apos;m still early. And I&apos;m completely fine with that. I&apos;m building my skills, working on real projects, making mistakes, breaking things, fixing them, and learning faster with every iteration.
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="text-base font-light text-white/90 leading-[1.8]">
                I don&apos;t want my portfolio to tell you that I&apos;m already the best. I&apos;d rather it show you <span className="text-white font-medium">how far I&apos;m willing to go to become better.</span> Because I&apos;m not building a career around knowing everything. I&apos;m building one around <span className="text-white font-semibold underline decoration-white/40 underline-offset-8">never stopping the hunt for what&apos;s next.</span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          07. CAPABILITIES — Interactive Grid
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 06 // CAPABILITIES ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <div className="flex flex-wrap gap-2.5">
                {CAPABILITIES.map((skill, idx) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/30 text-xs sm:text-sm font-mono text-white/80 hover:text-white transition-all cursor-default select-none shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          08. CREDENTIALS — Certificates
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-28 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 07 // CREDENTIALS ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CERTIFICATES.map((cert, idx) => (
              <Reveal key={idx} delay={idx * 0.08}>
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.05] transition-all flex flex-col justify-between gap-3 h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                      {cert.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-mono text-white/40 mt-1">
                      {cert.org}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          09. MANTRA & ACTION LINKS
      ═══════════════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-24 py-20 sm:py-36 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-28 block">
              [ 08 // MANTRA ]
            </span>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-8">
            <Reveal>
              <h2 className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight">
                Observe. Learn. Build. Adapt.
                <br />
                <span className="text-white/40 font-thin italic">Then go after the next target.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">
                Available for freelance web engineering, full-stack builds, creative coding, and video editing.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/contact"
                  className="px-7 py-3 rounded-full bg-white hover:bg-white/90 text-black font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                >
                  Get In Touch
                </Link>
                <a
                  href="https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all"
                >
                  Fiverr Profile
                </a>
                <a
                  href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 font-mono text-xs tracking-widest uppercase transition-all"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/sanskar-a11y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 font-mono text-xs tracking-widest uppercase transition-all"
                >
                  GitHub
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
