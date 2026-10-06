import React, { useState, useEffect, useMemo } from 'react';
import { sound } from '../utils/audio';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { RedactedText } from './RedactedText';
import { ThemeMode } from '../App';
import { useLanguage } from '../utils/languageContext';

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
  "The shadows stretch violently across the floor.",
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
  onWakeUp,
  bulbTriggerSignal,
  onNavigateSection,
}) => {
  const { lang } = useLanguage();
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

  // Reset state when theme changes
  useEffect(() => {
    if (!isBlackSpace) {
      setClickCount(0);
      setIsFlickering(false);
    }
  }, [isBlackSpace]);

  // Keyboard Enter / Space trigger
  useEffect(() => {
    if (bulbTriggerSignal && bulbTriggerSignal > 0) {
      handleBulbClick();
    }
  }, [bulbTriggerSignal]);

  const handleBulbClick = () => {
    if (isBlackSpace) {
      sound.playSakelarSFX();
      // In Black Space: Wake up ONLY if challenge is completed (all anomalies found)!
      if (puzzleState.canWakeUp) {
        onWakeUp();
        return;
      }
      // Strictly no shortcut: just cycle psychological note
      const nextMsgIdx = Math.floor(Math.random() * bulbPool.length);
      setCurrentMessageIndex(nextMsgIdx);
      return;
    }

    // Probability-Based Click Logic:
    if (isFlickering) {
      // 100% trigger to Black Space on the click following the flicker!
      sound.playBlackSpaceTriggerSFX();
      setIsFlickering(false);
      setClickCount(0);
      onEnterBlackSpace();
      return;
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    // Pick random quote from pool
    const nextMsgIdx = Math.floor(Math.random() * bulbPool.length);
    setCurrentMessageIndex(nextMsgIdx);

    if (nextCount >= 6) {
      // 45% random chance to trigger electrical flicker on clicks 6+
      const triggered = Math.random() < 0.45;
      if (triggered) {
        setIsFlickering(true);
        sound.playLampuKedipSFX();
      } else {
        sound.playSakelarSFX();
      }
    } else {
      // Normal click
      sound.playSakelarSFX();
    }
  };

  // Determine pendulum animation
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
          ? "Bohlam merah berdenyut pelan. Pintu terbuka. [Klik bohlam untuk BANGUN]"
          : "The crimson bulb pulsates. The door is open. [Click bulb to WAKE UP]"
        : lang === 'id'
        ? "Bohlam merah menatap dalam hening. Masih ada sesuatu yang belum terkuak..."
        : "The crimson bulb watches in silence. Something remains hidden...";
    }
    if (isFlickering) {
      return lang === 'id'
        ? "Filamen bergetar hebat memercikkan listrik. Bayangan bergerak di dinding ruangan..."
        : "The filament violently sparks. Shadows twitch against the walls. Waiting for something to happen?";
    }
    if (clickCount === 0) {
      return lang === 'id'
        ? "Sebuah bohlam hitam tergantung dari langit-langit. Terasa dingin saat disentuh."
        : "A black lightbulb hangs from the ceiling. It feels cold to the touch.";
    }
    return bulbPool[currentMessageIndex % bulbPool.length];
  }, [isBlackSpace, isFlickering, clickCount, currentMessageIndex, puzzleState, lang, bulbPool]);

  const shouldSpawnAnomalyInHero =
    isBlackSpace &&
    (puzzleState.spawnLocations.homeSection === 'hero' ||
      puzzleState.spawnLocations.secondaryLocation === 'hero');

  return (
    <section
      id="hero"
      className="h-[100dvh] md:h-screen w-full flex flex-col justify-center items-center overflow-y-auto md:overflow-hidden px-4 sm:px-6 font-mono select-none relative pt-12 pb-6 md:py-0"
    >
      <div className="w-full max-w-3xl flex flex-col items-center justify-center my-auto">
        
        {/* Hanging Lightbulb Assembly */}
        <div
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
          className={`cursor-pointer transition-transform duration-300 origin-top focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] rounded-sm p-1 ${pendulumAnimationClass}`}
          style={{ transformOrigin: '50% 0' }}
          title={
            isBlackSpace
              ? puzzleState.canWakeUp
                ? "Click bulb to WAKE UP"
                : "The crimson bulb"
              : "A hanging lightbulb..."
          }
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
                    ? "#ff0033"
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
                    ? "#ff0033"
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
                    ? "#ff0033"
                    : "none"
                }
              />
            </g>
          </svg>
        </div>

        {/* Psychological Status Note under Bulb */}
        <div className="mt-1 text-center max-w-sm sm:max-w-md px-2">
          <p
            className={`text-[11px] sm:text-xs italic leading-tight transition-colors duration-300 ${
              isBlackSpace
                ? 'text-red-400 font-bold'
                : isFlickering
                ? 'text-red-500 font-bold animate-pulse'
                : 'text-[var(--text-muted)]'
            }`}
          >
            "{currentBulbNote}"
          </p>
        </div>

        {/* Combined Iconic Omori Dialogue Box (White Space Chamber & Bio) */}
        <div className="omori-box p-4 sm:p-6 text-[var(--text-main)] w-full relative overflow-hidden shadow-2xl mt-3 sm:mt-4">
          
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-[11px] text-[var(--accent-red)] uppercase tracking-widest font-bold">
              {isBlackSpace ? (
                <span className="text-[#8b0000] font-bold">
                  &gt; BLACK SPACE // MEMORY CORRUPTION
                </span>
              ) : (
                '> SYSTEM DIALOGUE'
              )}
            </span>
            {isBlackSpace && (
              <span className="text-[10px] text-[#ff0033] font-mono tracking-wider animate-pulse hidden sm:inline font-bold">
                [RECORD_#01]
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-2xl font-bold mb-2.5 leading-tight">
            {isBlackSpace ? (
              <span className="text-[#ff0033] font-bold">
                Welcome to Black Space.
              </span>
            ) : (
              'Welcome to White Space.'
            )}
          </h1>

          <div className="text-xs sm:text-sm leading-relaxed text-[var(--text-main)]/90 mb-3.5 font-sans">
            {isBlackSpace ? (
              <div className="text-[#fca5a5]/90 italic">
                <span>"A quiet digital domain where code, databases, and curiosity intertwine.{' '}</span>
                {shouldSpawnAnomalyInHero ? (
                  <RedactedText
                    theme={theme}
                    anomalyId="anomaly-hero"
                    originalText="A dark presence lurks beneath the floorboards."
                    corruptedText="OMORI_MEMORY_#01"
                  />
                ) : (
                  <span>You have been building systems here for as long as you can remember.</span>
                )}
                <span> There is no runtime error that cannot be resolved."</span>
              </div>
            ) : lang === 'id' ? (
              <p>
                Halo! Saya Faza, mahasiswa D4 Teknik Informatika di{' '}
                <strong className="font-semibold text-[var(--text-main)]">
                  Politeknik Negeri Jember (Semester 5)
                </strong>. 
                Fokus mendalami software craftsmanship: arsitektur backend sistem informasi, perancangan database relasional, dan ekosistem aplikasi mobile.
              </p>
            ) : (
              <p>
                Hello! I am Faza, a Software Engineering student at{' '}
                <strong className="font-semibold text-[var(--text-main)]">
                  Politeknik Negeri Jember (Semester 5)
                </strong>. 
                Focused on software craftsmanship: architecting clinical ERP backends, high-speed relational schemas, and integrated mobile ecosystems.
              </p>
            )}
          </div>

          {/* Quick Academic & Status HUD */}
          <div className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono border-t border-[var(--border-color)] pt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <span>{lang === 'id' ? 'IPK' : 'GPA'}: <strong className="text-[var(--text-main)]">{isBlackSpace ? '???' : '3.72'}</strong></span>
            <span className="opacity-40">•</span>
            <span>Semester: <strong className="text-[var(--text-main)]">{isBlackSpace ? '?' : '5'}</strong></span>
            <span className="opacity-40">•</span>
            <span>Status: <strong className="text-[var(--text-main)]">{isBlackSpace ? '???' : lang === 'id' ? 'Terbuka untuk Magang' : 'Open for Internship'}</strong></span>
            <span className="opacity-40">•</span>
            <span>{lang === 'id' ? 'Domisili' : 'Location'}: <strong className="text-[var(--text-main)]">{isBlackSpace ? '???' : 'Jember, ID'}</strong></span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigateSection?.('projects')}
            onMouseEnter={() => sound.playTextBlip()}
            className="px-5 py-2 sketch-border bg-[var(--paper-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] text-[var(--text-main)] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{lang === 'id' ? '[ LIHAT PROYEK → ]' : '[ VIEW PROJECTS → ]'}</span>
          </button>
          <button
            onClick={() => onNavigateSection?.('contact')}
            onMouseEnter={() => sound.playTextBlip()}
            className="px-5 py-2 border border-[var(--border-color)] hover:border-[var(--text-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs transition-all cursor-pointer"
          >
            <span>{lang === 'id' ? '[ HUBUNGI SAYA ]' : '[ CONTACT ME ]'}</span>
          </button>
        </div>

      </div>
    </section>
  );
};
