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

// Auto-unlock AudioContext on first user interaction anywhere on the page
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'running') {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
  window.addEventListener('touchstart', unlock, { once: true })
}

export function playGlassClinkSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Master gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.35, now)
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    masterGain.connect(ctx.destination)

    // Single glass tap function
    const playTap = (time: number, baseFreq: number, gainMult: number) => {
      // High pitch sine (glass resonance)
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(baseFreq, time)
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.98, time + 0.18)

      const g1 = ctx.createGain()
      g1.gain.setValueAtTime(0.7 * gainMult, time)
      g1.gain.exponentialRampToValueAtTime(0.001, time + 0.2)

      osc1.connect(g1)
      g1.connect(masterGain)

      // Overtone harmonic (crystal chime)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(baseFreq * 2.15, time)
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, time + 0.1)

      const g2 = ctx.createGain()
      g2.gain.setValueAtTime(0.4 * gainMult, time)
      g2.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

      osc2.connect(g2)
      g2.connect(masterGain)

      // Bottle hollow body thump
      const osc3 = ctx.createOscillator()
      osc3.type = 'triangle'
      osc3.frequency.setValueAtTime(baseFreq * 0.38, time)
      osc3.frequency.exponentialRampToValueAtTime(300, time + 0.04)

      const g3 = ctx.createGain()
      g3.gain.setValueAtTime(0.3 * gainMult, time)
      g3.gain.exponentialRampToValueAtTime(0.001, time + 0.04)

      osc3.connect(g3)
      g3.connect(masterGain)

      // Hard impact noise click
      const bufferSize = Math.floor(ctx.sampleRate * 0.004)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const ng = ctx.createGain()
      ng.gain.setValueAtTime(0.5 * gainMult, time)
      ng.gain.exponentialRampToValueAtTime(0.01, time + 0.004)

      noise.connect(ng)
      ng.connect(masterGain)

      osc1.start(time)
      osc2.start(time)
      osc3.start(time)
      noise.start(time)

      osc1.stop(time + 0.22)
      osc2.stop(time + 0.12)
      osc3.stop(time + 0.05)
      noise.stop(time + 0.01)
    }

    // Tap 1: First bottle impact (e.g. 2400 Hz)
    playTap(now, 2400, 1.0)

    // Tap 2: Second bottle clink resonance 28ms later (e.g. 2750 Hz) - creates real bottle bump effect
    playTap(now + 0.028, 2750, 0.75)
  } catch (err) {
    console.error('Audio play error:', err)
  }
}
