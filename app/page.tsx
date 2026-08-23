export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden select-none">
      {/* Semantic Accessible SEO Hierarchy for Search Crawlers */}
      <div className="sr-only">
        <h1>Sanskar — Creative Developer, AI Engineer & Designer</h1>
        <p>
          I don&apos;t just build. I hunt for complete dominance. Explore interactive 3D WebGL
          experiences, Next.js applications, Python AI automation, and luxury digital design.
        </p>
        <h2>Core Disciplines & Technologies</h2>
        <ul>
          <li>Next.js, React, TypeScript, Three.js, WebGL, GLSL Shaders, Framer Motion</li>
          <li>Python, AI Engineering, LLMs, Automation, Systems Architecture</li>
          <li>Creative Direction, Cinematic Video Editing, Visual Design</li>
        </ul>
      </div>
      {/* 3D Cat Model + HUD are rendered globally via GlobalCanvas in layout.tsx */}
    </main>
  )
}
