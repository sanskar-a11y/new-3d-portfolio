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
  { title: 'AI & Generative AI Internship', org: 'YBI Foundation' },
  { title: 'Introduction to Modern AI', org: 'Cisco' },
  { title: 'Computer Hardware Basics', org: 'Cisco' },
  { title: 'AI Workshop', org: 'Sanskriti University' },
]

/* ─── Animate-in block ─── */

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.104, 0.204, 0.492, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Component ─── */

export function About() {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start'],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <div
      ref={container}
      className="relative w-full text-white antialiased"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ═══════════════════════════════════════════════
          HERO — Name & Identity
      ═══════════════════════════════════════════════ */}
      <section className="min-h-[70vh] flex flex-col justify-end px-8 sm:px-16 lg:px-24 pb-20 sm:pb-28">
        <Reveal>
          <p
            className="uppercase tracking-[0.2em] text-white/50 text-[11px] sm:text-xs font-light mb-6"
          >
            About
          </p>
        </Reveal>

        <Reveal className="max-w-3xl">
          <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-extralight leading-[1.1] tracking-tight text-white">
            I don&apos;t just build.
            <br />
            <span className="text-white/50">I hunt for the answer.</span>
          </h1>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════
          MANIFESTO — Core Identity
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Profile
            </p>
          </Reveal>

          <motion.div style={{ y: y1 }} className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <p className="text-base sm:text-lg font-light text-white/80 leading-[1.8] mb-8">
                I&apos;m <span className="text-white font-normal">Sanskar</span>, a developer, problem solver, and relentless learner who likes turning curiosity into something real.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                I have never been very good at accepting &ldquo;that&apos;s just how it works.&rdquo;
                If something catches my attention, I investigate it.
                If I don&apos;t understand it, I learn it.
                If something can be built better, I rebuild it.
                And if there&apos;s a problem standing between me and the result, I keep pulling it apart until I find the way through.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9]">
                That mindset is what pulled me into technology. I started with the fundamentals of programming and web development, then moved deeper into Python, JavaScript, AI, automation, modern web technologies, APIs, databases, and creative digital experiences. I&apos;m especially interested in the space where software stops being static and starts becoming intelligent, automated, and alive.
              </p>
            </Reveal>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          METHODOLOGY — Observe Before I Move
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Methodology
            </p>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-white leading-[1.2] tracking-tight mb-10">
                I observe before I move.
              </h2>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                One thing I value more than writing code is understanding the problem behind the code. I like watching how people interact with a product, where a process breaks, what wastes time, what could be automated, and what nobody has thought about yet.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/50 leading-[1.9] italic">
                Like a cat stalking its target, I don&apos;t need to rush toward every opportunity. I watch. I learn the environment. I find the weak point. Then I move.
              </p>
            </Reveal>

            <Reveal className="mt-12">
              <p className="uppercase tracking-[0.3em] text-white/70 text-xs sm:text-sm font-light">
                Observe &nbsp;· &nbsp;Understand &nbsp;· &nbsp;Adapt &nbsp;· &nbsp;Execute
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CRAFT — I Build What I Want to See Exist
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Craft
            </p>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-white leading-[1.2] tracking-tight mb-10">
                I build what I want to see exist.
              </h2>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                My projects are where experimentation turns into something tangible. I&apos;ve worked across web development, AI-assisted development, automation, interactive interfaces, creative coding, and digital experiences — constantly experimenting with new tools and approaches.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                Sometimes I&apos;m trying to solve a practical business problem. Sometimes I&apos;m building something simply because I want to know whether I can. And sometimes the most interesting projects begin with a completely unreasonable question:
              </p>
            </Reveal>

            <Reveal>
              <p className="text-xl sm:text-2xl font-extralight text-white tracking-tight">
                &ldquo;What if I actually built this?&rdquo;
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-light mt-4">
                That&apos;s usually where things get interesting.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          AMBITION — Chasing Capability
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Ambition
            </p>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-white leading-[1.2] tracking-tight mb-10">
                I&apos;m not chasing a title.
                <br />
                <span className="text-white/50">I&apos;m chasing capability.</span>
              </h2>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                I want to become the kind of person who can walk into an unfamiliar problem and figure it out. A new framework — I&apos;ll learn it. A system I&apos;ve never touched — I&apos;ll understand it. A business process that takes hours — I&apos;ll look for a way to automate it. A technical problem nobody around me knows how to solve — give me some time.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9]">
                I don&apos;t expect to know everything. I expect to be able to learn whatever I need next.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PERSPECTIVE — Technology Is Only the Weapon
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Perspective
            </p>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-white leading-[1.2] tracking-tight mb-10">
                Technology is only the weapon.
                <br />
                <span className="text-white/50">The real advantage is the mind using it.</span>
              </h2>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                That&apos;s why my interests extend beyond code. I&apos;m fascinated by psychology, human behavior, AI, automation, design, systems, and the way people make decisions. Understanding technology lets me build things. Understanding people lets me build things that actually matter. And understanding both creates a much bigger playground.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.9] mb-8">
                I&apos;m still early. And I&apos;m completely fine with that. I&apos;m building my skills, working on real projects, making mistakes, breaking things, fixing them, and learning faster with every iteration.
              </p>
            </Reveal>

            <Reveal>
              <p className="text-sm sm:text-[15px] font-light text-white/80 leading-[1.9]">
                I don&apos;t want my portfolio to tell you that I&apos;m already the best. I&apos;d rather it show you how far I&apos;m willing to go to become better. Because I&apos;m not building a career around knowing everything. I&apos;m building one around never stopping the hunt for what&apos;s next.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CAPABILITIES — Skills as Quiet List
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Capabilities
            </p>
          </Reveal>

          <div className="lg:col-span-9">
            <Reveal>
              <div className="flex flex-wrap gap-x-6 gap-y-3 max-w-2xl">
                {CAPABILITIES.map((skill) => (
                  <span
                    key={skill}
                    className="text-[13px] font-light text-white/50 hover:text-white/90 transition-opacity duration-500 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CREDENTIALS — Certificates
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Credentials
            </p>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            {CERTIFICATES.map((cert, idx) => (
              <Reveal key={idx}>
                <div className="py-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <p className="text-sm font-light text-white/70">
                    {cert.title}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-light">
                    {cert.org}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MANTRA & LINKS
      ═══════════════════════════════════════════════ */}
      <section className="px-8 sm:px-16 lg:px-24 pt-20 sm:pt-32 pb-32 sm:pb-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-6xl">
          <Reveal className="lg:col-span-3">
            <p className="uppercase tracking-[0.2em] text-white/40 text-[11px] font-light">
              Mantra
            </p>
          </Reveal>

          <div className="lg:col-span-9 max-w-2xl">
            <Reveal>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extralight text-white leading-[1.3] tracking-tight mb-16">
                Observe. Learn. Build. Adapt.
                <br />
                <span className="text-white/40">Then go after the next target.</span>
              </h2>
            </Reveal>

            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-light mb-6">
                Available for freelance web engineering, full-stack builds, creative coding, and video editing.
              </p>
            </Reveal>

            <Reveal>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href="/contact"
                  className="text-[13px] font-light text-white/70 hover:text-white transition-colors duration-500 uppercase tracking-[0.15em]"
                >
                  Contact
                </Link>
                <a
                  href="https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-light text-white/50 hover:text-white transition-colors duration-500 uppercase tracking-[0.15em]"
                >
                  Fiverr
                </a>
                <a
                  href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-light text-white/50 hover:text-white transition-colors duration-500 uppercase tracking-[0.15em]"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/sanskar-a11y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-light text-white/50 hover:text-white transition-colors duration-500 uppercase tracking-[0.15em]"
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
