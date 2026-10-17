import React, { useState, useEffect, useMemo } from 'react';
import { sound } from '../utils/audio';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { ThemeMode } from '../App';
import { useLanguage } from '../utils/languageContext';
import { BlackScribble } from './BlackScribble';
import { useSanityProfile } from '../sanity/useSanityProfile';
import { getLocalizedText } from '../utils/projectHelpers';

interface HeroSectionProps {
  theme: ThemeMode;
  onEnterBlackSpace: () => void;
  onWakeUp: () => void;
  bulbTriggerSignal?: number;
  onNavigateSection?: (sectionId: string) => void;
}

const BULB_MESSAGE_POOL_EN = [
  "A black lightbulb hangs from the ceiling. It feels cold to the touch.",
  "The bulb sways quietly. A faint hum echoes from the wire.",
  "The bulb flickers dimly. It absorbs the harsh lights of the outer world.",
  "Waiting for something to happen?",
  "A cold chill creeps up your neck.",
  "You feel like you have been here for as long as you can remember.",
  "The filament vibrates with a quiet, menacing frequency.",
  "Did you see something moving in the corner of your eye?",
  "Everything is going to be okay. Everything is going to be okay.",
  "A faint whisper echoes: 'Do you really want to wake up?'",
  "The shadows stretch quietly across the floor.",
  "The room feels colder than before.",
  "Don't stare directly into the glass...",
  "An erratic pop. The wire trembles.",
];

const BULB_MESSAGE_POOL_ID = [
  "Sebuah bohlam hitam tergantung dari langit-langit. Terasa dingin saat disentuh.",
  "Bohlam berayun pelan. Dengungan halus terdengar dari kawat.",
  "Bohlam berkedip redup, menyerap cahaya dari dunia luar.",
  "Menunggu sesuatu terjadi?",
  "Hawa dingin merayap perlahan di tengkukmu.",
  "Kamu merasa telah berada di sini selama yang kamu ingat.",
  "Filamen bergetar dengan frekuensi yang mengusik pikiran.",
  "Apakah kamu melihat sesuatu bergerak di sudut matamu?",
  "Semuanya akan baik-baik saja. Semuanya akan baik-baik saja.",
  "Bisikan samar terdengar: 'Apakah kamu benar-benar ingin bangun?'",
  "Bayangan memanjang di lantai ruangan.",
  "Ruangan ini terasa lebih dingin dari sebelumnya.",
  "Jangan menatap langsung ke dalam kaca bohlam...",
  "Percikan kecil terdengar. Kawat bergetar.",
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  theme,
  onEnterBlackSpace,
  bulbTriggerSignal,
  onNavigateSection,
}) => {
  const { lang } = useLanguage();
  const { profile } = useSanityProfile();
  const isBlackSpace = theme === 'black-space';
  const [clickCount, setClickCount] = useState(0);
  const [isFlickering, setIsFlickering] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  const bulbPool = lang === 'id' ? BULB_MESSAGE_POOL_ID : BULB_MESSAGE_POOL_EN;

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  // Reset state when leaving Black Space
  useEffect(() => {
    if (!isBlackSpace) {
      setClickCount(0);
      setIsFlickering(false);
      setCurrentMessageIndex(0);
    }
  }, [isBlackSpace]);

  // Keyboard Enter / Space trigger on Hero section
  useEffect(() => {
    if (bulbTriggerSignal && bulbTriggerSignal > 0) {
      handleBulbClick();
    }
  }, [bulbTriggerSignal]);

  const handleBulbClick = () => {
    if (isBlackSpace) {
      // In Black Space: The crimson bulb watches in silence.
      // It does NOT wake you up (only the "Wake up" button does).
      sound.playSakelarSFX();
      return;
    }

    // White Space click progression:
    if (isFlickering) {
      // Repeated clicks after flicker trigger transition into Black Space
      sound.playBlackSpaceTriggerSFX();
      setIsFlickering(false);
      setClickCount(0);
      onEnterBlackSpace();
      return;
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    const nextMsgIdx = Math.floor(Math.random() * bulbPool.length);
    setCurrentMessageIndex(nextMsgIdx);

    if (nextCount >= 5) {
      // Slight flicker / subtle visual response on repeated clicks
      const triggered = Math.random() < 0.5 || nextCount >= 7;
      if (triggered) {
        setIsFlickering(true);
        sound.playLampuKedipSFX();
      } else {
        sound.playSakelarSFX();
      }
    } else {
      sound.playSakelarSFX();
    }
  };

  // Restrained pendulum animations
  let pendulumAnimationClass = '';
  let flickerAnimationClass = '';

  if (isBlackSpace) {
    pendulumAnimationClass = 'animate-pendulum-blackspace';
    flickerAnimationClass = 'animate-blackspace-flicker';
  } else if (isFlickering) {
    pendulumAnimationClass = 'animate-pendulum-panic';
    flickerAnimationClass = 'animate-bulb-flicker';
  } else if (clickCount >= 3) {
    pendulumAnimationClass = 'animate-pendulum-swing';
  } else if (clickCount >= 1) {
    pendulumAnimationClass = 'animate-pendulum-gentle';
  }

  const currentBulbNote = useMemo(() => {
    if (isBlackSpace) {
      return puzzleState.canWakeUp
        ? lang === 'id'
          ? "Bohlam merah menatap dalam hening. Sesuatu bergerak perlahan..."
          : "The crimson bulb watches in silence. Something stirs..."
        : lang === 'id'
        ? "Bohlam merah menatap dalam hening. Masih ada sesuatu yang belum terkuak..."
        : "The crimson bulb watches in silence. Something remains hidden...";
    }
    if (isFlickering) {
      return lang === 'id'
        ? "Filamen bergetar redup. Bayangan bergerak perlahan di sudut ruangan..."
        : "The filament flickers dimly. Shadows twitch against the walls...";
    }
    if (clickCount === 0) {
      return lang === 'id'
        ? "Sebuah bohlam hitam tergantung dari langit-langit. Terasa dingin saat disentuh."
        : "A black lightbulb hangs from the ceiling. It feels cold to the touch.";
    }
    return bulbPool[currentMessageIndex % bulbPool.length];
  }, [isBlackSpace, isFlickering, clickCount, currentMessageIndex, puzzleState.canWakeUp, lang, bulbPool]);

  // Find scribble for hero section if selected in this Black Space session
  const heroScribble: ScribbleLocation | undefined = useMemo(() => {
    if (!isBlackSpace) return undefined;
    return puzzleState.scribbles.find((s) => s.section === 'hero');
  }, [isBlackSpace, puzzleState.scribbles]);

  return (
    <section
      id="hero"
      className="section-shell font-mono"
    >
      <div className="section-inner items-center relative">
        
        {/* Hanging Lightbulb Assembly */}
        <div
          id="hero-bulb"
          onClick={handleBulbClick}
          onMouseEnter={() => sound.playTextBlip()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBulbClick();
            }
          }}
          className={`cursor-pointer transition-transform duration-300 origin-top focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] rounded-sm p-1 select-none ${pendulumAnimationClass}`}
          style={{ transformOrigin: '50% 0' }}
          title={isBlackSpace ? "The crimson bulb" : "A hanging lightbulb..."}
          aria-label="Omori hanging lightbulb"
        >
          <svg
            width="34"
            height="76"
            viewBox="0 0 36 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            <circle cx="18" cy="2" r="2.5" fill="var(--border-color)" />
            <line
              x1="18"
              y1="2"
              x2="18"
              y2="52"
              stroke="var(--border-color)"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <rect
              x="14"
              y="52"
              width="8"
              height="7"
              rx="1"
              fill="var(--border-color)"
            />
            <line x1="14" y1="54.5" x2="22" y2="54.5" stroke="var(--bg-color)" strokeWidth="0.8" />
            <line x1="14" y1="57" x2="22" y2="57" stroke="var(--bg-color)" strokeWidth="0.8" />

            <g className={flickerAnimationClass}>
              <path
                d="M14.5 59 C13 62 10 65 10 70 A8 8 0 1 0 26 70 C26 65 23 62 21.5 59 Z"
                fill={
                  isBlackSpace
                    ? "#1a0306"
                    : theme === 'light'
                    ? "#18181b"
                    : "#0c0d12"
                }
                stroke={
                  isBlackSpace
                    ? "#ef4444"
                    : isFlickering
                    ? "#e03131"
                    : "var(--text-main)"
                }
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 68 L17.5 64 L18.5 64 L20.5 68"
                stroke={
                  isBlackSpace
                    ? "#8b0000"
                    : isFlickering
                    ? "#e03131"
                    : "var(--border-color)"
                }
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle
                cx="18"
                cy="64"
                r="1.2"
                fill={
                  isBlackSpace
                    ? "#8b0000"
                    : isFlickering
                    ? "#e03131"
                    : "none"
                }
              />
            </g>
          </svg>
        </div>

        {/* Psychological Status Note under Bulb */}
        <div className="mt-2 text-center max-w-sm sm:max-w-md px-2">
          <p
            data-no-glitch="true"
            aria-live="polite"
            className={`text-[11px] sm:text-xs italic leading-snug min-h-[2.75em] transition-colors duration-300 ${
              isBlackSpace
                ? 'text-[var(--text-muted)] italic'
                : isFlickering
                ? 'text-red-500 font-semibold animate-pulse'
                : 'text-[var(--text-muted)]'
            }`}
          >
            "{currentBulbNote}"
          </p>
        </div>

        {/* Iconic Omori Dialogue Box (White Space Chamber & Student Bio) */}
        <div className="omori-box p-4 sm:p-6 text-[var(--text-main)] w-full relative shadow-2xl mt-3 sm:mt-4">
          
          {/* Slot 0: Nested in dialogue box bottom corner */}
          {heroScribble && heroScribble.slotIndex === 0 && (
            <div className="absolute -bottom-3 -left-2 z-20">
              <BlackScribble scribble={heroScribble} />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span data-no-glitch="true" className="text-[10px] sm:text-[11px] text-[var(--accent-red)] uppercase tracking-widest font-bold">
                {isBlackSpace ? (
                  <span>
                    &gt; BLACK SPACE // MEMORY CORRUPTION
                  </span>
                ) : (
                  '> SYSTEM DIALOGUE'
                )}
              </span>

              {/* Slot 1: Alongside system dialogue marker */}
              {heroScribble && heroScribble.slotIndex === 1 && (
                <BlackScribble scribble={heroScribble} className="ml-1" />
              )}
            </div>

            {isBlackSpace ? (
              <span data-no-glitch="true" className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider opacity-80 hidden sm:inline font-bold">
                [RECORD_#01]
              </span>
            ) : (
              <span className="font-handwriting text-xs sm:text-sm text-[var(--accent-red)] text-line-boil select-none hidden sm:inline">
                ~ {lang === 'id' ? 'tarik kawat bohlam' : 'pull the bulb cord'}
              </span>
            )}
          </div>

          <h1 data-no-glitch="true" className="text-lg sm:text-2xl font-bold mb-2.5 leading-tight text-[var(--text-main)]">
            {isBlackSpace ? (
              <span>
                Welcome to <span className="text-[var(--accent-red)] font-bold">Black Space</span>.
              </span>
            ) : (
              'Welcome to White Space.'
            )}
          </h1>

          <div className="text-xs sm:text-sm leading-relaxed mb-3.5 font-sans">
            {isBlackSpace ? (
              <div className="text-[var(--text-main)]/85 italic">
                <span>"A quiet domain where coursework, curiosity, and unfinished prototypes intertwine.{' '}</span>
                <span>You have been experimenting here for as long as you can remember.{' '}</span>
                <span>Waiting for something to happen?"</span>
              </div>
            ) : (
              <p className="text-[var(--text-main)] whitespace-pre-line">
                {getLocalizedText(profile.heroBio, lang)}
              </p>
            )}
          </div>

          {/* Academic & Status HUD */}
          <div className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono border-t border-[var(--border-color)] pt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <span>{lang === 'id' ? 'IPK' : 'GPA'}: <strong className="text-[var(--text-main)]">{isBlackSpace ? '???' : (profile.education?.gpa || '3.72')}</strong></span>
            <span className="opacity-40">•</span>
            <span>Semester: <strong className="text-[var(--text-main)]">{isBlackSpace ? '?' : (profile.education?.semester ?? 5)}</strong></span>
            <span className="opacity-40">•</span>
            <span>Status: <strong className="text-[var(--text-main)]">{isBlackSpace ? '???' : getLocalizedText(profile.status, lang)}</strong></span>
            <span className="opacity-40">•</span>
            <span>{lang === 'id' ? 'Domisili' : 'Location'}: <strong className="text-[var(--text-main)]">{isBlackSpace ? '???' : (profile.location || 'Jember, ID')}</strong></span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-5 w-full flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center justify-center gap-2.5 sm:gap-3 relative">
          <button
            onClick={() => onNavigateSection?.('projects')}
            onMouseEnter={() => sound.playTextBlip()}
            className="press group px-5 py-2.5 sketch-border border-[var(--text-main)] bg-[var(--paper-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] text-[var(--text-main)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{lang === 'id' ? '[ LIHAT PROYEK' : '[ VIEW PROJECTS'}</span>
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            <span>]</span>
          </button>
          <button
            onClick={() => onNavigateSection?.('contact')}
            onMouseEnter={() => sound.playTextBlip()}
            className="press px-5 py-2.5 sketch-border hover:border-[var(--text-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs flex items-center justify-center cursor-pointer"
          >
            <span>{lang === 'id' ? '[ HUBUNGI SAYA ]' : '[ CONTACT ME ]'}</span>
          </button>

          {/* Slot 2: Tucked quietly near the button row */}
          {heroScribble && heroScribble.slotIndex === 2 && (
            <div className="absolute -bottom-8 right-2 sm:right-0">
              <BlackScribble scribble={heroScribble} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
