// Custom Web Audio API Synthesizer (No static beep/buzz oscillators)
// Pure algorithmic sound synthesis for tactile mechanical clicks, electrical flicker, and atmospheric horror.

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private distortionCurve: Float32Array | null = null;
  private lastBlipTime: number = 0;
  private lastSakelarTime: number = 0;

  constructor() {
    // AudioContext is initialized lazily upon first user gesture
  }

  /**
   * Safely obtain and resume AudioContext conforming to browser autoplay policies
   */
  public async getContext(): Promise<AudioContext | null> {
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

  public async getAudioContext(): Promise<AudioContext | null> {
    return this.getContext();
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
    const nowMs = performance.now();
    // Guard against rapid duplicate trigger / event bubbling within 100ms
    if (nowMs - this.lastSakelarTime < 100) return;
    this.lastSakelarTime = nowMs;

    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const isBlackSpace = typeof document !== 'undefined' && document.body.classList.contains('black-space-theme');

      // --- Layer 1: Mechanical Plastic "Snap" (Shaped Noise Transient) ---
      const noiseBufferLength = Math.floor(ctx.sampleRate * (isBlackSpace ? 0.05 : 0.035));
      const noiseBuffer = ctx.createBuffer(1, noiseBufferLength, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBufferLength; i++) {
        // Random white noise with slight decay weighting
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseBufferLength * (isBlackSpace ? 0.4 : 0.3)));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Filter: in Black Space, muffled lowpass hollow echo; otherwise crisp tactile bandpass
      const filter = ctx.createBiquadFilter();
      if (isBlackSpace) {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(1.2, now);
      } else {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.03);
        filter.Q.setValueAtTime(2.5, now);
      }

      const noiseGain = ctx.createGain();
      const targetNoiseGain = isBlackSpace ? 0.04 : 0.09;
      noiseGain.gain.setValueAtTime(targetNoiseGain, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + (isBlackSpace ? 0.05 : 0.035));

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // --- Layer 2: Mechanical Body Thud (Low-frequency impact resonance) ---
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(isBlackSpace ? 95 : 145, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(isBlackSpace ? 35 : 45, now + 0.04);

      const targetBodyGain = isBlackSpace ? 0.045 : 0.08;
      bodyGain.gain.setValueAtTime(targetBodyGain, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      // Trigger layers
      noiseSource.start(now);
      noiseSource.stop(now + (isBlackSpace ? 0.05 : 0.035));
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.045);

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

      // Stutter envelope mimicking electrical contact flickering (softened)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      // Burst 1
      masterGain.gain.linearRampToValueAtTime(0.035, now + 0.03);
      masterGain.gain.linearRampToValueAtTime(0.008, now + 0.08);
      // Burst 2
      masterGain.gain.linearRampToValueAtTime(0.045, now + 0.12);
      masterGain.gain.linearRampToValueAtTime(0.006, now + 0.18);
      // Burst 3
      masterGain.gain.linearRampToValueAtTime(0.04, now + 0.22);
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
      subGain.gain.setValueAtTime(0.005, now);
      subGain.gain.linearRampToValueAtTime(0.075, now + 0.25); // Subtle ominous swell
      subGain.gain.setValueAtTime(0.065, now + 1.2);
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
      droneGain.gain.linearRampToValueAtTime(0.04, now + 0.3);
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
    const nowMs = performance.now();
    // Throttle: ignore rapid blip requests within 130ms to prevent flurry
    if (nowMs - this.lastBlipTime < 130) return;
    this.lastBlipTime = nowMs;

    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Soft, warm, tactile wooden/paper micro-tap (never piercing electronic beep)
      osc.type = 'sine';
      const baseFreq = 220 + (Math.random() * 20 - 10);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.026);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.026);

      setTimeout(() => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 50);
    } catch {}
  }

  /**
   * playBulbBuzzSFX():
   * Authentic electric arcing / filament hum & crackle ("bzzt!")
   * Features a distorted 60Hz/120Hz mains hum modulated with bandpass noise sparks.
   */
  public async playBulbBuzzSFX(intensity: 'gentle' | 'strong' = 'gentle'): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = intensity === 'strong' ? 0.36 : 0.16;

      // Noise generator for electric crackle / arc
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass filter for harsh electric arcing sizzle
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(intensity === 'strong' ? 2200 : 1700, now);
      filter.Q.setValueAtTime(2.2, now);

      // Waveshaper for crackle distortion
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.getDistortionCurve(intensity === 'strong' ? 45 : 20);

      // Low mains hum oscillator (60Hz / 120Hz filament hum)
      const humOsc = ctx.createOscillator();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(intensity === 'strong' ? 120 : 85, now);

      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(250, now);

      const humGain = ctx.createGain();
      const humVol = intensity === 'strong' ? 0.11 : 0.05;
      humGain.gain.setValueAtTime(humVol, now);
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      humOsc.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(ctx.destination);

      // Noise gain with arcing stutter envelope
      const noiseGain = ctx.createGain();
      const sparkVol = intensity === 'strong' ? 0.15 : 0.07;
      noiseGain.gain.setValueAtTime(sparkVol, now);
      // Arcing micro-stutter: bz-bzzt
      noiseGain.gain.setValueAtTime(sparkVol * 0.25, now + duration * 0.28);
      noiseGain.gain.setValueAtTime(sparkVol * 1.05, now + duration * 0.48);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noiseSource.connect(filter);
      filter.connect(shaper);
      shaper.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
      humOsc.start(now);
      humOsc.stop(now + duration);

      setTimeout(() => {
        noiseSource.disconnect();
        filter.disconnect();
        shaper.disconnect();
        noiseGain.disconnect();
        humOsc.disconnect();
        humFilter.disconnect();
        humGain.disconnect();
      }, (duration + 0.1) * 1000);
    } catch {}
  }

  public async playSelect(): Promise<void> {
    // Select sound now uses mechanical switch click for superior tactile feel
    await this.playSakelarSFX();
  }

  /**
   * playWakeUp():
   * Authentic Omori Awakening sequence.
   * Visceral reality-tear / stab transient -> sub-pitch collapse -> cold White Space chime breath.
   */
  public async playWakeUp(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // --- Layer 1: Visceral Reality Tear / Snap Transient ---
      const tearLen = Math.floor(ctx.sampleRate * 0.08);
      const tearBuf = ctx.createBuffer(1, tearLen, ctx.sampleRate);
      const tearData = tearBuf.getChannelData(0);
      for (let i = 0; i < tearLen; i++) {
        tearData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (tearLen * 0.25));
      }

      const tearSrc = ctx.createBufferSource();
      tearSrc.buffer = tearBuf;

      const tearFilter = ctx.createBiquadFilter();
      tearFilter.type = 'bandpass';
      tearFilter.frequency.setValueAtTime(1400, now);
      tearFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.03);
      tearFilter.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      tearFilter.Q.setValueAtTime(2.5, now);

      const tearGain = ctx.createGain();
      tearGain.gain.setValueAtTime(0.04, now);
      tearGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      tearSrc.connect(tearFilter);
      tearFilter.connect(tearGain);
      tearGain.connect(ctx.destination);
      tearSrc.start(now);
      tearSrc.stop(now + 0.08);

      // --- Layer 2: Pitch Plunge (Consciousness collapsing back to reality) ---
      const dropOsc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const dropFilter = ctx.createBiquadFilter();

      dropOsc.type = 'triangle';
      dropOsc.frequency.setValueAtTime(180, now);
      dropOsc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

      dropFilter.type = 'lowpass';
      dropFilter.frequency.setValueAtTime(500, now);
      dropFilter.frequency.exponentialRampToValueAtTime(60, now + 0.45);

      dropGain.gain.setValueAtTime(0.05, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      dropOsc.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(ctx.destination);

      dropOsc.start(now);
      dropOsc.stop(now + 0.45);

      // --- Layer 3: Sterile White Space Awakening Bell (Soft pure chime) ---
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(1046.5, now + 0.12); // C6

      bellGain.gain.setValueAtTime(0.0001, now);
      bellGain.gain.setValueAtTime(0.015, now + 0.12);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);

      bellOsc.start(now + 0.12);
      bellOsc.stop(now + 0.85);
    } catch {}
  }

  /**
   * playSecret():
   * Authentic Omori Black Space Key Unlocked / Clue Gathered chime.
   * Fragile, melancholic antique music-box tines with cold metallic overtones
   * and a distant heavy lock thud.
   */
  public async playSecret(): Promise<void> {
    if (this.isMuted) return;
    const ctx = await this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Distant hollow lock thud (softened)
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(82, now);
      thudOsc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      thudGain.gain.setValueAtTime(0.045, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.35);

      // Antique music-box notes (Eb minor melancholy: Eb5, C5, Ab4, F4)
      const musicBoxPitches = [622.25, 523.25, 415.30, 349.23];

      musicBoxPitches.forEach((freq, idx) => {
        if (!ctx) return;
        const noteStart = now + idx * 0.11;

        // Fundamental tone (delicate, not blaring)
        const fundOsc = ctx.createOscillator();
        const fundGain = ctx.createGain();
        fundOsc.type = 'sine';
        fundOsc.frequency.setValueAtTime(freq, noteStart);

        fundGain.gain.setValueAtTime(0.016, noteStart);
        fundGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.55);

        fundOsc.connect(fundGain);
        fundGain.connect(ctx.destination);

        fundOsc.start(noteStart);
        fundOsc.stop(noteStart + 0.55);

        // Metallic inharmonic chime overtone (2.756x tine resonance)
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq * 2.756, noteStart);

        chimeGain.gain.setValueAtTime(0.005, noteStart);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chimeOsc.start(noteStart);
        chimeOsc.stop(noteStart + 0.22);
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
export const playBulbBuzzSFX = (intensity?: 'gentle' | 'strong') => audioSynthesizer.playBulbBuzzSFX(intensity);
