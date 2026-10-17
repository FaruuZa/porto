import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { sound } from '../utils/audio';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { ThemeMode } from '../App';
import { useLanguage } from '../utils/languageContext';
import { useSanityProfile } from '../sanity/useSanityProfile';

interface NavbarProps {
  theme: ThemeMode;
  activeSectionId?: string;
  isProjectsPage?: boolean;
  onToggleTheme: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onMobileMenuToggle?: (isOpen: boolean) => void;
  onOpenAllProjects?: () => void;
}

const NAV_ITEMS_ID = [
  { id: 'hero', label: 'Beranda' },
  { id: 'projects', label: 'Proyek' },
  { id: 'skills', label: 'Keahlian' },
  { id: 'profile', label: 'Profil' },
  { id: 'contact', label: 'Kontak' },
] as const;

const NAV_ITEMS_EN = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'profile', label: 'Profile' },
  { id: 'contact', label: 'Contact' },
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  activeSectionId = 'hero',
  isProjectsPage = false,
  onToggleTheme,
  onNavigateSection,
  onMobileMenuToggle,
}) => {
  const { lang, toggleLang } = useLanguage();
  const { profile } = useSanityProfile();
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  const navItems = lang === 'id' ? NAV_ITEMS_ID : NAV_ITEMS_EN;
  const isBlackSpace = theme === 'black-space';

  useEffect(() => {
    const unsubAudio = sound.subscribe((muted) => {
      setIsMuted(muted);
    });
    const unsubPuzzle = blackSpaceManager.subscribe((state) => {
      setPuzzleState(state);
    });

    return () => {
      unsubAudio();
      unsubPuzzle();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', mobileMenuOpen);
    onMobileMenuToggle?.(mobileMenuOpen);
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen, onMobileMenuToggle]);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection?.(sectionId);
  };

  const handleNavHover = () => {
    sound.playTextBlip();
  };

  const handleThemeClick = () => {
    if (isBlackSpace) {
      if (!puzzleState.canWakeUp) {
        return; // strictly disabled
      }
    }
    sound.playSelect();
    onToggleTheme();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-color)] border-b border-[var(--border-color)] transition-colors duration-500 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between font-mono text-xs">
        
        {/* Branding Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
          onMouseEnter={handleNavHover}
          className={`font-bold tracking-wider text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] focus-visible:outline-none ${
            isBlackSpace ? 'text-stone-500 opacity-60 hover:opacity-90' : 'hover:opacity-80'
          }`}
        >
          <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 inline-block ${isBlackSpace ? 'bg-red-950/80 border border-red-900/40' : 'bg-[var(--accent-red)]'}`}></span>
          <span data-glitch="true">{`${(profile.nickname || profile.name || 'FAZA').toUpperCase()}.DEV`}</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-3.5 lg:gap-5 text-xs">
          {navItems.map((item) => {
            const isActive = isProjectsPage ? item.id === 'projects' : activeSectionId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={handleNavHover}
                aria-current={isActive ? 'true' : undefined}
                className={`press cursor-pointer py-1 flex items-center gap-1 font-mono border-b-2 transition-colors ${
                  isBlackSpace
                    ? isActive
                      ? 'text-red-900/80 font-bold border-red-950/80'
                      : 'text-stone-700 hover:text-stone-400 border-transparent'
                    : isActive
                    ? 'text-[var(--accent-red)] font-bold border-[var(--accent-red)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent'
                }`}
              >
                <span aria-hidden="true" className={`text-[9px] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>■</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <span aria-hidden="true" className="w-px h-4 bg-[var(--border-color)] opacity-40" />

          {/* Language Toggle (ID / EN) */}
          <button
            onClick={() => {
              sound.playSelect();
              toggleLang();
            }}
            onMouseEnter={handleNavHover}
            className={`press px-2 py-1 sketch-border font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
              isBlackSpace
                ? 'text-stone-600 border-red-950/40 hover:text-stone-400 bg-transparent'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)]'
            }`}
            title="Ganti Bahasa / Switch Language"
            aria-label={lang === 'id' ? 'Ganti bahasa ke English' : 'Switch language to Indonesian'}
          >
            <Globe size={12} />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Unified Sound Control Toggle */}
          <button
            onClick={handleToggleSound}
            onMouseEnter={handleNavHover}
            aria-pressed={!isMuted}
            className={`press px-2.5 py-1 sketch-border font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
              isBlackSpace
                ? !isMuted
                  ? 'border-red-950/60 text-red-900/80 bg-[#080208]'
                  : 'border-red-950/30 text-stone-700 bg-transparent'
                : !isMuted
                ? 'bg-[var(--paper-color)] text-[var(--accent-red)] border-[var(--accent-red)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)]'
            }`}
            title={isMuted ? (lang === 'id' ? 'Nyalakan suara' : 'Turn sound on') : (lang === 'id' ? 'Matikan suara' : 'Turn sound off')}
            aria-label={lang === 'id' ? 'Suara' : 'Sound'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span className={`hidden lg:inline-block text-left ${lang === 'id' ? 'min-w-[11ch]' : 'min-w-[9ch]'}`}>
              {lang === 'id' ? (isMuted ? 'SUARA MATI' : 'SUARA AKTIF') : (isMuted ? 'SOUND OFF' : 'SOUND ON')}
            </span>
          </button>

          {/* Room Dimension Theme Toggle / "???" / "Wake up" Button */}
          {isBlackSpace ? (
            <button
              onClick={handleThemeClick}
              onMouseEnter={handleNavHover}
              disabled={!puzzleState.canWakeUp}
              aria-disabled={!puzzleState.canWakeUp}
              className={`press px-3 py-1 sketch-border text-[11px] font-mono tracking-wider transition-all ${
                puzzleState.canWakeUp
                  ? 'bg-red-950/80 border-red-500 text-red-200 font-bold hover:bg-red-900 cursor-pointer shadow-md'
                  : 'bg-transparent text-red-900/60 border-red-950/50 cursor-not-allowed opacity-60'
              }`}
              title={puzzleState.canWakeUp ? "Wake up" : "???"}
            >
              {puzzleState.canWakeUp ? 'Wake up' : '???'}
            </button>
          ) : (
            <button
              onClick={handleThemeClick}
              onMouseEnter={handleNavHover}
              className="press px-2.5 py-1 sketch-border text-[11px] font-mono flex items-center gap-1.5 cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)]"
              title={lang === 'id' ? 'Ganti tema' : 'Toggle theme'}
              aria-label={lang === 'id' ? 'Ganti tema' : 'Toggle theme'}
            >
              {theme === 'light' ? (
                <>
                  <Sun size={13} />
                  <span className="hidden lg:inline">{lang === 'id' ? 'TERANG' : 'LIGHT'}</span>
                </>
              ) : (
                <>
                  <Moon size={13} />
                  <span className="hidden lg:inline">{lang === 'id' ? 'GELAP' : 'DARK'}</span>
                </>
              )}
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Button & Quick Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Toggle */}
          <button
            onClick={() => {
              sound.playSelect();
              toggleLang();
            }}
            className="press h-9 min-w-9 px-2.5 sketch-border text-[11px] font-bold text-[var(--text-main)] hover:text-[var(--accent-red)] flex items-center justify-center cursor-pointer"
            aria-label={lang === 'id' ? 'Ganti bahasa ke English' : 'Switch language to Indonesian'}
          >
            {lang.toUpperCase()}
          </button>

          {/* Quick Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className={`press h-9 w-9 sketch-border flex items-center justify-center cursor-pointer ${
              !isMuted ? 'border-[var(--accent-red)] text-[var(--accent-red)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label={lang === 'id' ? 'Suara' : 'Sound'}
            aria-pressed={!isMuted}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            onMouseEnter={handleNavHover}
            className={`press h-9 w-9 sketch-border flex items-center justify-center cursor-pointer relative transition-all ${
              isBlackSpace && puzzleState.canWakeUp
                ? 'border-red-600/70 text-red-400 animate-gentle-pulse shadow-[0_0_8px_rgba(220,38,38,0.25)]'
                : 'text-[var(--text-main)] hover:text-[var(--accent-red)]'
            }`}
            aria-label={mobileMenuOpen ? (lang === 'id' ? 'Tutup menu' : 'Buka menu') : (lang === 'id' ? 'Buka menu' : 'Open menu')}
            aria-expanded={mobileMenuOpen}
          >
            {isBlackSpace && puzzleState.canWakeUp && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse pointer-events-none" />
            )}
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu (Solid background, zero blur) */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-13 sm:top-14 z-50 md:hidden bg-[var(--bg-color)] border-t border-[var(--border-color)] overflow-y-auto">
          <div className="px-5 pt-6 pb-10 flex flex-col justify-between min-h-full gap-8">
            
            <div>
              <div className="pb-3 mb-4 border-b border-[var(--border-color)]">
                <span className="text-[11px] text-[var(--accent-red)] uppercase tracking-wider font-bold">
                  {lang === 'id' ? '> MENU NAVIGASI' : '> NAVIGATION MENU'}
                </span>
              </div>

              {/* Drawer Links */}
              <nav className="flex flex-col gap-2 font-mono text-xs">
                {navItems.map((item, idx) => {
                  const isActive = isProjectsPage ? item.id === 'projects' : activeSectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      onMouseEnter={handleNavHover}
                      aria-current={isActive ? 'true' : undefined}
                      className={`press text-left py-3 px-3.5 sketch-border flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-red)] text-white font-bold border-[var(--accent-red)]'
                          : 'hover:bg-[var(--paper-color)] text-[var(--text-main)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="opacity-60">0{idx + 1}.</span>
                        <span>{item.label}</span>
                      </span>
                      <span aria-hidden="true" className="text-[10px]">
                        {isActive ? '■' : '→'}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Controls */}
            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-2 font-mono text-xs">
              <button
                onClick={handleToggleSound}
                aria-pressed={!isMuted}
                className="press w-full py-3 px-3.5 sketch-border text-[var(--text-main)] hover:bg-[var(--paper-color)] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isMuted ? <VolumeX size={15} className="text-[var(--text-muted)]" /> : <Volume2 size={15} className="text-[var(--accent-red)]" />}
                  <span>{lang === 'id' ? 'Suara' : 'Sound'}</span>
                </div>
                <span className={`text-[11px] font-bold ${!isMuted ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}`}>
                  {lang === 'id' ? (isMuted ? 'MATI' : 'AKTIF') : (isMuted ? 'OFF' : 'ON')}
                </span>
              </button>

              {isBlackSpace ? (
                <button
                  onClick={() => {
                    if (!puzzleState.canWakeUp) return;
                    handleThemeClick();
                    setMobileMenuOpen(false);
                  }}
                  disabled={!puzzleState.canWakeUp}
                  aria-disabled={!puzzleState.canWakeUp}
                  className={`press w-full py-3.5 px-4 sketch-border flex items-center justify-center font-mono text-center transition-all ${
                    puzzleState.canWakeUp
                      ? 'bg-red-950/90 border-red-500 text-red-100 font-bold tracking-widest text-sm shadow-[0_0_12px_rgba(220,38,38,0.4)] cursor-pointer'
                      : 'bg-[#09040a] text-red-950 border-red-950/40 cursor-not-allowed text-xs opacity-60'
                  }`}
                  aria-label={puzzleState.canWakeUp ? 'Bangun dari Black Space' : 'Terkunci'}
                >
                  <span className="tracking-widest">
                    {puzzleState.canWakeUp ? '[ WAKE UP ]' : '[ ??? ]'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleThemeClick();
                    setMobileMenuOpen(false);
                  }}
                  className="press w-full py-3 px-3.5 sketch-border flex items-center justify-between text-[var(--text-main)] hover:bg-[var(--paper-color)] cursor-pointer"
                >
                  <span>{lang === 'id' ? 'Tema Tampilan' : 'Theme Mode'}</span>
                  <span className="text-[11px] font-bold">
                    {theme === 'light'
                      ? (lang === 'id' ? 'TERANG' : 'LIGHT')
                      : (lang === 'id' ? 'GELAP' : 'DARK')}
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
