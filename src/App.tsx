import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { StatsSheet } from './components/StatsSheet';
import { ContactSection } from './components/ContactSection';
import { ProjectsPage } from './pages/ProjectsPage';
import { sound } from './utils/audio';
import { glitchManager } from './utils/glitchManager';
import { blackSpaceManager } from './utils/blackSpaceState';
import { blackSpaceAudio } from './utils/blackSpaceAudio';
import { FEATURED_PROJECTS } from './data/projectsData';
import { LanguageProvider, useLanguage } from './utils/languageContext';
import { SplashScreen } from './components/SplashScreen';
import { KeyboardHud } from './components/KeyboardHud';
import { useSanityProjects } from './sanity/useSanityProjects';
import { useSanityProfile } from './sanity/useSanityProfile';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export type ThemeMode = 'dark' | 'light' | 'black-space';

const SECTIONS = ['hero', 'projects', 'skills', 'profile', 'contact'] as const;

const SECTION_METADATA_ID = [
  { id: 'hero', label: 'Beranda' },
  { id: 'projects', label: 'Proyek' },
  { id: 'skills', label: 'Keahlian' },
  { id: 'profile', label: 'Profil' },
  { id: 'contact', label: 'Kontak' },
] as const;

const SECTION_METADATA_EN = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'profile', label: 'Profile' },
  { id: 'contact', label: 'Contact' },
] as const;

const THEME_STORAGE_KEY = 'porto_theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {}
  }
  return 'light';
};

const MainPortfolioApp: React.FC = () => {
  const { lang } = useLanguage();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [returnTheme, setReturnTheme] = useState<'dark' | 'light'>(() => {
    const initial = getInitialTheme();
    return initial === 'dark' ? 'dark' : 'light';
  });
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [projectSlide, setProjectSlide] = useState(0);
  const [bulbTriggerSignal, setBulbTriggerSignal] = useState(0);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/' || window.location.pathname === '';
    }
    return false;
  });

  const handleDismissSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  const wheelThrottleRef = useRef<number>(0);
  const lastWheelEventRef = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchScrollEdge = useRef<{ atTop: boolean; atBottom: boolean }>({ atTop: true, atBottom: true });

  const { featuredProjects, loading: projectsLoading } = useSanityProjects();
  const { loading: profileLoading } = useSanityProfile();
  const totalProjectSlides = featuredProjects.length + 1;
  const sectionMetadata = lang === 'id' ? SECTION_METADATA_ID : SECTION_METADATA_EN;

  // Synchronize browser history and popstate navigation
  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize audio BGM and document classes when theme changes
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'black-space-theme');
    document.body.classList.remove('light-theme', 'black-space-theme');
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      glitchManager.stop();
    } else if (theme === 'black-space') {
      document.documentElement.classList.add('black-space-theme');
      document.body.classList.add('black-space-theme');
      glitchManager.start();
    } else {
      glitchManager.stop();
    }

    sound.handleThemeChange(theme);

    if (theme === 'light' || theme === 'dark') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {}
    }

    return () => {
      glitchManager.stop();
    };
  }, [theme]);

  // Manage desktop scroll lock class on HTML & BODY
  const isProjectsPage = currentPath === '/projects';

  useEffect(() => {
    if (!isProjectsPage) {
      document.documentElement.classList.add('desktop-scroll-locked');
      document.body.classList.add('desktop-scroll-locked');
    } else {
      document.documentElement.classList.remove('desktop-scroll-locked');
      document.body.classList.remove('desktop-scroll-locked');
    }

    return () => {
      document.documentElement.classList.remove('desktop-scroll-locked');
      document.body.classList.remove('desktop-scroll-locked');
    };
  }, [isProjectsPage]);

  // Handle smooth section transition
  const navigateToSectionIndex = useCallback((newIndex: number) => {
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, newIndex));
    if (clamped !== activeSectionIndex) {
      sound.playSelect();
      setActiveSectionIndex(clamped);
    }
  }, [activeSectionIndex]);

  // Mouse Wheel snap handler (for Desktop PC / trackpad)
  useEffect(() => {
    if (isProjectsPage) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      const sinceLastEvent = now - lastWheelEventRef.current;
      lastWheelEventRef.current = now;

      // Wait for the 600ms slide to settle
      if (now - wheelThrottleRef.current < 650) return;
      // Ignore trailing trackpad inertia from the same gesture (events arrive ~16ms apart)
      if (sinceLastEvent < 120 && now - wheelThrottleRef.current < 1200) return;

      if (e.deltaY > 25) {
        wheelThrottleRef.current = now;
        navigateToSectionIndex(activeSectionIndex + 1);
      } else if (e.deltaY < -25) {
        wheelThrottleRef.current = now;
        navigateToSectionIndex(activeSectionIndex - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isProjectsPage, activeSectionIndex, navigateToSectionIndex]);

  // Mobile Touch Swipe Handlers (Swipe Up / Down to transition sections)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProjectsPage) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;

    // Determine whether the section's internal scroll is at an edge
    const sectionEl = (e.target as HTMLElement).closest('section');
    if (sectionEl && sectionEl.scrollHeight > sectionEl.clientHeight + 4) {
      touchScrollEdge.current = {
        atTop: sectionEl.scrollTop <= 4,
        atBottom: sectionEl.scrollTop + sectionEl.clientHeight >= sectionEl.scrollHeight - 4,
      };
    } else {
      touchScrollEdge.current = { atTop: true, atBottom: true };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isProjectsPage) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    // Re-verify current scroll position at end of gesture
    const sectionEl = (e.target as HTMLElement).closest('section');
    const isAtTopNow = sectionEl ? sectionEl.scrollTop <= 4 : true;
    const isAtBottomNow = sectionEl
      ? sectionEl.scrollTop + sectionEl.clientHeight >= sectionEl.scrollHeight - 4
      : true;

    // Trigger section switch only on distinct vertical flick (>= 55px) without accidental horizontal drift
    if (Math.abs(deltaY) >= 55 && Math.abs(deltaY) > Math.abs(deltaX) * 1.35) {
      if (deltaY > 0) {
        // Swiped Up -> Move Down (only once content is scrolled to the very bottom)
        if (touchScrollEdge.current.atBottom && isAtBottomNow) {
          navigateToSectionIndex(activeSectionIndex + 1);
        }
      } else {
        // Swiped Down -> Move Up (only once content is scrolled to the very top)
        if (touchScrollEdge.current.atTop && isAtTopNow) {
          navigateToSectionIndex(activeSectionIndex - 1);
        }
      }
    }
  };

  // Keyboard navigation handler (W, A, S, D & Arrow Keys & Enter & Space)
  useEffect(() => {
    if (isProjectsPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Already handled by a focused component (e.g. the bulb's own onKeyDown)
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Do not navigate sections if splash screen is actively showing
      if (showSplash) return;

      const key = e.key.toLowerCase();

      // Let Enter/Space activate whatever interactive element currently has focus
      if (
        (key === 'enter' || key === ' ') &&
        target?.closest('button, a, [role="button"]')
      ) {
        return;
      }

      // Section Navigation: W/S or ArrowUp/ArrowDown
      if (key === 'w' || key === 'arrowup') {
        e.preventDefault();
        navigateToSectionIndex(activeSectionIndex - 1);
      } else if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        navigateToSectionIndex(activeSectionIndex + 1);
      }

      // Slider Navigation on Projects section: A/D or ArrowLeft/ArrowRight
      else if (SECTIONS[activeSectionIndex] === 'projects') {
        if (key === 'a' || key === 'arrowleft') {
          e.preventDefault();
          setProjectSlide((prev) => {
            const next = Math.max(0, prev - 1);
            if (next !== prev) sound.playSelect();
            return next;
          });
        } else if (key === 'd' || key === 'arrowright') {
          e.preventDefault();
          setProjectSlide((prev) => {
            if (prev < totalProjectSlides - 1) {
              sound.playSelect();
              return prev + 1;
            } else {
              // On final card, pressing D/Right opens the complete archive page
              sound.playSelect();
              navigate('/projects');
              return prev;
            }
          });
        } else if (key === 'enter') {
          e.preventDefault();
          sound.playSelect();
          navigate('/projects');
        }
      }

      // Enter / Space action for Hanging Lightbulb on Hero section
      else if (SECTIONS[activeSectionIndex] === 'hero') {
        if (key === 'enter' || key === ' ') {
          e.preventDefault();
          setBulbTriggerSignal((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProjectsPage, activeSectionIndex, navigateToSectionIndex, navigate, totalProjectSlides, showSplash]);

  // Direct section navigation from Navbar or CTA buttons
  const handleDirectNavigation = (sectionId: string) => {
    const targetIdx = SECTIONS.findIndex((s) => s === sectionId);
    if (isProjectsPage) {
      if (sectionId === 'projects') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      navigate('/');
      if (targetIdx !== -1) {
        setActiveSectionIndex(targetIdx);
      }
    } else {
      if (targetIdx !== -1) {
        navigateToSectionIndex(targetIdx);
      }
    }
  };

  type TransitionGatePhase = 'idle' | 'closing' | 'closed' | 'opening';
  const [wakeUpGate, setWakeUpGate] = useState<TransitionGatePhase>('idle');
  const [entryGate, setEntryGate] = useState<TransitionGatePhase>('idle');

  // Enter Black Space mode with clean blackout transition gate (instantly snaps theme under solid black curtain)
  const handleEnterBlackSpace = () => {
    if (theme !== 'black-space' && entryGate === 'idle') {
      sound.playBulbBuzzSFX('strong');
      sound.playBlackSpaceTriggerSFX();

      // Disable color transitions during blackout so theme snaps instantly with zero lag
      document.documentElement.classList.add('no-theme-transition');
      document.body.classList.add('no-theme-transition');

      setEntryGate('closing');

      // At 300ms (screen is 100% solid black curtain):
      window.setTimeout(() => {
        setEntryGate('closed');

        setReturnTheme(theme === 'light' ? 'light' : 'dark');
        document.documentElement.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
        document.documentElement.classList.add('black-space-theme');
        document.body.classList.add('black-space-theme');

        setTheme('black-space');
        blackSpaceManager.enterBlackSpace();
        blackSpaceAudio.startBlackSpace();

        void document.documentElement.offsetHeight;
        void document.body.offsetHeight;

        window.setTimeout(() => {
          setEntryGate('opening');

          window.setTimeout(() => {
            setEntryGate('idle');
            document.documentElement.classList.remove('no-theme-transition');
            document.body.classList.remove('no-theme-transition');
          }, 450);
        }, 140);
      }, 300);
    }
  };

  // Restrained Wake Up transition gate from Black Space:
  // sequence: screen fades to pitch-black gate -> all themes, styles & sections committed instantly behind 100% solid curtain -> gate smoothly lifts revealing already-lit White Space
  const handleWakeUp = () => {
    if (!blackSpaceManager.getState().canWakeUp || wakeUpGate !== 'idle') {
      return;
    }

    sound.playWakeUp();
    blackSpaceAudio.stopBlackSpace();

    // 1. Immediately freeze all CSS transitions across the entire DOM tree
    document.documentElement.classList.add('no-theme-transition');
    document.body.classList.add('no-theme-transition');

    // 2. Close the black gate curtain (0.32s fade to 100% black)
    setWakeUpGate('closing');

    // At 320ms: Gate curtain is 100% closed, completely hiding the viewport
    window.setTimeout(() => {
      setWakeUpGate('closed');

      // --- INSIDE THE GATE: COMPLETE ALL THEME & STATE RESTORATION SYNCHRONOUSLY ---
      const targetTheme = returnTheme === 'dark' ? 'dark' : 'light';

      // Immediate synchronous DOM class swap (zero wait for React reconciler)
      document.documentElement.classList.remove('black-space-theme');
      document.body.classList.remove('black-space-theme');
      if (targetTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.body.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
      }

      // React state restoration
      setTheme(targetTheme);
      setBulbTriggerSignal(0);
      setActiveSectionIndex(0);
      setProjectSlide(0);
      if (currentPath !== '/') {
        navigate('/');
      }

      // Stop glitches and Black Space state
      glitchManager.stop();
      blackSpaceManager.wakeUp();

      // Immediately purge vignette and dimming CSS variables from DOM
      document.documentElement.style.removeProperty('--bs-dim');
      document.documentElement.style.removeProperty('--bs-desat');
      const vigEl = document.getElementById('bs-vignette');
      if (vigEl) {
        vigEl.classList.remove('pulse', 'pulse-strong', 'active');
        vigEl.style.setProperty('--vig', '0');
        vigEl.style.setProperty('--vigred', '0');
        vigEl.style.setProperty('--vig-clear', '56%');
        vigEl.style.setProperty('--vig-mid', '84%');
      }

      // Synchronous reflow forces browser to commit light/dark mode colors right now behind the black gate
      void document.documentElement.offsetHeight;
      void document.body.offsetHeight;

      // 3. At 460ms: The room behind the gate is 100% stable in its final theme.
      // Smoothly lift the black gate curtain (0.44s fade out)
      window.setTimeout(() => {
        setWakeUpGate('opening');

        // 4. At 460 + 450ms = 910ms: Curtain is completely transparent and gone.
        window.setTimeout(() => {
          setWakeUpGate('idle');
          // Only re-enable transitions AFTER the black screen is completely unmounted
          document.documentElement.classList.remove('no-theme-transition');
          document.body.classList.remove('no-theme-transition');
        }, 450);
      }, 140);
    }, 320);
  };

  // Toggle Room Dimension (strictly requiring puzzle completion if in Black Space)
  const handleToggleTheme = () => {
    if (theme === 'black-space') {
      if (blackSpaceManager.getState().canWakeUp) {
        handleWakeUp();
      }
    } else {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] ${
        entryGate !== 'idle' || wakeUpGate !== 'idle' ? '' : 'transition-colors duration-500'
      } selection:bg-[var(--accent-red)] selection:text-white font-mono relative`}
    >
      
      {/* Restrained Wake-Up Transition Gate */}
      {wakeUpGate !== 'idle' && (
        <div
          className={`transition-gate gate-${wakeUpGate}`}
          aria-hidden="true"
        />
      )}

      {/* Dramatic Electrical Flicker Entry Transition Gate into Black Space */}
      {entryGate !== 'idle' && (
        <div
          className={`transition-gate gate-${entryGate}`}
          aria-hidden="true"
        />
      )}

      {/* Fixed Black Space Vignette Overlay */}
      <div id="bs-vignette" aria-hidden="true" />
      
      {/* Main Top Navigation (Universal across landing and /projects) */}
      <Navbar
        theme={theme}
        activeSectionId={SECTIONS[activeSectionIndex]}
        isProjectsPage={isProjectsPage}
        onToggleTheme={handleToggleTheme}
        onNavigateSection={handleDirectNavigation}
        onMobileMenuToggle={setIsMobileMenuOpen}
        onOpenAllProjects={() => navigate('/projects')}
      />

      {/* Dedicated Archive View */}
      {isProjectsPage ? (
        <ProjectsPage
          theme={theme}
          onBack={() => navigate('/')}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <>
          {/* Main Full-Screen Snap Flow (5 Clean Sections) */}
          <main
            id="main-content"
            key={theme}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full h-[100dvh] md:h-screen overflow-hidden relative overscroll-none"
          >
            <div
              className="w-full h-full transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateY(-${activeSectionIndex * 100}%)`,
              }}
            >
              {/* Section 0: Home (Hanging Bulb + Bio Dialogue Box + CTAs) */}
              <div className="w-full h-[100dvh] md:h-screen flex-shrink-0">
                <HeroSection
                  theme={theme}
                  onEnterBlackSpace={handleEnterBlackSpace}
                  onWakeUp={handleWakeUp}
                  bulbTriggerSignal={bulbTriggerSignal}
                  onNavigateSection={handleDirectNavigation}
                />
              </div>

              {/* Section 1: Featured Projects */}
              <div className="w-full h-[100dvh] md:h-screen flex-shrink-0">
                <ProjectsSection
                  theme={theme}
                  currentSlide={projectSlide}
                  onSlideChange={setProjectSlide}
                  onNavigateProjects={() => navigate('/projects')}
                />
              </div>

              {/* Section 2: Keahlian (Skills & Tech) */}
              <div className="w-full h-[100dvh] md:h-screen flex-shrink-0">
                <SkillsSection theme={theme} />
              </div>

              {/* Section 3: Profil (Education & Background) */}
              <div className="w-full h-[100dvh] md:h-screen flex-shrink-0">
                <StatsSheet theme={theme} />
              </div>

              {/* Section 4: Kontak (Contact & Socials) */}
              <div className="w-full h-[100dvh] md:h-screen flex-shrink-0">
                <ContactSection
                  theme={theme}
                  onNavigateSection={handleDirectNavigation}
                />
              </div>
            </div>
          </main>

          {/* Desktop Right Rail Section Indicator HUD */}
          <aside
            aria-label="Section Indicator"
            className="fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2.5 select-none bg-transparent border-0 shadow-none"
          >
            {sectionMetadata.map((item, idx) => {
              const isActive = activeSectionIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToSectionIndex(idx)}
                  onMouseEnter={() => sound.playTextBlip()}
                  className={`group relative flex items-center justify-end transition cursor-pointer ${
                    isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={lang === 'id' ? `Pindah ke bagian ${item.label}` : `Go to ${item.label} section`}
                  aria-current={isActive ? 'true' : undefined}
                  title={`0${idx + 1}. ${item.label}`}
                >
                  {/* Tooltip on Hover */}
                  <span
                    className={`mr-2.5 px-2 py-0.5 sketch-border bg-[var(--paper-color)] text-[10px] font-mono whitespace-nowrap transition-all pointer-events-none ${
                      isActive
                        ? 'opacity-100 text-[var(--accent-red)] font-bold'
                        : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-[var(--text-muted)]'
                    }`}
                  >
                    0{idx + 1}. {item.label}
                  </span>

                  {/* Marker Dot (Clean retro marker, NO glowing shadow) */}
                  <div
                    className={`transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? 'w-3.5 h-3.5 bg-[var(--accent-red)] border border-[var(--accent-red)]'
                        : 'w-2.5 h-2.5 bg-[var(--paper-color)] border border-[var(--border-color)] group-hover:border-[var(--accent-red)] group-hover:scale-125'
                    }`}
                  >
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-xs ${theme === 'black-space' ? 'bg-red-300/80' : 'bg-white'}`}></span>
                    )}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Mobile Current Section Floating Badge (Bottom-Left) */}
          {!isMobileMenuOpen && !isProjectsPage && (
            <div
              className="mobile-section-badge fixed bottom-4 left-4 z-30 md:hidden flex items-center gap-2 px-3 py-1.5 bg-[var(--paper-color)] sketch-border text-[11px] font-mono shadow-xl select-none"
              aria-live="polite"
            >
              <span className="w-2 h-2 bg-[var(--accent-red)] inline-block" />
              <span className="font-bold text-[var(--text-main)]">
                [ 0{activeSectionIndex + 1} / 0{SECTIONS.length} ]{' '}
                <span className="text-[var(--accent-red)]">
                  {sectionMetadata[activeSectionIndex].label.toUpperCase()}
                </span>
              </span>
            </div>
          )}

          {/* Bottom-Right Keyboard Controls HUD (PC/Desktop Only) */}
          <KeyboardHud lang={lang}>
            {SECTIONS[activeSectionIndex] === 'projects' ? (
              <span>
                <kbd className="font-bold text-[var(--accent-red)]">[W/S]</kbd> {lang === 'id' ? 'Bagian' : 'Section'} <span className="opacity-40">|</span>{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[A/D]</kbd> {lang === 'id' ? 'Geser Kartu' : 'Slide Card'} <span className="opacity-40">|</span>{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[ENTER]</kbd> {lang === 'id' ? 'Arsip' : 'Archive'}
              </span>
            ) : SECTIONS[activeSectionIndex] === 'hero' ? (
              <span>
                <kbd className="font-bold text-[var(--accent-red)]">[W/S]</kbd> {lang === 'id' ? 'Bagian' : 'Section'} <span className="opacity-40">|</span>{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[SPACE/ENTER]</kbd> {lang === 'id' ? 'Lampu Gantung' : 'Lightbulb'}
              </span>
            ) : (
              <span>
                <kbd className="font-bold text-[var(--accent-red)]">[W/S]</kbd> {lang === 'id' ? 'Pindah Bagian' : 'Move Section'}
              </span>
            )}
          </KeyboardHud>
        </>
      )}

      {/* Omori Atmospheric Splash Screen (Only on Home/Landing page, guaranteed top-most layer) */}
      {!isProjectsPage && showSplash && (
        <SplashScreen
          theme={theme}
          onDismiss={handleDismissSplash}
          isDataLoaded={!projectsLoading && !profileLoading}
        />
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainPortfolioApp />
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  );
};

export default App;
