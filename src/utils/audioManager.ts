// Comprehensive Safe-Handling Audio Manager (BGM & SFX)
// Manages HTML5 Audio for background music with graceful fallbacks and Web Audio API for tactical SFX.

import { audioSynthesizer } from './audioSynthesizer';

type BGMMode = 'white-space' | 'black-space';

const SOUND_STORAGE_KEY = 'porto_sound_muted';

class AudioManager {
  private isMuted: boolean = true;
  private currentMode: BGMMode = 'white-space';
  private bgmAudio: HTMLAudioElement | null = null;
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

    // Initial sync with synthesizer
    audioSynthesizer.setMuted(this.isMuted);

    if (typeof window !== 'undefined') {
      const unlockListener = () => {
        this.hasUserInteracted = true;
        if (!this.isMuted) {
          this.playBGM(this.currentMode);
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

    // Synchronize synthesizer mute state immediately
    audioSynthesizer.setMuted(muted);

    if (this.isMuted) {
      this.stopBGM();
    } else {
      audioSynthesizer.playSakelarSFX();
      // Directly initiate BGM for current mode
      this.playBGM(this.currentMode);
    }

    this.notify();
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  private bgmSessionId: number = 0;

  /**
   * Safe BGM Player:
   * Handles white-space.mp3 and black-space.mp3 with multiple candidate paths
   * and graceful error recovery so UI never freezes or throws unhandled rejections.
   */
  public playBGM(mode: BGMMode): void {
    this.currentMode = mode;
    if (this.isMuted || typeof window === 'undefined') {
      return;
    }

    const sessionId = ++this.bgmSessionId;

    // Stop currently playing track if any
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.src = '';
      } catch {}
      this.bgmAudio = null;
    }

    const candidatePaths =
      mode === 'black-space'
        ? ['/audio/black-space.mp3', '/black-space.mp3']
        : ['/audio/white-space.mp3', '/white-space.mp3'];

    let candidateIndex = 0;

    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = mode === 'black-space' ? 0.4 : 0.3;

    const tryPlayNext = () => {
      if (this.isMuted || this.bgmSessionId !== sessionId) {
        try {
          audio.pause();
          audio.src = '';
        } catch {}
        return;
      }

      if (candidateIndex >= candidatePaths.length) {
        // All MP3 file paths 404'd or failed to load:
        // Graceful procedural ambient synth fallback so music NEVER vanishes!
        if (!this.isMuted && this.bgmSessionId === sessionId) {
          audioSynthesizer.startAmbientBGM(mode);
        }
        return;
      }
      const path = candidatePaths[candidateIndex];
      candidateIndex++;
      audio.src = path;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (this.isMuted || this.bgmSessionId !== sessionId) {
              try {
                audio.pause();
                audio.src = '';
              } catch {}
              audioSynthesizer.stopAmbientBGM();
              return;
            }
            // Physical MP3 succeeded! Stop procedural synth bed
            audioSynthesizer.stopAmbientBGM();
          })
          .catch(() => {
            if (this.isMuted || this.bgmSessionId !== sessionId) return;
            // If playback failed or 404, try next candidate path or fallback to synth
            tryPlayNext();
          });
      }
    };

    audio.onerror = () => {
      if (this.isMuted || this.bgmSessionId !== sessionId) return;
      tryPlayNext();
    };

    this.bgmAudio = audio;
    tryPlayNext();
  }

  public stopBGM(): void {
    this.bgmSessionId++;
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.src = '';
      } catch {}
      this.bgmAudio = null;
    }
    audioSynthesizer.stopAmbientBGM();
  }

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
