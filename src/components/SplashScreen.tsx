import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { useLanguage } from '../utils/languageContext';

interface SplashScreenProps {
  theme?: ThemeMode;
  onDismiss: () => void;
  isDataLoaded?: boolean;
}

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  theme = 'light',
  onDismiss,
  isDataLoaded = true,
}) => {
  const { lang } = useLanguage();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [stage, setStage] = useState<'blank' | 'loading' | 'gliding' | 'settled' | 'fading-out'>('blank');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const hasTriggeredRef = useRef(false);
  const isDataLoadedRef = useRef(isDataLoaded);
  useEffect(() => {
    isDataLoadedRef.current = isDataLoaded;
  }, [isDataLoaded]);

  // Measure Hero Bulb's exact physical coordinates on screen
  useEffect(() => {
    const updateTarget = () => {
      const el = document.getElementById('hero-bulb');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          });
          return true;
        }
      }
      return false;
    };

    updateTarget();
    const raf1 = requestAnimationFrame(updateTarget);
    const timer1 = setTimeout(updateTarget, 60);
    const timer2 = setTimeout(updateTarget, 200);

    window.addEventListener('resize', updateTarget);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateTarget);
    };
  }, []);

  // Atmospheric intro duration so user gets to appreciate the quote (1400ms)
  useEffect(() => {
    const tEnter = setTimeout(() => {
      setStage('loading');
      sound.playTextBlip();
    }, 60);

    const tMin = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1400);

    return () => {
      clearTimeout(tEnter);
      clearTimeout(tMin);
    };
  }, []);

  // Main trigger: Once data is loaded and minimum time elapsed, glide and settle smoothly
  useEffect(() => {
    if (isDataLoaded && minTimeElapsed && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setStage('gliding');

      const tSettled = setTimeout(() => {
        setStage('settled');
        sound.playSakelarSFX();
      }, 850);

      const tFade = setTimeout(() => {
        setStage('fading-out');
      }, 1100);

      const tDone = setTimeout(() => {
        onDismiss();
      }, 1750);

      return () => {
        clearTimeout(tSettled);
        clearTimeout(tFade);
        clearTimeout(tDone);
      };
    }
  }, [isDataLoaded, minTimeElapsed, onDismiss]);

  // Fallback safety: only triggers if external data takes excessively long (> 7 seconds)
  useEffect(() => {
    const tSafety = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setStage('gliding');
        setTimeout(() => {
          setStage('settled');
          sound.playSakelarSFX();
        }, 850);
        setTimeout(() => setStage('fading-out'), 1100);
        setTimeout(() => onDismiss(), 1750);
      }
    }, 7000);

    return () => clearTimeout(tSafety);
  }, [onDismiss]);

  // Click anywhere to fast-forward
  const handleFastForward = () => {
    if (hasTriggeredRef.current || stage === 'fading-out') return;
    hasTriggeredRef.current = true;
    setStage('gliding');
    setTimeout(() => {
      setStage('settled');
      sound.playSakelarSFX();
    }, 400);
    setTimeout(() => setStage('fading-out'), 600);
    setTimeout(() => onDismiss(), 1150);
  };

  // Coordinates
  const fallbackLeft = typeof window !== 'undefined' ? window.innerWidth / 2 - 21 : 0;
  const fallbackTop = typeof window !== 'undefined' ? window.innerHeight * 0.25 : 120;

  const currentWidth = targetRect ? targetRect.width : 42;
  const currentHeight = targetRect ? targetRect.height : 84;
  const heroLeft = targetRect ? targetRect.left : fallbackLeft;
  const heroTop = targetRect ? targetRect.top : fallbackTop;

  const isAtHeroPos = stage === 'gliding' || stage === 'settled' || stage === 'fading-out';

  const splashBgColor =
    theme === 'light'
      ? '#f7f7f3'
      : theme === 'black-space'
      ? '#030104'
      : '#0d0d11';

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleFastForward}
      style={{ backgroundColor: splashBgColor, zIndex: 9999 }}
      className={`fixed inset-0 z-[100] select-none transition-opacity duration-700 ease-out cursor-default ${
        stage === 'fading-out' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Pure void solid background matching theme */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: splashBgColor }}
      />

      {/* Floating Hanging Lightbulb (Seamlessly glides and locks onto Hero's bulb) */}
      <div
        className="pointer-events-none p-1 flex items-center justify-center rounded-sm"
        style={{
          position: 'fixed',
          left: `${isAtHeroPos ? heroLeft : (typeof window !== 'undefined' ? window.innerWidth / 2 - currentWidth / 2 : fallbackLeft)}px`,
          top: `${isAtHeroPos ? heroTop : fallbackTop}px`,
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          opacity: stage === 'blank' ? 0 : 1,
          transform: isAtHeroPos ? 'scale(1)' : 'scale(1.22)',
          transformOrigin: '50% 0',
          transition: stage === 'loading'
            ? 'opacity 350ms ease-out'
            : 'left 850ms cubic-bezier(0.16, 1, 0.3, 1), top 850ms cubic-bezier(0.16, 1, 0.3, 1), transform 850ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease-out',
        }}
        aria-hidden="true"
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

          <g>
            <path
              d="M14.5 59 C13 62 10 65 10 70 A8 8 0 1 0 26 70 C26 65 23 62 21.5 59 Z"
              fill={
                theme === 'light'
                  ? "#18181b"
                  : "#0c0d12"
              }
              stroke="var(--text-main)"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M15.5 68 L17.5 64 L18.5 64 L20.5 68"
              stroke="var(--border-color)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle
              cx="18"
              cy="64"
              r="1.2"
              fill="none"
            />
          </g>
        </svg>
      </div>

      {/* Atmospheric Omori White Space Quotes under bulb while loading */}
      <div
        className={`absolute top-[48%] sm:top-[46%] left-1/2 -translate-x-1/2 text-center max-w-sm sm:max-w-md w-full px-6 pointer-events-none transition-all duration-500 ${
          stage === 'loading' ? 'opacity-90 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <p className="font-mono text-xs sm:text-sm text-[var(--text-main)] mb-1.5 tracking-wider font-bold">
          {lang === 'id' ? 'Selamat datang di White Space.' : 'Welcome to White Space.'}
        </p>
        <p className="font-sans text-[11px] sm:text-xs text-[var(--text-muted)] italic leading-relaxed">
          {lang === 'id'
            ? '"Anda telah berada di sini selama yang Anda ingat..."'
            : '"You have been living here for as long as you can remember..."'}
        </p>
      </div>

      {/* Subtle skip affordance */}
      {stage === 'loading' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center">
          <span className="font-mono text-[10px] text-[var(--text-muted)] opacity-40">
            [ {lang === 'id' ? 'Klik di mana saja untuk lanjut' : 'Click anywhere to continue'} ]
          </span>
        </div>
      )}
    </div>
  );
};
