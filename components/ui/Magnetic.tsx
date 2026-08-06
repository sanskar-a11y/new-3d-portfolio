'use client'

import { useRef, ReactNode, memo } from 'react'
import gsap from 'gsap'

export const Magnetic = memo(function Magnetic({ children, className }: { children: ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const middleX = (clientX - (left + width / 2)) * 0.15
    const middleY = (clientY - (top + height / 2)) * 0.15

    gsap.to(ref.current, {
      x: middleX,
      y: middleY,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const reset = () => {
    if (!ref.current) return
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)',
      overwrite: 'auto',
    })
  }

  return (
    <div
      className={className}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  )
})
