// High-Fidelity Glass Bottle Bump / Clink Audio Synthesizer (Web Audio API)
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  return audioCtx
}

// Global W3C user-gesture unlock sequence
function unlockAudio() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  try {
    const silent = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = silent
    src.connect(ctx.destination)
    src.start(0)
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudio)
  window.addEventListener('click', unlockAudio)
  window.addEventListener('touchstart', unlockAudio)
  window.addEventListener('keydown', unlockAudio)
  window.addEventListener('mousemove', unlockAudio, { passive: true })
  window.addEventListener('pointermove', unlockAudio, { passive: true })
  window.addEventListener('mouseenter', unlockAudio, { passive: true })
  window.addEventListener('mouseover', unlockAudio, { passive: true })
}

export function playGlassClinkSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Master Volume Gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.9, now)
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    masterGain.connect(ctx.destination)

    // Helper for single bottle impact
    const playImpact = (t: number, freq: number, gainVol: number) => {
      // 1. Primary Glass Ring Tone
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(freq, t)
      osc1.frequency.exponentialRampToValueAtTime(freq * 0.95, t + 0.22)

      const g1 = ctx.createGain()
      g1.gain.setValueAtTime(0.9 * gainVol, t)
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.25)

      osc1.connect(g1)
      g1.connect(masterGain)

      // 2. Mid Glass Body (Rich tone audible on all laptop/phone speakers)
      const oscMid = ctx.createOscillator()
      oscMid.type = 'sine'
      oscMid.frequency.setValueAtTime(freq * 0.45, t)
      oscMid.frequency.exponentialRampToValueAtTime(freq * 0.43, t + 0.15)

      const gMid = ctx.createGain()
      gMid.gain.setValueAtTime(0.6 * gainVol, t)
      gMid.gain.exponentialRampToValueAtTime(0.001, t + 0.16)

      oscMid.connect(gMid)
      gMid.connect(masterGain)

      // 3. High Crystal Overtone
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(freq * 2.1, t)
      osc2.frequency.exponentialRampToValueAtTime(freq * 2.05, t + 0.1)

      const g2 = ctx.createGain()
      g2.gain.setValueAtTime(0.5 * gainVol, t)
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1)

      osc2.connect(g2)
      g2.connect(masterGain)

      // 4. Glass impact noise click
      const bufferSize = Math.floor(ctx.sampleRate * 0.005)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25))
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const ng = ctx.createGain()
      ng.gain.setValueAtTime(0.7 * gainVol, t)
      ng.gain.exponentialRampToValueAtTime(0.01, t + 0.005)

      noise.connect(ng)
      ng.connect(masterGain)

      osc1.start(t)
      oscMid.start(t)
      osc2.start(t)
      noise.start(t)

      osc1.stop(t + 0.26)
      oscMid.stop(t + 0.18)
      osc2.stop(t + 0.12)
      noise.stop(t + 0.01)
    }

    // Impact 1: Primary Glass Impact (2200 Hz)
    playImpact(now, 2200, 1.0)

    // Impact 2: Secondary Glass Impact 28ms later (2600 Hz) - Glass bottle bump!
    playImpact(now + 0.028, 2600, 0.8)
  } catch (err) {
    console.error('Audio synth error:', err)
  }
}
