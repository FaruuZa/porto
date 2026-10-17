import { audioSynthesizer } from './audioSynthesizer';
import { audioManager } from './audioManager';
import { ambientSoundscape } from './ambientSoundscape';
import { blackSpaceManager } from './blackSpaceState';
import { glitchManager } from './glitchManager';

export type BlackSpaceIntensity = 0 | 1 | 2 | 3 | 4 | 5;

interface IntensityConfig {
  droneGain: number;
  subOsc36Hz: boolean;
  heartBpm: number;
  heartPeak: number;
  heartJitter: number;
  bzztActive: boolean;
  bzztGain: number;
  bzztIntervalMin: number;
  bzztIntervalMax: number;
  humGain: number;
  vig: number;
  vigRed: number;
  vigClear: number;  // Inner clear radius in % (constricts from 56% down to 16%)
  vigMid: number;    // Crimson mid transition in % (constricts from 84% down to 44%)
  dim: number;       // Page brightness (1.0 -> 0.65)
  desat: number;     // Page desaturation (0.0 -> 0.90)
  pulse: boolean;
  pulseStrong: boolean;
}

const INTENSITY_TABLE: Record<BlackSpaceIntensity, IntensityConfig> = {
  0: {
    // Initial entry: near-silence, faint drone, clean text, pristine background
    droneGain: 0.035,
    subOsc36Hz: false,
    heartBpm: 0,
    heartPeak: 0,
    heartJitter: 0,
    bzztActive: false,
    bzztGain: 0,
    bzztIntervalMin: 0,
    bzztIntervalMax: 0,
    humGain: 0.008,
    vig: 0.08,
    vigRed: 0,
    vigClear: 56,
    vigMid: 84,
    dim: 1.0,
    desat: 0,
    pulse: false,
    pulseStrong: false,
  },
  1: {
    // 1st scribble erased: subtle low hum builds, first faint heartbeat begins
    droneGain: 0.065,
    subOsc36Hz: false,
    heartBpm: 48,
    heartPeak: 0.16,
    heartJitter: 0.12,
    bzztActive: false,
    bzztGain: 0,
    bzztIntervalMin: 0,
    bzztIntervalMax: 0,
    humGain: 0.014,
    vig: 0.18,
    vigRed: 0.03,
    vigClear: 48,
    vigMid: 76,
    dim: 0.95,
    desat: 0.15,
    pulse: false,
    pulseStrong: false,
  },
  2: {
    // 2nd scribble erased: heartbeat deepens, subtle room flicker starts
    droneGain: 0.095,
    subOsc36Hz: false,
    heartBpm: 58,
    heartPeak: 0.24,
    heartJitter: 0.10,
    bzztActive: true,
    bzztGain: 0.032,
    bzztIntervalMin: 35000,
    bzztIntervalMax: 60000,
    humGain: 0.020,
    vig: 0.30,
    vigRed: 0.08,
    vigClear: 40,
    vigMid: 68,
    dim: 0.88,
    desat: 0.35,
    pulse: true,
    pulseStrong: false,
  },
  3: {
    // 3rd scribble erased: noticeably tense, heartbeat quickens, text twitches
    droneGain: 0.135,
    subOsc36Hz: false,
    heartBpm: 68,
    heartPeak: 0.30,
    heartJitter: 0.09,
    bzztActive: true,
    bzztGain: 0.048,
    bzztIntervalMin: 25000,
    bzztIntervalMax: 45000,
    humGain: 0.026,
    vig: 0.44,
    vigRed: 0.14,
    vigClear: 32,
    vigMid: 60,
    dim: 0.80,
    desat: 0.55,
    pulse: true,
    pulseStrong: false,
  },
  4: {
    // 4th scribble erased: sub-36Hz dread engages, heartbeat races, world dims
    droneGain: 0.175,
    subOsc36Hz: true,
    heartBpm: 78,
    heartPeak: 0.36,
    heartJitter: 0.08,
    bzztActive: true,
    bzztGain: 0.065,
    bzztIntervalMin: 16000,
    bzztIntervalMax: 30000,
    humGain: 0.032,
    vig: 0.58,
    vigRed: 0.22,
    vigClear: 24,
    vigMid: 52,
    dim: 0.72,
    desat: 0.75,
    pulse: true,
    pulseStrong: true,
  },
  5: {
    // 5th scribble erased (ALL COLLECTED): maximum dread, total screen engulfment / full blackout
    droneGain: 0.22,
    subOsc36Hz: true,
    heartBpm: 88,
    heartPeak: 0.42,
    heartJitter: 0.07,
    bzztActive: true,
    bzztGain: 0.080,
    bzztIntervalMin: 12000,
    bzztIntervalMax: 22000,
    humGain: 0.038,
    vig: 0.94,
    vigRed: 0.40,
    vigClear: 0,
    vigMid: 0,
    dim: 0.40,
    desat: 1.0,
    pulse: true,
    pulseStrong: true,
  },
};

class BlackSpaceAudioEngine {
  private ctx: AudioContext | null = null;
  private isActive: boolean = false;
  private currentIntensity: BlackSpaceIntensity = 0;
  private isMuted: boolean = true;

  // Master bus ceiling = 0.85 (clean audible headroom without clipping)
  private masterBus: GainNode | null = null;
  private readonly MASTER_CEILING: number = 0.85;

  // Drone nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneWarmthOsc: OscillatorNode | null = null;
  private droneSubOsc: OscillatorNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  private droneLfoGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneSubGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // Hum nodes
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  private heartbeatTimeout: number | null = null;
  private bzztTimeout: number | null = null;
  private isTransitioning: boolean = false;
  private currentVig: number = 0;
  private currentVigRed: number = 0;
  private currentVigClear: number = 56;
  private currentVigMid: number = 84;
  private vigAnimId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = audioManager.getMuted();
      audioManager.subscribe((muted) => {
        this.setMuted(muted);
      });

      // Synchronize with Black Space manager state transitions
      blackSpaceManager.subscribe((state) => {
        if (this.isActive) {
          const clicks = Math.min(5, Math.max(0, state.foundCount)) as BlackSpaceIntensity;
          this.setIntensity(clicks);
        }
      });
    }
  }

  /**
   * Initializes audio context and shared master bus
   */
  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {}
      }
      return this.ctx;
    }

    const shared = await audioSynthesizer.getAudioContext();
    if (!shared) return null;
    this.ctx = shared;

    this.setupMasterBus();
    return this.ctx;
  }

  private setupMasterBus(): void {
    if (!this.ctx) return;

    this.masterBus = this.ctx.createGain();
    const initialGain = this.isMuted || !this.isActive ? 0.0001 : this.MASTER_CEILING;
    this.masterBus.gain.setValueAtTime(initialGain, this.ctx.currentTime);
    this.masterBus.connect(this.ctx.destination);
  }

  /**
   * Builds permanent oscillators for Drone and Hospital Hum
   */
  private setupGenerators(): void {
    if (!this.ctx || !this.masterBus) return;
    this.teardownGenerators();

    const now = this.ctx.currentTime;
    const cfg = INTENSITY_TABLE[this.currentIntensity];

    // --- 1. DRONE: sine 55 + sine 55*1.008 (beating), LFO 0.06Hz depth 30% ---
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const dGain = this.ctx.createGain();
    const subGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55.0, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55.0 * 1.008, now); // 55.44Hz beating

    // Acoustic warmth layer (110Hz triangle) ensuring clarity on laptops and small speakers
    const oscWarmth = this.ctx.createOscillator();
    const warmthFilter = this.ctx.createBiquadFilter();
    const warmthGain = this.ctx.createGain();

    oscWarmth.type = 'triangle';
    oscWarmth.frequency.setValueAtTime(110.0, now);
    oscWarmth.detune.setValueAtTime(2, now);

    warmthFilter.type = 'lowpass';
    warmthFilter.frequency.setValueAtTime(200, now);

    warmthGain.gain.setValueAtTime(0.25, now);

    oscWarmth.connect(warmthFilter);
    warmthFilter.connect(warmthGain);
    warmthGain.connect(dGain);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(36.0, now); // L3 sub dread

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(125, now);
    filter.Q.setValueAtTime(0.8, now);

    dGain.gain.setValueAtTime(cfg.droneGain, now);
    subGain.gain.setValueAtTime(cfg.subOsc36Hz ? 0.08 : 0.0001, now);

    // LFO at 0.06Hz modulating drone amplitude by 30%
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, now);
    lfoGain.gain.setValueAtTime(cfg.droneGain * 0.3, now);

    lfo.connect(lfoGain);
    lfoGain.connect(dGain.gain);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(dGain);
    dGain.connect(this.masterBus);

    subOsc.connect(subGain);
    subGain.connect(this.masterBus);

    osc1.start(now);
    osc2.start(now);
    oscWarmth.start(now);
    subOsc.start(now);
    lfo.start(now);

    this.droneOsc1 = osc1;
    this.droneOsc2 = osc2;
    this.droneWarmthOsc = oscWarmth;
    this.droneSubOsc = subOsc;
    this.droneFilter = filter;
    this.droneGain = dGain;
    this.droneSubGain = subGain;
    this.droneLfo = lfo;
    this.droneLfoGain = lfoGain;

    // --- 2. HUM: sine 120Hz at tabled gain ---
    const hOsc = this.ctx.createOscillator();
    const hGain = this.ctx.createGain();

    hOsc.type = 'sine';
    hOsc.frequency.setValueAtTime(120.0, now);
    hGain.gain.setValueAtTime(cfg.humGain, now);

    hOsc.connect(hGain);
    hGain.connect(this.masterBus);
    hOsc.start(now);

    this.humOsc = hOsc;
    this.humGain = hGain;
  }

  private teardownGenerators(): void {
    const safeStop = (node: OscillatorNode | null) => {
      if (!node) return;
      try {
        node.stop();
        node.disconnect();
      } catch {}
    };

    safeStop(this.droneOsc1);
    safeStop(this.droneOsc2);
    safeStop(this.droneWarmthOsc);
    safeStop(this.droneSubOsc);
    safeStop(this.droneLfo);
    safeStop(this.humOsc);

    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneWarmthOsc = null;
    this.droneSubOsc = null;
    this.droneLfo = null;
    this.humOsc = null;

    if (this.droneGain) {
      try { this.droneGain.disconnect(); } catch {}
      this.droneGain = null;
    }
    if (this.droneSubGain) {
      try { this.droneSubGain.disconnect(); } catch {}
      this.droneSubGain = null;
    }
    if (this.droneLfoGain) {
      try { this.droneLfoGain.disconnect(); } catch {}
      this.droneLfoGain = null;
    }
    if (this.humGain) {
      try { this.humGain.disconnect(); } catch {}
      this.humGain = null;
    }
    if (this.droneFilter) {
      try { this.droneFilter.disconnect(); } catch {}
      this.droneFilter = null;
    }
  }

  // =========================================================================
  // HEARTBEAT SYNTHESIS & RECURSIVE CHAIN
  // =========================================================================

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.scheduleNextHeartbeat();
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private scheduleNextHeartbeat(): void {
    if (!this.isActive || this.isMuted) return;

    const cfg = INTENSITY_TABLE[this.currentIntensity];
    if (cfg.heartBpm <= 0 || cfg.heartPeak <= 0) {
      this.stopHeartbeat();
      return;
    }

    const bpm = cfg.heartBpm;
    const peak = cfg.heartPeak;
    const jitter = cfg.heartJitter;

    // Organic timing calculation:
    // Per beat: thump(t, peak) + thump(t+0.28, peak*0.7)
    // wait (60/bpm*1000 - 280) * (1 ± jitter)
    const baseWaitMs = (60 / bpm) * 1000 - 280;
    const jitterMultiplier = 1 + (Math.random() * 2 - 1) * jitter;
    const delayMs = Math.max(120, baseWaitMs * jitterMultiplier);

    this.heartbeatTimeout = window.setTimeout(() => {
      if (!this.isActive || this.isMuted) return;

      const now = this.ctx ? this.ctx.currentTime : 0;
      this.triggerThump(now, peak);
      this.triggerThump(now + 0.28, peak * 0.7);

      this.scheduleNextHeartbeat();
    }, delayMs);
  }

  /**
   * Thump: sine 58->38Hz exp over 0.18s, gain 0->peak in 0.008s, exp decay to 0.0001 over 0.24s
   */
  private triggerThump(startTime: number, peak: number): void {
    if (!this.ctx || !this.masterBus || this.isMuted || !this.isActive) return;

    try {
      // Layer 1: Sub-bass fundamental (58 -> 38Hz)
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(58.0, startTime);
      osc.frequency.exponentialRampToValueAtTime(38.0, startTime + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterBus);

      // Layer 2: Muffled visceral body harmonic (116 -> 76Hz) ensuring laptop & speaker clarity
      const bodyOsc = this.ctx.createOscillator();
      const bodyFilter = this.ctx.createBiquadFilter();
      const bodyGain = this.ctx.createGain();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(116.0, startTime);
      bodyOsc.frequency.exponentialRampToValueAtTime(76.0, startTime + 0.18);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(160, startTime);

      bodyGain.gain.setValueAtTime(0.0001, startTime);
      bodyGain.gain.linearRampToValueAtTime(peak * 0.35, startTime + 0.008);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(this.masterBus);

      osc.start(startTime);
      bodyOsc.start(startTime);
      osc.stop(startTime + 0.25);
      bodyOsc.stop(startTime + 0.25);

      osc.onended = () => {
        try {
          osc.disconnect();
          bodyOsc.disconnect();
          filter.disconnect();
          bodyFilter.disconnect();
          gain.disconnect();
          bodyGain.disconnect();
        } catch {}
      };
    } catch {}
  }

  // =========================================================================
  // BZZT SYNTHESIS & RECURSIVE CHAIN
  // =========================================================================

  private startBzzt(): void {
    this.stopBzzt();
    this.scheduleNextBzzt();
  }

  private stopBzzt(): void {
    if (this.bzztTimeout) {
      clearTimeout(this.bzztTimeout);
      this.bzztTimeout = null;
    }
  }

  private scheduleNextBzzt(): void {
    if (!this.isActive || this.isMuted) return;

    const cfg = INTENSITY_TABLE[this.currentIntensity];
    if (!cfg.bzztActive) {
      this.stopBzzt();
      return;
    }

    const intervalRange = cfg.bzztIntervalMax - cfg.bzztIntervalMin;
    const delayMs = cfg.bzztIntervalMin + Math.random() * intervalRange;

    this.bzztTimeout = window.setTimeout(() => {
      if (!this.isActive || this.isMuted) return;

      this.triggerBzzt(cfg.bzztGain);
      this.scheduleNextBzzt();
    }, delayMs);
  }

  /**
   * Bzzt: sawtooth 165+rand*30Hz -> bandpass 850Hz Q9 -> gain env (0.02 attack, 0.3 release) with 23Hz tremolo, random pan +-0.7
   */
  private triggerBzzt(peakGain: number): void {
    if (!this.ctx || !this.masterBus || this.isMuted || !this.isActive) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const envGain = this.ctx.createGain();
      const tremoloOsc = this.ctx.createOscillator();
      const tremoloGain = this.ctx.createGain();

      const freq = 165 + Math.random() * 30; // 165..195Hz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, now);
      filter.Q.setValueAtTime(9, now);

      // 23Hz tremolo
      tremoloOsc.type = 'sine';
      tremoloOsc.frequency.setValueAtTime(23, now);
      tremoloGain.gain.setValueAtTime(peakGain * 0.55, now);

      // Envelope: 0.02s attack, 0.3s release
      envGain.gain.setValueAtTime(0.0001, now);
      envGain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
      envGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      tremoloOsc.connect(tremoloGain);
      tremoloGain.connect(envGain.gain);

      osc.connect(filter);
      filter.connect(envGain);

      // Stereo pan ±0.7
      if (typeof this.ctx.createStereoPanner === 'function') {
        const panner = this.ctx.createStereoPanner();
        const pan = (Math.random() * 1.4 - 0.7);
        panner.pan.setValueAtTime(pan, now);
        envGain.connect(panner);
        panner.connect(this.masterBus);
      } else {
        envGain.connect(this.masterBus);
      }

      osc.start(now);
      tremoloOsc.start(now);
      osc.stop(now + 0.33);
      tremoloOsc.stop(now + 0.33);

      osc.onended = () => {
        try {
          osc.disconnect();
          filter.disconnect();
          envGain.disconnect();
          tremoloOsc.disconnect();
          tremoloGain.disconnect();
        } catch {}
      };
    } catch {}
  }

  // =========================================================================
  // VIGNETTE OVERLAY CONTROLLER
  // =========================================================================

  private getOrCreateVignette(): HTMLElement | null {
    if (typeof document === 'undefined') return null;

    let el = document.getElementById('bs-vignette');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bs-vignette';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }

  private updateVignette(cfg: IntensityConfig): void {
    const el = this.getOrCreateVignette();
    if (!el) return;

    // Smooth cubic ease-out transition for vignette darkness, crimson edge, and constricting center
    const startVig = this.currentVig;
    const startVigRed = this.currentVigRed;
    const startVigClear = this.currentVigClear;
    const startVigMid = this.currentVigMid;
    const targetVig = cfg.vig;
    const targetVigRed = cfg.vigRed;
    const targetVigClear = cfg.vigClear;
    const targetVigMid = cfg.vigMid;
    const duration = 1400;
    const startTime = performance.now();

    if (this.vigAnimId !== null) {
      cancelAnimationFrame(this.vigAnimId);
      this.vigAnimId = null;
    }

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentVig = startVig + (targetVig - startVig) * ease;
      this.currentVigRed = startVigRed + (targetVigRed - startVigRed) * ease;
      this.currentVigClear = startVigClear + (targetVigClear - startVigClear) * ease;
      this.currentVigMid = startVigMid + (targetVigMid - startVigMid) * ease;

      el.style.setProperty('--vig', this.currentVig.toFixed(4));
      el.style.setProperty('--vigred', this.currentVigRed.toFixed(4));
      el.style.setProperty('--vig-clear', `${this.currentVigClear.toFixed(1)}%`);
      el.style.setProperty('--vig-mid', `${this.currentVigMid.toFixed(1)}%`);

      if (progress < 1) {
        this.vigAnimId = requestAnimationFrame(step);
      } else {
        this.vigAnimId = null;
      }
    };

    this.vigAnimId = requestAnimationFrame(step);

    // Page-wide dimming and desaturation
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--bs-dim', String(cfg.dim));
      document.documentElement.style.setProperty('--bs-desat', String(cfg.desat));
    }

    if (cfg.heartBpm > 0) {
      const beatSeconds = (60 / cfg.heartBpm).toFixed(3);
      el.style.setProperty('--beat', `${beatSeconds}s`);
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--beat', `${beatSeconds}s`);
      }
    }

    if (cfg.pulse) {
      el.classList.add('pulse');
      if (cfg.pulseStrong) {
        el.classList.add('pulse-strong');
      } else {
        el.classList.remove('pulse-strong');
      }
    } else {
      el.classList.remove('pulse', 'pulse-strong');
    }

    if (this.isActive) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  }

  // =========================================================================
  // PUBLIC CONTROLLER API
  // =========================================================================

  /**
   * startBlackSpace(): begin L0 (near-silence)
   * Guarded against double-start.
   */
  public async startBlackSpace(): Promise<void> {
    if (this.isActive && !this.isTransitioning) return;
    this.isActive = true;
    this.isTransitioning = false;
    this.currentIntensity = 0;

    const ctx = await this.ensureAudioContext();
    if (!ctx || !this.masterBus) return;

    this.setupGenerators();

    const now = ctx.currentTime;
    this.masterBus.gain.cancelScheduledValues(now);
    this.masterBus.gain.setValueAtTime(this.masterBus.gain.value, now);
    const targetMaster = this.isMuted ? 0.0001 : this.MASTER_CEILING;
    this.masterBus.gain.linearRampToValueAtTime(targetMaster, now + 1.2);

    this.setIntensity(0);
  }

  /**
   * setIntensity(n): n in 0..5, smooth-lerped (setTargetAtTime, tau ~1.2s)
   */
  public setIntensity(n: number): void {
    const clamped = Math.min(5, Math.max(0, Math.floor(n))) as BlackSpaceIntensity;
    this.currentIntensity = clamped;
    const cfg = INTENSITY_TABLE[clamped];

    this.updateVignette(cfg);
    glitchManager.setIntensity(clamped);

    if (!this.ctx || !this.isActive) return;

    const now = this.ctx.currentTime;
    const tau = 1.2; // Exact smooth-lerp time constant

    // 1. Lerp Drone Gain
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(cfg.droneGain, now, tau);
    }
    if (this.droneLfoGain) {
      this.droneLfoGain.gain.setTargetAtTime(cfg.droneGain * 0.3, now, tau);
    }
    if (this.droneSubGain) {
      this.droneSubGain.gain.setTargetAtTime(cfg.subOsc36Hz ? 0.08 : 0.0001, now, tau);
    }

    // 2. Lerp Hospital Hum
    if (this.humGain) {
      this.humGain.gain.setTargetAtTime(cfg.humGain, now, tau);
    }

    // 3. Update Heartbeat & Bzzt loops
    if (cfg.heartBpm > 0 && cfg.heartPeak > 0) {
      if (!this.heartbeatTimeout) {
        this.startHeartbeat();
      }
    } else {
      this.stopHeartbeat();
    }

    if (cfg.bzztActive) {
      if (!this.bzztTimeout) {
        this.startBzzt();
      }
    } else {
      this.stopBzzt();
    }
  }

  /**
   * stopBlackSpace(): ramp everything to 0, clear schedulers, then hand
   * control back by calling the EXISTING white-space ambience resume function (do not reimplement it)
   */
  public stopBlackSpace(): void {
    if (!this.isActive && !this.isTransitioning) return;
    this.isTransitioning = true;
    this.isActive = false;

    // Clear all schedulers immediately
    this.stopHeartbeat();
    this.stopBzzt();

    // Reset vignette and restore full brightness/saturation
    if (this.vigAnimId !== null) {
      cancelAnimationFrame(this.vigAnimId);
      this.vigAnimId = null;
    }
    this.currentVig = 0;
    this.currentVigRed = 0;
    this.currentVigClear = 56;
    this.currentVigMid = 84;

    const el = this.getOrCreateVignette();
    if (el) {
      el.classList.remove('pulse', 'pulse-strong', 'active');
      el.style.setProperty('--vig', '0');
      el.style.setProperty('--vigred', '0');
      el.style.setProperty('--vig-clear', '56%');
      el.style.setProperty('--vig-mid', '84%');
    }

    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty('--bs-dim');
      document.documentElement.style.removeProperty('--bs-desat');
    }

    glitchManager.stop();

    if (this.masterBus && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterBus.gain.cancelScheduledValues(now);
      this.masterBus.gain.setValueAtTime(this.masterBus.gain.value, now);
      // Smooth ramp to 0 in ~1.2s
      this.masterBus.gain.linearRampToValueAtTime(0.0001, now + 1.2);

      window.setTimeout(() => {
        this.teardownGenerators();
        this.isTransitioning = false;
        // Hand control back by calling EXISTING white-space ambience resume function
        ambientSoundscape.setMode('white-space');
      }, 1250);
    } else {
      this.teardownGenerators();
      this.isTransitioning = false;
      ambientSoundscape.setMode('white-space');
    }
  }

  /**
   * Global mute toggle handling (silence within 1s)
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!this.ctx || !this.masterBus) return;

    const now = this.ctx.currentTime;
    this.masterBus.gain.cancelScheduledValues(now);
    this.masterBus.gain.setValueAtTime(this.masterBus.gain.value, now);

    if (muted) {
      // Silence within 1s
      this.masterBus.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    } else if (this.isActive) {
      this.masterBus.gain.linearRampToValueAtTime(this.MASTER_CEILING, now + 0.8);
      // Resume heart & bzzt if active
      const cfg = INTENSITY_TABLE[this.currentIntensity];
      if (cfg.heartBpm > 0 && !this.heartbeatTimeout) {
        this.startHeartbeat();
      }
      if (cfg.bzztActive && !this.bzztTimeout) {
        this.startBzzt();
      }
    }
  }

  public getIntensity(): BlackSpaceIntensity {
    return this.currentIntensity;
  }
}

export const blackSpaceAudio = new BlackSpaceAudioEngine();
