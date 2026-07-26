// Glass bottles bumping / clinking sound effect generator using Web Audio API
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  return audioCtx
}

// Auto-unlock AudioContext on any initial user gesture anywhere on the window
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }

  window.addEventListener('pointerdown', unlock)
  window.addEventListener('pointermove', unlock, { once: true })
  window.addEventListener('mouseenter', unlock, { once: true })
  window.addEventListener('scroll', unlock, { once: true })
  window.addEventListener('keydown', unlock)
}

export function playGlassClinkSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Ensure audio context is running
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Master gain - boosted for high audibility across all speakers
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.75, now)
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
    masterGain.connect(ctx.destination)

    // Tap helper function
    const playTap = (time: number, baseFreq: number, vol: number) => {
      // 1. Primary Glass Ring Tone
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(baseFreq, time)
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.96, time + 0.22)

      const g1 = ctx.createGain()
      g1.gain.setValueAtTime(0.85 * vol, time)
      g1.gain.exponentialRampToValueAtTime(0.001, time + 0.25)

      osc1.connect(g1)
      g1.connect(masterGain)

      // 2. Mid Glass Body Frequency (makes it rich & audible on laptop speakers)
      const oscMid = ctx.createOscillator()
      oscMid.type = 'sine'
      oscMid.frequency.setValueAtTime(baseFreq * 0.5, time)
      oscMid.frequency.exponentialRampToValueAtTime(baseFreq * 0.48, time + 0.15)

      const gMid = ctx.createGain()
      gMid.gain.setValueAtTime(0.5 * vol, time)
      gMid.gain.exponentialRampToValueAtTime(0.001, time + 0.16)

      oscMid.connect(gMid)
      gMid.connect(masterGain)

      // 3. High Crystal Harmonic
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(baseFreq * 2.2, time)
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.15, time + 0.12)

      const g2 = ctx.createGain()
      g2.gain.setValueAtTime(0.45 * vol, time)
      g2.gain.exponentialRampToValueAtTime(0.001, time + 0.12)

      osc2.connect(g2)
      g2.connect(masterGain)

      // 4. Bottle Thump (Low body click)
      const osc3 = ctx.createOscillator()
      osc3.type = 'triangle'
      osc3.frequency.setValueAtTime(baseFreq * 0.25, time)
      osc3.frequency.exponentialRampToValueAtTime(180, time + 0.05)

      const g3 = ctx.createGain()
      g3.gain.setValueAtTime(0.4 * vol, time)
      g3.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

      osc3.connect(g3)
      g3.connect(masterGain)

      // 5. Impact transient click
      const bufferSize = Math.floor(ctx.sampleRate * 0.006)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const ng = ctx.createGain()
      ng.gain.setValueAtTime(0.6 * vol, time)
      ng.gain.exponentialRampToValueAtTime(0.01, time + 0.006)

      noise.connect(ng)
      ng.connect(masterGain)

      osc1.start(time)
      oscMid.start(time)
      osc2.start(time)
      osc3.start(time)
      noise.start(time)

      osc1.stop(time + 0.26)
      oscMid.stop(time + 0.18)
      osc2.stop(time + 0.14)
      osc3.stop(time + 0.06)
      noise.stop(time + 0.01)
    }

    // Impact 1: First bottle impact (2250 Hz)
    playTap(now, 2250, 1.0)

    // Impact 2: Second bottle clink 32ms later (2650 Hz) - realistic double bottle bump!
    playTap(now + 0.032, 2650, 0.8)
  } catch (err) {
    console.error('Audio play error:', err)
  }
}
