'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'

/* ─── Data ─── */

const CAPABILITIES = [
  'React.js',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Three.js / WebGL',
  'GLSL Shaders',
  'Framer Motion',
  'Python',
  'AI & Automation',
  'Firebase',
  'GSAP / Lenis',
  'Prompt Engineering',
  'Video Editing',
  'Motion Graphics',
  'Sound Design',
]

const AMBITION_ITEMS = [
  { q: 'A new framework?', a: "I'll learn it." },
  { q: 'A system never touched?', a: "I'll understand it." },
  { q: 'Hours-long business task?', a: "I'll automate it." },
  { q: 'Unsolved technical problem?', a: 'Give me some time.' },
]

const CERTIFICATES = [
  { title: 'AI & Generative AI Internship', org: 'YBI Foundation', badge: 'AI / LLM' },
  { title: 'Introduction to Modern AI', org: 'Cisco', badge: 'Foundations' },
  { title: 'Computer Hardware Basics', org: 'Cisco', badge: 'Hardware' },
  { title: 'AI Workshop', org: 'Sanskriti University', badge: 'Applied AI' },
]

/* ─── Kinetic Word-by-Word Heading ─── */
function KineticHeading({
  text,
  className = '',
  highlightWords = [],
}: {
  text: string
  className?: string
  highlightWords?: string[]
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const words = text.split(' ')

  return (
    <h2 ref={ref} className={`flex flex-wrap gap-x-[0.28em] gap-y-1 ${className}`}>
      {words.map((word, i) => {
        const isHighlight = highlightWords.some((hw) =>
          word.toLowerCase().includes(hw.toLowerCase())
        )
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            animate={
              isInView
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 28, filter: 'blur(8px)' }
            }
            transition={{
              duration: 0.85,
              delay: i * 0.035,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`inline-block transition-colors duration-300 ${
              isHighlight ? 'text-white/40 font-thin italic' : 'text-white'
            }`}
          >
            {word}
          </motion.span>
        )
      })}
    </h2>
  )
}

/* ─── Elegant Paragraph with Blur-to-Focus Fade ─── */
function ElegantText({
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
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 22, filter: 'blur(6px)' }
      }
      transition={{
        duration: 0.9,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Interactive Underline Link ─── */
function ElegantLink({
  href,
  label,
  isExternal = false,
}: {
  href: string
  label: string
  isExternal?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.span
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-light uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-300 py-1"
    >
      <span>{label}</span>
      <span className="text-[10px] opacity-60">{isExternal ? '↗' : '→'}</span>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: hovered ? 0 : 1 }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/80"
      />
    </motion.span>
  )

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return <Link href={href}>{content}</Link>
}

export function About() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start'],
  })

  const yHero = useTransform(scrollYProgress, [0, 0.4], [0, -60])
  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <div
      ref={container}
      className="relative w-full text-white antialiased selection:bg-white selection:text-black"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ═══════════════════════════════════════════════
          01. HERO — Name & Opening Hook
      ═══════════════════════════════════════════════ */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 sm:px-8 lg:px-16 pb-12 sm:pb-20">
        <motion.div style={{ y: yHero }} className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-3 mb-8 sm:mb-12"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <p className="uppercase tracking-[0.35em] text-white/50 text-[11px] sm:text-xs font-light">
              About // Sanskar
            </p>
          </motion.div>

          <h1 className="text-[clamp(3rem,8.5vw,7.5rem)] font-extralight leading-[0.98] tracking-tighter text-white text-center w-full">
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              I don&apos;t just build.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white/40 font-thin italic mt-3 sm:mt-5"
            >
              I hunt for complete dominance.
            </motion.span>
          </h1>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          02. MANIFESTO — Core Identity
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Profile
            </span>
          </div>

          <motion.div style={{ y: yParallax }} className="lg:col-span-9 max-w-2xl flex flex-col gap-10">
            <ElegantText>
              <p className="text-xl sm:text-2xl font-light text-white leading-[1.6]">
                I&apos;m <span className="font-normal text-white">Sanskar</span>, a developer, problem solver, and relentless learner who likes turning curiosity into something real.
              </p>
            </ElegantText>

            <ElegantText delay={0.1}>
              <p className="text-base sm:text-lg font-light text-white/70 leading-[1.85]">
                I have never been very good at accepting <span className="text-white italic">“that&apos;s just how it works.”</span>
              </p>
            </ElegantText>

            <ElegantText delay={0.15}>
              <div className="pl-6 border-l border-white/20 space-y-2 py-1">
                <p className="text-sm sm:text-base font-light text-white/80 leading-[1.9]">
                  If something catches my attention, I investigate it.<br />
                  If I don&apos;t understand it, I learn it.<br />
                  If something can be built better, I rebuild it.<br />
                  And if there&apos;s a problem standing between me and the result, I keep pulling it apart until I find the way through.
                </p>
              </div>
            </ElegantText>

            <ElegantText delay={0.2}>
              <p className="text-sm sm:text-[15px] font-light text-white/60 leading-[1.95]">
                That mindset is what pulled me into technology. I started with the fundamentals of programming and web development, then moved deeper into <span className="text-white/85">Python, JavaScript, AI, automation, modern web technologies, APIs, databases, and creative digital experiences</span>. I&apos;m especially interested in the space where software stops being static and starts becoming intelligent, automated, and alive.
              </p>
            </ElegantText>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          03. METHODOLOGY — Observe Before I Move
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Methodology
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-10">
            <KineticHeading
              text="I observe before I move."
              className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight"
            />

            <ElegantText delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                One thing I value more than writing code is <span className="text-white font-normal">understanding the problem behind the code</span>. I like watching how people interact with a product, where a process breaks, what wastes time, what could be automated, and what nobody has thought about yet.
              </p>
            </ElegantText>

            <ElegantText delay={0.15}>
              <div className="pl-6 border-l border-white/20 space-y-3 py-1">
                <div className="text-xs font-mono uppercase tracking-[0.3em] text-white/90 font-light">
                  Observe · Understand · Adapt · Execute
                </div>
                <p className="text-sm sm:text-base font-light text-white/60 italic leading-[1.85]">
                  “Like a cat stalking its target, I don&apos;t need to rush toward every opportunity. I watch. I learn the environment. I find the weak point. Then I move.”
                </p>
              </div>
            </ElegantText>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          04. CRAFT — I Build What I Want to See Exist
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Craft
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-10">
            <KineticHeading
              text="I build what I want to see exist."
              className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight"
            />

            <ElegantText delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                My projects are where experimentation turns into something tangible. I&apos;ve worked across <span className="text-white/90">web development, AI-assisted development, automation, interactive interfaces, creative coding, and digital experiences</span> — constantly experimenting with new tools and approaches.
              </p>
            </ElegantText>

            <ElegantText delay={0.15}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                Sometimes I&apos;m trying to solve a practical business problem. Sometimes I&apos;m building something simply because I want to know whether I can. And sometimes the most interesting projects begin with a completely unreasonable question:
              </p>
            </ElegantText>

            <ElegantText delay={0.2}>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-extralight text-white tracking-tight">
                  “What if I actually built this?”
                </p>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-light">
                  That&apos;s usually where things get interesting.
                </p>
              </div>
            </ElegantText>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          05. AMBITION — Chasing Capability
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Ambition
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-10">
            <KineticHeading
              text="I'm not chasing a title. I'm chasing capability."
              highlightWords={["I'm", 'chasing', 'capability.']}
              className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight"
            />

            <ElegantText delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                I want to become the kind of person who can walk into an unfamiliar problem and figure it out.
              </p>
            </ElegantText>

            {/* Pure Typographic Floating List — Zero Boxes */}
            <div className="flex flex-col gap-5 py-2">
              {AMBITION_ITEMS.map((item, idx) => (
                <ElegantText key={idx} delay={0.12 + idx * 0.05}>
                  <div className="group flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-2 border-b border-white/[0.06] transition-colors">
                    <span className="text-sm font-light text-white/50 group-hover:text-white/75 transition-colors">
                      {item.q}
                    </span>
                    <span className="text-sm sm:text-base font-normal text-white group-hover:translate-x-1 transition-transform">
                      {item.a}
                    </span>
                  </div>
                </ElegantText>
              ))}
            </div>

            <ElegantText delay={0.25}>
              <p className="text-sm sm:text-[15px] font-light text-white/80 leading-[1.95]">
                I don&apos;t expect to know everything. I expect to be able to <span className="text-white font-medium underline decoration-white/30 underline-offset-4">learn whatever I need next.</span>
              </p>
            </ElegantText>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          06. PERSPECTIVE — Weapon vs Mind
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Perspective
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-10">
            <KineticHeading
              text="Technology is only the weapon. The real advantage is the mind using it."
              highlightWords={['The', 'real', 'advantage', 'is', 'the', 'mind', 'using', 'it.']}
              className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight"
            />

            <ElegantText delay={0.1}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                That&apos;s why my interests extend beyond code. I&apos;m fascinated by <span className="text-white/90">psychology, human behavior, AI, automation, design, systems, and the way people make decisions</span>.
              </p>
            </ElegantText>

            <ElegantText delay={0.15}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                Understanding technology lets me build things. Understanding people lets me build things that actually matter. And understanding both creates a much bigger playground.
              </p>
            </ElegantText>

            <ElegantText delay={0.2}>
              <p className="text-sm sm:text-[15px] font-light text-white/65 leading-[1.95]">
                I&apos;m still early. And I&apos;m completely fine with that. I&apos;m building my skills, working on real projects, making mistakes, breaking things, fixing them, and learning faster with every iteration.
              </p>
            </ElegantText>

            <ElegantText delay={0.25}>
              <p className="text-base font-light text-white/90 leading-[1.85]">
                I don&apos;t want my portfolio to tell you that I&apos;m already the best. I&apos;d rather it show you <span className="text-white font-medium">how far I&apos;m willing to go to become better.</span> Because I&apos;m not building a career around knowing everything. I&apos;m building one around <span className="text-white font-semibold underline decoration-white/40 underline-offset-8">never stopping the hunt for what&apos;s next.</span>
              </p>
            </ElegantText>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          07. CAPABILITIES — Quiet Flowing List
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Capabilities
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl">
            <ElegantText>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-4">
                {CAPABILITIES.map((skill, idx) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: 1.06, color: '#ffffff', x: 2 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base font-light text-white/60 hover:text-white transition-colors cursor-default select-none tracking-wide"
                  >
                    {skill}
                    {idx < CAPABILITIES.length - 1 && (
                      <span className="text-white/20 ml-6 select-none font-thin">/</span>
                    )}
                  </motion.span>
                ))}
              </div>
            </ElegantText>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          08. CREDENTIALS — Pure Minimalist List
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 py-14 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Credentials
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-6">
            {CERTIFICATES.map((cert, idx) => (
              <ElegantText key={idx} delay={idx * 0.06}>
                <div className="group flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-3 border-b border-white/[0.06] transition-colors">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">
                      {cert.badge}
                    </span>
                    <h3 className="text-sm sm:text-base font-light text-white group-hover:text-white transition-colors">
                      {cert.title}
                    </h3>
                  </div>
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-white/35">
                    {cert.org}
                  </p>
                </div>
              </ElegantText>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          09. MANTRA & ELEGANT LINKS
      ═══════════════════════════════════════════════ */}
      <section className="px-5 sm:px-10 lg:px-20 pt-16 sm:pt-28 pb-28 sm:pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 max-w-6xl">
          <div className="lg:col-span-3">
            <span className="uppercase tracking-[0.25em] text-white/40 text-[11px] font-mono sticky top-32 block">
              Mantra
            </span>
          </div>

          <div className="lg:col-span-9 max-w-2xl flex flex-col gap-10">
            <KineticHeading
              text="Observe. Learn. Build. Adapt. Then go after the next target."
              highlightWords={['Then', 'go', 'after', 'the', 'next', 'target.']}
              className="text-2xl sm:text-4xl font-extralight text-white leading-tight tracking-tight"
            />

            <ElegantText delay={0.1}>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-light">
                Available for freelance web engineering, full-stack builds, creative coding, and video editing.
              </p>
            </ElegantText>

            <ElegantText delay={0.15}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4">
                <ElegantLink href="/contact" label="Contact" />
                <ElegantLink
                  href="https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile"
                  label="Fiverr"
                  isExternal
                />
                <ElegantLink
                  href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/"
                  label="LinkedIn"
                  isExternal
                />
                <ElegantLink
                  href="https://github.com/sanskar-a11y"
                  label="GitHub"
                  isExternal
                />
              </div>
            </ElegantText>
          </div>
        </div>
      </section>
    </div>
  )
}
