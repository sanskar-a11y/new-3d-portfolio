// Glass bottle bump / clink sound effect generator using Web Audio API
let audioCtx: AudioContext | null = null

export function playGlassClinkSound() {
  try {
    if (typeof window === 'undefined') return

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) return

    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const now = audioCtx.currentTime

    // Master gain node
    const masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.18, now)
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    masterGain.connect(audioCtx.destination)

    // Fundamental glass frequency (high pitch ring e.g. 2350 Hz)
    const osc1 = audioCtx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(2350, now)
    osc1.frequency.exponentialRampToValueAtTime(2300, now + 0.18)

    const osc1Gain = audioCtx.createGain()
    osc1Gain.gain.setValueAtTime(0.8, now)
    osc1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc1.connect(osc1Gain)
    osc1Gain.connect(masterGain)

    // High overtone harmonic (4850 Hz crystal chime)
    const osc2 = audioCtx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(4850, now)
    osc2.frequency.exponentialRampToValueAtTime(4700, now + 0.12)

    const osc2Gain = audioCtx.createGain()
    osc2Gain.gain.setValueAtTime(0.5, now)
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc2.connect(osc2Gain)
    osc2Gain.connect(masterGain)

    // Bottle body bump resonance (lower thump e.g. 920 Hz fast decay)
    const osc3 = audioCtx.createOscillator()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(920, now)
    osc3.frequency.exponentialRampToValueAtTime(600, now + 0.05)

    const osc3Gain = audioCtx.createGain()
    osc3Gain.gain.setValueAtTime(0.3, now)
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc3.connect(osc3Gain)
    osc3Gain.connect(masterGain)

    // Brief click/impact transient (noise)
    const bufferSize = audioCtx.sampleRate * 0.005
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer

    const noiseGain = audioCtx.createGain()
    noiseGain.gain.setValueAtTime(0.4, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.005)

    noise.connect(noiseGain)
    noiseGain.connect(masterGain)

    // Start all nodes
    osc1.start(now)
    osc2.start(now)
    osc3.start(now)
    noise.start(now)

    osc1.stop(now + 0.22)
    osc2.stop(now + 0.15)
    osc3.stop(now + 0.06)
    noise.stop(now + 0.01)
  } catch (err) {
    console.error('Audio play error:', err)
  }
}
