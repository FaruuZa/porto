// Unified Audio System bridging SFX Synthesizer and Safe BGM Manager
import {
  audioSynthesizer,
  playSakelarSFX,
  playLampuKedipSFX,
  playBlackSpaceTriggerSFX,
  playBulbBuzzSFX
} from './audioSynthesizer';
import { audioManager } from './audioManager';
import { ambientSoundscape } from './ambientSoundscape';
import { blackSpaceAudio } from './blackSpaceAudio';

export const sound = {
  // Unified Sound Control (BGM + SFX simultaneously)
  toggleMute: () => audioManager.toggleMute(),
  getMuted: () => audioManager.getMuted(),
  setMuted: (muted: boolean) => audioManager.setMuted(muted),
  subscribe: (listener: (isMuted: boolean) => void) => audioManager.subscribe(listener),
  handleThemeChange: (theme: 'dark' | 'light' | 'black-space') => audioManager.handleThemeChange(theme),
  playBGM: (mode: 'white-space' | 'black-space') => audioManager.playBGM(mode),

  // Tactical Synthesized SFX:
  playTextBlip: () => audioSynthesizer.playTextBlip(),
  playSelect: () => audioSynthesizer.playSakelarSFX(),
  playTear: () => audioSynthesizer.playSakelarSFX(),
  playHit: () => audioSynthesizer.playLampuKedipSFX(),
  playSecret: () => audioSynthesizer.playSecret(),
  playGlitch: () => audioSynthesizer.playBlackSpaceTriggerSFX(),
  playWakeUp: () => audioSynthesizer.playWakeUp(),
  playBulbBuzzSFX: (intensity?: 'gentle' | 'strong') => audioSynthesizer.playBulbBuzzSFX(intensity),
  playSakelarSFX,
  playLampuKedipSFX,
  playBlackSpaceTriggerSFX,
};

export {
  audioSynthesizer,
  ambientSoundscape,
  blackSpaceAudio,
  audioManager,
  playSakelarSFX,
  playLampuKedipSFX,
  playBlackSpaceTriggerSFX,
  playBulbBuzzSFX
};
