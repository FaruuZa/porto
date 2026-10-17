// Comprehensive Safe-Handling Audio Manager (BGM & SFX)
// Manages Generative Web Audio ambient soundscapes and tactical UI sound effects.

import { audioSynthesizer } from './audioSynthesizer';
import { ambientSoundscape, type AmbientMode } from './ambientSoundscape';

export type BGMMode = AmbientMode;

const SOUND_STORAGE_KEY = 'porto_sound_muted';

class AudioManager {
  private isMuted: boolean = true;
  private currentMode: BGMMode = 'white-space';
  private listeners: Set<(isMuted: boolean) => void> = new Set();
  private hasUserInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SOUND_STORAGE_KEY);
        if (saved === 'false') {
          this.isMuted = false;
        } else if (saved === 'true') {
          this.isMuted = true;
        }
      } catch {}
    }

    // Initial sync with synthesizer and ambient soundscape
    audioSynthesizer.setMuted(this.isMuted);
    ambientSoundscape.setMuted(this.isMuted);

    if (typeof window !== 'undefined') {
      const unlockListener = () => {
        this.hasUserInteracted = true;
        if (!this.isMuted) {
          ambientSoundscape.setMuted(false);
          ambientSoundscape.setMode(this.currentMode);
        }
        window.removeEventListener('click', unlockListener);
        window.removeEventListener('keydown', unlockListener);
        window.removeEventListener('touchstart', unlockListener);
      };

      window.addEventListener('click', unlockListener, { passive: true });
      window.addEventListener('keydown', unlockListener, { passive: true });
      window.addEventListener('touchstart', unlockListener, { passive: true });
    }
  }

  public subscribe(listener: (isMuted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.isMuted));
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    this.hasUserInteracted = true;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(muted));
      } catch {}
    }

    // Synchronize both synthesizer and ambient soundscape engines
    audioSynthesizer.setMuted(muted);
    ambientSoundscape.setMuted(muted);

    if (this.isMuted) {
      this.stopBGM();
    } else {
      audioSynthesizer.playSakelarSFX();
      // Smoothly activate current mode with crossfaded ambient generator
      this.playBGM(this.currentMode);
    }

    this.notify();
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  /**
   * Generative Ambient BGM Player:
   * Pure procedural Web Audio synthesis for White Space and Black Space.
   * Employs 2.5s crossfade between states. Zero external MP3 files required.
   */
  public playBGM(mode: BGMMode): void {
    this.currentMode = mode;
    if (this.isMuted || typeof window === 'undefined') {
      return;
    }

    ambientSoundscape.setMode(mode);
  }

  public stopBGM(): void {
    ambientSoundscape.setMuted(true);
  }

  /**
   * Handle theme transitions (Dark/Light -> White Space, Black Space -> Black Space)
   * Crossfades ambient soundscape smoothly over 2.5 seconds.
   */
  public handleThemeChange(theme: 'dark' | 'light' | 'black-space'): void {
    const targetMode: BGMMode = theme === 'black-space' ? 'black-space' : 'white-space';
    const modeChanged = this.currentMode !== targetMode;
    this.currentMode = targetMode;

    if (!this.isMuted && modeChanged) {
      this.playBGM(targetMode);
    }
  }
}

export const audioManager = new AudioManager();
