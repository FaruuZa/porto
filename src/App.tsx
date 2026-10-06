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
import { FEATURED_PROJECTS } from './data/projectsData';
import { LanguageProvider, useLanguage } from './utils/languageContext';

export type ThemeMode = 'dark' | 'light' | 'black-space';

const SECTIONS = ['hero', 'projects', 'skills', 'profile', 'contact'] as const;

const SECTION_METADATA_ID = [
  { id: 'hero', label: 'Home' },
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

const MainPortfolioApp: React.FC = () => {
  const { lang } = useLanguage();
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [returnTheme, setReturnTheme] = useState<'dark' | 'light'>('dark');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [projectSlide, setProjectSlide] = useState(0);
  const [bulbTriggerSignal, setBulbTriggerSignal] = useState(0);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const wheelThrottleRef = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const totalProjectSlides = FEATURED_PROJECTS.length + 1; // 4 featured + 1 archive card = 5
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
    document.body.classList.remove('light-theme', 'black-space-theme');
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      glitchManager.stop();
    } else if (theme === 'black-space') {
      document.body.classList.add('black-space-theme');
      glitchManager.start();
    } else {
      glitchManager.stop();
    }

    sound.handleThemeChange(theme);

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
      if (now - wheelThrottleRef.current < 380) return; // 380ms debounce

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
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isProjectsPage) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    // Trigger vertical section switch only when vertical movement dominates
    if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
      if (deltaY > 0) {
        // Swiped Up -> Move Down
        navigateToSectionIndex(activeSectionIndex + 1);
      } else {
        // Swiped Down -> Move Up
        navigateToSectionIndex(activeSectionIndex - 1);
      }
    }
  };

  // Keyboard navigation handler (W, A, S, D & Arrow Keys & Enter & Space)
  useEffect(() => {
    if (isProjectsPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

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
  }, [isProjectsPage, activeSectionIndex, navigateToSectionIndex, navigate, totalProjectSlides]);

  // Direct section navigation from Navbar or CTA buttons
  const handleDirectNavigation = (sectionId: string) => {
    const targetIdx = SECTIONS.findIndex((s) => s === sectionId);
    if (targetIdx !== -1) {
      navigateToSectionIndex(targetIdx);
    }
  };

  // Enter Black Space mode
  const handleEnterBlackSpace = () => {
    if (theme !== 'black-space') {
      setReturnTheme(theme);
      setTheme('black-space');
      blackSpaceManager.enterBlackSpace();
    }
  };

  // Wake up safely from Black Space (strictly requiring puzzle completion)
  const handleWakeUp = () => {
    if (!blackSpaceManager.getState().canWakeUp) {
      sound.playLampuKedipSFX();
      return;
    }
    blackSpaceManager.wakeUp();
    setTheme(returnTheme);
  };

  // Toggle Room Dimension (strictly requiring puzzle completion if in Black Space)
  const handleToggleTheme = () => {
    if (theme === 'black-space') {
      if (!blackSpaceManager.getState().canWakeUp) {
        sound.playLampuKedipSFX();
        return;
      }
      handleWakeUp();
    } else {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-500 selection:bg-[var(--accent-red)] selection:text-white font-mono relative">
      
      {/* Dedicated Archive View */}
      {isProjectsPage ? (
        <ProjectsPage
          theme={theme}
          onBack={() => navigate('/')}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <>
          {/* Main Top Navigation */}
          <Navbar
            theme={theme}
            activeSectionId={SECTIONS[activeSectionIndex]}
            onToggleTheme={handleToggleTheme}
            onNavigateSection={handleDirectNavigation}
            onOpenAllProjects={() => navigate('/projects')}
          />

          {/* Main Full-Screen Snap Flow (5 Clean Sections) */}
          <main
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full h-[100dvh] md:h-screen overflow-hidden relative"
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
            className="fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2.5 select-none"
          >
            {sectionMetadata.map((item, idx) => {
              const isActive = activeSectionIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToSectionIndex(idx)}
                  onMouseEnter={() => sound.playTextBlip()}
                  className={`group relative flex items-center justify-end transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] ${
                    isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Pindah ke section ${item.label}`}
                  title={`Section 0${idx + 1}: ${item.label}`}
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
                      <span className="w-1.5 h-1.5 bg-white rounded-xs"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Mobile Current Section Floating Badge (Bottom-Left) */}
          <div
            className="fixed bottom-4 left-4 z-40 md:hidden flex items-center gap-2 px-3 py-1.5 bg-[var(--paper-color)] sketch-border text-[11px] font-mono shadow-xl select-none"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-red)] animate-pulse inline-block" />
            <span className="font-bold text-[var(--text-main)]">
              [ 0{activeSectionIndex + 1} / 0{SECTIONS.length} ]{' '}
              <span className="text-[var(--accent-red)]">
                {sectionMetadata[activeSectionIndex].label.toUpperCase()}
              </span>
            </span>
          </div>

          {/* Bottom-Right Keyboard Controls HUD (PC/Desktop Only) */}
          <div
            className="hidden md:flex fixed bottom-4 right-4 z-40 items-center gap-2.5 px-3 py-1.5 sketch-border bg-[var(--paper-color)] text-[11px] font-mono text-[var(--text-main)] shadow-xl select-none transition-all"
            title="Arcade Keyboard Controls"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-red)] animate-pulse inline-block" />
            {SECTIONS[activeSectionIndex] === 'projects' ? (
              <span>
                <kbd className="font-bold text-[var(--accent-red)]">[W/S]</kbd> Section |{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[A/D]</kbd> {lang === 'id' ? 'Slide Kartu' : 'Slide Card'} |{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[ENTER]</kbd> {lang === 'id' ? 'Arsip' : 'Archive'}
              </span>
            ) : SECTIONS[activeSectionIndex] === 'hero' ? (
              <span>
                <kbd className="font-bold text-[var(--accent-red)]">[W/S]</kbd> Section |{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[SPACE/ENTER]</kbd> {lang === 'id' ? 'Lampu Gantung' : 'Lightbulb'}
              </span>
            ) : (
              <span>
                <kbd className="font-bold text-[var(--accent-red)]">[W/S]</kbd> {lang === 'id' ? 'Pindah Section' : 'Move Section'} |{' '}
                <kbd className="font-bold text-[var(--accent-red)]">[ENTER]</kbd> {lang === 'id' ? 'Pilih' : 'Select'}
              </span>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainPortfolioApp />
    </LanguageProvider>
  );
};

export default App;
