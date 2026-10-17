// Generative Atmospheric Soundscape Engine (Web Audio API)
// Inspired by OMORI sound design:
// - White Space: Sparse, melancholic generative piano, room tone, warm pad, empty room reverb.
// - Black Space: Ominous beating sub-bass drone, organic irregular heartbeat, sporadic neon bzzt, hospital hum.
// - Seamless 2.5s crossfade between states. Zero audio files required.

import { audioSynthesizer } from './audioSynthesizer';

export type AmbientMode = 'white-space' | 'black-space';

// A Minor Pentatonic Scale Frequencies across octaves 3–5
const WHITE_SPACE_NOTES = [
  220.0,   // A3
  261.63,  // C4
  293.66,  // D4
  329.63,  // E4
  392.0,   // G4
  440.0,   // A4
  523.25,  // C5
  587.33,  // D5
  659.25,  // E5
];

class AmbientSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private currentMode: AmbientMode = 'white-space';
  private isRunning: boolean = false;

  // Master & Channel Routing Nodes
  private masterGain: GainNode | null = null;
  private whiteGain: GainNode | null = null;
  private blackGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;

  // White Space Active Nodes & Timers
  private whitePadOsc1: OscillatorNode | null = null;
  private whitePadOsc2: OscillatorNode | null = null;
  private whitePadLfo: OscillatorNode | null = null;
  private whitePadGain: GainNode | null = null;
  private whiteRoomToneSource: AudioBufferSourceNode | null = null;
  private whitePianoTimeout: number | null = null;

  // Black Space Active Nodes & Timers
  private blackDroneOsc1: OscillatorNode | null = null;
  private blackDroneOsc2: OscillatorNode | null = null;
  private blackDroneLfo: OscillatorNode | null = null;
  private blackDroneGain: GainNode | null = null;
  private blackHospitalHumOsc: OscillatorNode | null = null;
  private blackHospitalNoiseSource: AudioBufferSourceNode | null = null;
  private blackHeartbeatTimeout: number | null = null;
  private blackBzztTimeout: number | null = null;

  constructor() {
    // Lazily initialized on first user interaction via audioManager
  }

  /**
   * Initializes audio context and shared routing graph
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

    try {
      this.setupRoutingGraph();
    } catch (e) {
      console.warn('Failed to setup ambient routing graph:', e);
    }

    return this.ctx;
  }

  /**
   * Builds the dual-channel routing graph with 2.5s crossfade bus
   */
  private setupRoutingGraph(): void {
    if (!this.ctx) return;

    // Master Bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Channel 1: White Space Gain Bus
    this.whiteGain = this.ctx.createGain();
    this.whiteGain.gain.setValueAtTime(
      this.currentMode === 'white-space' && !this.isMuted ? 1.0 : 0.0001,
      this.ctx.currentTime
    );
    this.whiteGain.connect(this.masterGain);

    // Channel 2: Black Space Gain Bus
    this.blackGain = this.ctx.createGain();
    this.blackGain.gain.setValueAtTime(
      this.currentMode === 'black-space' && !this.isMuted ? 1.0 : 0.0001,
      this.ctx.currentTime
    );
    this.blackGain.connect(this.masterGain);

    // Light Room Reverb for White Space (Infinite quiet empty room)
    try {
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.generateImpulseResponse(this.ctx, 3.2, 2.2);

      const reverbFilter = this.ctx.createBiquadFilter();
      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      this.reverbWetGain = this.ctx.createGain();
      this.reverbWetGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.reverbNode.connect(reverbFilter);
      reverbFilter.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.whiteGain);
    } catch {
      this.reverbNode = null;
    }
  }

  /**
   * Generates a synthetic impulse response modeling a quiet, cavernous empty white room
   */
  private generateImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Exponential decay envelope with subtle diffusion
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (1 - t * 0.4);
      }
    }

    return impulse;
  }

  /**
   * Generates a reusable smooth looped noise buffer for room tones
   */
  private createNoiseBuffer(ctx: AudioContext, seconds: number = 3): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    // Pink-leaning low-frequency filtered random noise
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = data[i];
    }

    return buffer;
  }

  // =========================================================================
  // WHITE SPACE ("Ruang Tenang") GENERATIVE ENGINE
  // =========================================================================

  private startWhiteSpace(): void {
    if (!this.ctx || !this.whiteGain) return;
    this.stopWhiteSpace();

    const now = this.ctx.currentTime;

    // --- 1. Room Tone: Noise lowpass (nyaris tak terdengar, gain 0.007) ---
    try {
      const noiseBuffer = this.createNoiseBuffer(this.ctx, 4);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(135, now);
      noiseFilter.Q.setValueAtTime(0.7, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.007, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.whiteGain);

      noiseSource.start(now);
      this.whiteRoomToneSource = noiseSource;
    } catch {}

    // --- 2. Warm Subtle Pad: Two octave sines (A2 110Hz + A3 220Hz), slow LFO ---
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      const padFilter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110.0, now); // A2
      osc1.detune.setValueAtTime(-2, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220.0, now); // A3
      osc2.detune.setValueAtTime(2, now);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(320, now);

      padGain.gain.setValueAtTime(0.016, now);

      // Slow LFO (0.055Hz) modulating pad gain
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.055, now);
      lfoGain.gain.setValueAtTime(0.006, now);

      lfo.connect(lfoGain);
      lfoGain.connect(padGain.gain);

      osc1.connect(padFilter);
      osc2.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(this.whiteGain);

      // Subtle send to reverb
      if (this.reverbNode) {
        padGain.connect(this.reverbNode);
      }

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this.whitePadOsc1 = osc1;
      this.whitePadOsc2 = osc2;
      this.whitePadLfo = lfo;
      this.whitePadGain = padGain;
    } catch {}

    // --- 3. Generative Piano Scheduler: Note every 4-9s, A minor pentatonic ---
    this.scheduleNextPianoNote(1500); // First note after 1.5s
  }

  private scheduleNextPianoNote(delayMs?: number): void {
    if (!this.isRunning || this.currentMode !== 'white-space' || this.isMuted) return;

    // Delay: 4 to 9 seconds (randomized ±20%)
    const delay = delayMs !== undefined ? delayMs : (4000 + Math.random() * 5000) * (0.8 + Math.random() * 0.4);

    this.whitePianoTimeout = window.setTimeout(() => {
      this.playGenerativePianoNote();
      this.scheduleNextPianoNote();
    }, delay);
  }

  /**
   * Synthesizes a single generative piano tone (or occasional third/fifth interval)
   * Slow attack (0.5s), long release (3-4s), delicate gain (0.05-0.11), warm felt timbre.
   */
  private playGenerativePianoNote(): void {
    if (!this.ctx || !this.whiteGain || this.isMuted || this.currentMode !== 'white-space') return;

    try {
      const now = this.ctx.currentTime;
      const noteIdx = Math.floor(Math.random() * WHITE_SPACE_NOTES.length);
      const baseFreq = WHITE_SPACE_NOTES[noteIdx];

      // Play fundamental note
      this.triggerPianoVoice(baseFreq, now, 0.08 + Math.random() * 0.035);

      // Occasional gentle harmonic interval (third or fifth) ~25% of the time
      if (Math.random() < 0.25) {
        const isFifth = Math.random() > 0.5;
        // Minor third: +3 semitones (~1.1892), Fifth: +7 semitones (~1.4983)
        const intervalRatio = isFifth ? 1.4983 : 1.1892;
        const intervalFreq = baseFreq * intervalRatio;
        // Slightly delayed and quieter for natural organic human touch
        this.triggerPianoVoice(intervalFreq, now + 0.12, 0.05 + Math.random() * 0.025);
      }
    } catch {}
  }

  private triggerPianoVoice(freq: number, startTime: number, targetGain: number): void {
    if (!this.ctx || !this.whiteGain) return;

    // Harmonic layers for authentic felt-upright piano timbre:
    // Layer 1: Sine fundamental
    const fundOsc = this.ctx.createOscillator();
    fundOsc.type = 'sine';
    fundOsc.frequency.setValueAtTime(freq, startTime);

    // Layer 2: Soft triangle body
    const bodyOsc = this.ctx.createOscillator();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(freq, startTime);
    bodyOsc.detune.setValueAtTime(2.5, startTime);

    // Layer 3: Faint upper sparkle overtone (2nd harmonic)
    const chimeOsc = this.ctx.createOscillator();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(freq * 2, startTime);
    chimeOsc.detune.setValueAtTime(-3, startTime);

    // Lowpass filter for warm felt hammer strike (no harsh digital buzz)
    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'lowpass';
    voiceFilter.frequency.setValueAtTime(850, startTime);
    voiceFilter.frequency.exponentialRampToValueAtTime(340, startTime + 3.5);

    // Amplitude Envelope: Slow attack (~0.5s), Long release (~3.5s)
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, startTime);
    voiceGain.gain.linearRampToValueAtTime(targetGain, startTime + 0.48);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.8);

    const bodyGain = this.ctx.createGain();
    bodyGain.gain.setValueAtTime(0.35, startTime);

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.12, startTime);

    fundOsc.connect(voiceFilter);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(voiceFilter);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(voiceFilter);

    voiceFilter.connect(voiceGain);

    // Dry bus
    voiceGain.connect(this.whiteGain);

    // Wet Reverb bus (spacious empty room)
    if (this.reverbNode) {
      voiceGain.connect(this.reverbNode);
    }

    fundOsc.start(startTime);
    bodyOsc.start(startTime);
    chimeOsc.start(startTime);

    fundOsc.stop(startTime + 3.9);
    bodyOsc.stop(startTime + 3.9);
    chimeOsc.stop(startTime + 3.9);
  }

  private stopWhiteSpace(): void {
    if (this.whitePianoTimeout) {
      clearTimeout(this.whitePianoTimeout);
      this.whitePianoTimeout = null;
    }

    if (this.whiteRoomToneSource) {
      try {
        this.whiteRoomToneSource.stop();
        this.whiteRoomToneSource.disconnect();
      } catch {}
      this.whiteRoomToneSource = null;
    }

    if (this.whitePadOsc1) {
      try {
        this.whitePadOsc1.stop();
        this.whitePadOsc1.disconnect();
      } catch {}
      this.whitePadOsc1 = null;
    }

    if (this.whitePadOsc2) {
      try {
        this.whitePadOsc2.stop();
        this.whitePadOsc2.disconnect();
      } catch {}
      this.whitePadOsc2 = null;
    }

    if (this.whitePadLfo) {
      try {
        this.whitePadLfo.stop();
        this.whitePadLfo.disconnect();
      } catch {}
      this.whitePadLfo = null;
    }
  }

  // =========================================================================
  // BLACK SPACE ("Bangsal") GENERATIVE ENGINE
  // =========================================================================

  private startBlackSpace(): void {
    // Black Space audio is handled by dedicated blackSpaceAudio.ts module
    this.stopBlackSpace();
  }

  private stopBlackSpace(): void {
    if (this.blackHeartbeatTimeout) {
      clearTimeout(this.blackHeartbeatTimeout);
      this.blackHeartbeatTimeout = null;
    }

    if (this.blackBzztTimeout) {
      clearTimeout(this.blackBzztTimeout);
      this.blackBzztTimeout = null;
    }

    if (this.blackDroneOsc1) {
      try {
        this.blackDroneOsc1.stop();
        this.blackDroneOsc1.disconnect();
      } catch {}
      this.blackDroneOsc1 = null;
    }

    if (this.blackDroneOsc2) {
      try {
        this.blackDroneOsc2.stop();
        this.blackDroneOsc2.disconnect();
      } catch {}
      this.blackDroneOsc2 = null;
    }

    if (this.blackDroneLfo) {
      try {
        this.blackDroneLfo.stop();
        this.blackDroneLfo.disconnect();
      } catch {}
      this.blackDroneLfo = null;
    }

    if (this.blackHospitalHumOsc) {
      try {
        this.blackHospitalHumOsc.stop();
        this.blackHospitalHumOsc.disconnect();
      } catch {}
      this.blackHospitalHumOsc = null;
    }

    if (this.blackHospitalNoiseSource) {
      try {
        this.blackHospitalNoiseSource.stop();
        this.blackHospitalNoiseSource.disconnect();
      } catch {}
      this.blackHospitalNoiseSource = null;
    }
  }

  // =========================================================================
  // PUBLIC CONTROLLER & SMOOTH 2.5s CROSSFADE
  // =========================================================================

  /**
   * Sets mode ('white-space' or 'black-space') with a silky 2.5-second crossfade
   */
  public async setMode(mode: AmbientMode): Promise<void> {
    const modeChanged = this.currentMode !== mode;
    this.currentMode = mode;

    const ctx = await this.ensureAudioContext();
    if (!ctx || !this.whiteGain || !this.blackGain) return;

    if (!this.isRunning) {
      this.isRunning = true;
      this.startWhiteSpace();
      this.startBlackSpace();
    }

    const now = ctx.currentTime;
    const fadeDuration = 2.5; // Exactly 2.5s crossfade per specification

    if (mode === 'white-space') {
      // Fade White in, Black out
      this.whiteGain.gain.cancelScheduledValues(now);
      this.whiteGain.gain.setValueAtTime(this.whiteGain.gain.value, now);
      this.whiteGain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);

      this.blackGain.gain.cancelScheduledValues(now);
      this.blackGain.gain.setValueAtTime(this.blackGain.gain.value, now);
      this.blackGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);

      // If switching modes, ensure fresh scheduler starts
      if (modeChanged) {
        this.scheduleNextPianoNote(1200);
      }
    } else {
      // Fade Black in, White out (Black Space audio handled by blackSpaceAudio)
      this.whiteGain.gain.cancelScheduledValues(now);
      this.whiteGain.gain.setValueAtTime(this.whiteGain.gain.value, now);
      this.whiteGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);

      this.blackGain.gain.cancelScheduledValues(now);
      this.blackGain.gain.setValueAtTime(this.blackGain.gain.value, now);
      this.blackGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
    }
  }

  /**
   * Updates mute state with gentle master gain ramp (0 clicks/pops)
   */
  public async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;

    if (!muted) {
      const ctx = await this.ensureAudioContext();
      if (!ctx || !this.masterGain) return;

      if (!this.isRunning) {
        this.isRunning = true;
        this.startWhiteSpace();
        this.startBlackSpace();
      }

      // Smooth un-mute ramp
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(1.0, now + 1.2);

      // Refresh mode gains
      await this.setMode(this.currentMode);
    } else {
      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
      }
    }
  }

  /**
   * Full shutdown of generators
   */
  public stop(): void {
    this.isRunning = false;
    this.stopWhiteSpace();
    this.stopBlackSpace();
  }
}

export const ambientSoundscape = new AmbientSoundscapeEngine();
