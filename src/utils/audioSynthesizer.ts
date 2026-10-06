// Custom Web Audio API Synthesizer (No static beep/buzz oscillators)
// Pure algorithmic sound synthesis for tactile mechanical clicks, electrical flicker, and atmospheric horror.

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private distortionCurve: Float32Array | null = null;

  constructor() {
    // AudioContext is initialized lazily upon first user gesture
  }

  /**
   * Safely obtain and resume AudioContext conforming to browser autoplay policies
   */
  private async getContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Generates a soft-saturation sigmoid curve for analogue warmth/distortion
   */
  private getDistortionCurve(amount: number = 20): Float32Array {
    if (this.distortionCurve) return this.distortionCurve;
    const nSamples = 256;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    this.distortionCurve = curve;
    return curve;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playSakelarSFX();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopAmbientBGM();
    }
  }

  /**
   * 1. playSakelarSFX():
   * Efek klik sakelar mekanis yang solid dan memuaskan.
   * Dibuat menggunakan noise buffer pendek + bandpass/low-pass filter dengan decay cepat,
   * diperkuat dengan resonansi mekanis body thud (120Hz -> 40Hz).
   */
  public async playSakelarSFX(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // --- Layer 1: Mechanical Plastic "Snap" (Shaped Noise Transient) ---
      const noiseBufferLength = Math.floor(ctx.sampleRate * 0.035); // 35ms burst
      const noiseBuffer = ctx.createBuffer(1, noiseBufferLength, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBufferLength; i++) {
        // Random white noise with slight decay weighting
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseBufferLength * 0.3));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass filter to isolate the tactile switch "clack"
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.03);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // --- Layer 2: Mechanical Body Thud (Low-frequency impact resonance) ---
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(145, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

      bodyGain.gain.setValueAtTime(0.14, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      // Trigger layers
      noiseSource.start(now);
      noiseSource.stop(now + 0.035);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.04);

      // Cleanup
      setTimeout(() => {
        noiseSource.disconnect();
        filter.disconnect();
        noiseGain.disconnect();
        bodyOsc.disconnect();
        bodyGain.disconnect();
      }, 60);
    } catch {
      // Audio fallback safe
    }
  }

  /**
   * 2. playLampuKedipSFX():
   * Efek listrik bergetar / flicker filamen mencekam.
   * Dibuat menggunakan FM synthesis (modulator LFO 48Hz memodulasi carrier 115Hz mains hum)
   * dipadu distorsi waveshaper dan 3x micro-arcing stutter envelope.
   */
  public async playLampuKedipSFX(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.32;

      // Carrier Oscillator (115Hz electrical hum)
      const carrier = ctx.createOscillator();
      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(115, now);

      // Modulator Oscillator (FM modulation for erratic electrical buzz)
      const modulator = ctx.createOscillator();
      modulator.type = 'square';
      modulator.frequency.setValueAtTime(48, now);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(85, now); // Modulation depth: ±85Hz

      modulator.connect(carrier.frequency);

      // Distortion Waveshaper for harsh electrical arcing texture
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.getDistortionCurve(35);
      shaper.oversample = '2x';

      // Bandpass filter to mimic acoustic resonance of a glass bulb housing
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(2.2, now);

      // Stutter envelope mimicking electrical contact flickering
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      // Burst 1
      masterGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      masterGain.gain.linearRampToValueAtTime(0.02, now + 0.08);
      // Burst 2
      masterGain.gain.linearRampToValueAtTime(0.15, now + 0.12);
      masterGain.gain.linearRampToValueAtTime(0.01, now + 0.18);
      // Burst 3
      masterGain.gain.linearRampToValueAtTime(0.14, now + 0.22);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Signal chain: Carrier -> Shaper -> Filter -> MasterGain -> Destination
      carrier.connect(shaper);
      shaper.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      modulator.start(now);
      carrier.start(now);
      modulator.stop(now + duration);
      carrier.stop(now + duration);

      setTimeout(() => {
        modulator.disconnect();
        carrier.disconnect();
        shaper.disconnect();
        filter.disconnect();
        masterGain.disconnect();
      }, (duration + 0.05) * 1000);
    } catch {
      // Audio fallback safe
    }
  }

  /**
   * 3. playBlackSpaceTriggerSFX():
   * Efek audio horror atmosferik saat Black Space diaktifkan.
   * Suara drone frekuensi rendah yang perlahan pitch-down dengan pitch bend dramatis (88Hz -> 28Hz),
   * dipadukan dengan detuned saw chord dan atmospheric resonant noise sweep.
   */
  public async playBlackSpaceTriggerSFX(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 3.2; // 3.2 seconds immersive descent

      // --- Layer 1: Subterranean Pitch-bending Sub Bass ---
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(88, now);
      // Dramatic exponential pitch drop into the abyss
      subOsc.frequency.exponentialRampToValueAtTime(26, now + 2.8);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.linearRampToValueAtTime(0.22, now + 0.2); // Slow swell
      subGain.gain.setValueAtTime(0.20, now + 1.2);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      // --- Layer 2: Menacing Detuned Dissonant Drone ---
      const saw1 = ctx.createOscillator();
      const saw2 = ctx.createOscillator();
      saw1.type = 'sawtooth';
      saw2.type = 'sawtooth';

      // Dissonant interval pitch bend
      saw1.frequency.setValueAtTime(65.4, now); // C2
      saw1.frequency.exponentialRampToValueAtTime(32.7, now + 2.6);

      saw2.frequency.setValueAtTime(69.3, now); // C#2 (minor second dissonance)
      saw2.frequency.exponentialRampToValueAtTime(34.6, now + 2.6);

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(380, now);
      droneFilter.frequency.exponentialRampToValueAtTime(60, now + 2.8);
      droneFilter.Q.setValueAtTime(3.5, now);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.001, now);
      droneGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      droneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      saw1.connect(droneFilter);
      saw2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(ctx.destination);

      // --- Layer 3: Sub-Audible Wind/Rumble Texture ---
      const noiseLength = Math.floor(ctx.sampleRate * 2.5);
      const rumbleBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
      const data = rumbleBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < noiseLength; i++) {
        // Brown noise simulation (integrated white noise)
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(220, now);
      rumbleFilter.frequency.exponentialRampToValueAtTime(45, now + 2.5);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.08, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);

      // Start all nodes
      subOsc.start(now);
      saw1.start(now);
      saw2.start(now);
      rumbleSource.start(now);

      subOsc.stop(now + duration);
      saw1.stop(now + duration);
      saw2.stop(now + duration);
      rumbleSource.stop(now + duration);

      setTimeout(() => {
        subOsc.disconnect();
        saw1.disconnect();
        saw2.disconnect();
        droneFilter.disconnect();
        droneGain.disconnect();
        rumbleSource.disconnect();
        rumbleFilter.disconnect();
        rumbleGain.disconnect();
      }, (duration + 0.1) * 1000);
    } catch {
      // Audio fallback safe
    }
  }

  /**
   * Additional Utility SFX (Typewriter blip, Select, WakeUp) using clean harmonic synthesis
   */
  public async playTextBlip(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 440 + (Math.random() * 40 - 20);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  public async playSelect(): Promise<void> {
    // Select sound now uses mechanical switch click for superior tactile feel
    await this.playSakelarSFX();
  }

  public async playWakeUp(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C Major rising arpeggio
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.06, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } catch {}
  }

  public async playSecret(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A Major chime
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.05, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.28);
      });
    } catch {}
  }

  /**
   * Procedural Atmospheric BGM Generator (White Space & Black Space)
   * Plays soft ambient pads and drones when physical MP3 files are missing or loading.
   */
  private ambientBgmNodes: {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    intervalId?: number;
  } | null = null;

  public async startAmbientBGM(mode: 'white-space' | 'black-space'): Promise<void> {
    if (this.isMuted) return;
    this.stopAmbientBGM();

    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      if (mode === 'white-space') {
        // Omori White Space procedural soundscape:
        // Hypnotic, minimalist warm ambient pad (Cmaj7: C3, E3, G3, B3) with low-pass filtering
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 1.8);
        masterGain.connect(ctx.destination);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(460, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);
        filter.connect(masterGain);

        const freqs = [130.81, 164.81, 196.00, 246.94];
        const oscs: OscillatorNode[] = [];
        const gains: GainNode[] = [];

        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          osc.detune.setValueAtTime((i - 1.5) * 4, ctx.currentTime);

          g.gain.setValueAtTime(0.2, ctx.currentTime);
          osc.connect(g);
          g.connect(filter);
          osc.start();

          oscs.push(osc);
          gains.push(g);
        });

        // Periodic soft celestial music-box chime every 6.5s
        const chimeInterval = window.setInterval(() => {
          if (this.isMuted || !this.ambientBgmNodes) return;
          this.playSoftChime();
        }, 6500);

        this.ambientBgmNodes = {
          oscillators: oscs,
          gains: [...gains, masterGain],
          intervalId: chimeInterval,
        };
      } else {
        // Omori Black Space procedural soundscape:
        // Deep sub-bass dissonance with rhythmic dark pulse
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.065, ctx.currentTime + 1.2);
        masterGain.connect(ctx.destination);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, ctx.currentTime);
        filter.connect(masterGain);

        // Dark tritone low cluster (D1, Eb1, Ab1)
        const freqs = [36.71, 38.89, 51.91];
        const oscs: OscillatorNode[] = [];
        const gains: GainNode[] = [];

        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          g.gain.setValueAtTime(0.18, ctx.currentTime);
          osc.connect(g);
          g.connect(filter);
          osc.start();

          oscs.push(osc);
          gains.push(g);
        });

        // Slow visceral heartbeat pulse every 2.4s
        const pulseInterval = window.setInterval(() => {
          if (this.isMuted || !this.ambientBgmNodes) return;
          this.playDarkHeartbeat();
        }, 2400);

        this.ambientBgmNodes = {
          oscillators: oscs,
          gains: [...gains, masterGain],
          intervalId: pulseInterval,
        };
      }
    } catch {}
  }

  public stopAmbientBGM(): void {
    if (this.ambientBgmNodes) {
      if (this.ambientBgmNodes.intervalId) {
        clearInterval(this.ambientBgmNodes.intervalId);
      }
      this.ambientBgmNodes.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.ambientBgmNodes.gains.forEach((g) => {
        try {
          g.disconnect();
        } catch {}
      });
      this.ambientBgmNodes = null;
    }
  }

  private async playSoftChime(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chimeNotes = [523.25, 659.25, 783.99, 987.77];
      const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.65);
    } catch {}
  }

  private async playDarkHeartbeat(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(46, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.18);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }
}

export const audioSynthesizer = new AudioSynthesizer();

// Direct export functions matching user's exact specification
export const playSakelarSFX = () => audioSynthesizer.playSakelarSFX();
export const playLampuKedipSFX = () => audioSynthesizer.playLampuKedipSFX();
export const playBlackSpaceTriggerSFX = () => audioSynthesizer.playBlackSpaceTriggerSFX();
