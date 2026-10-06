import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, Moon, Sun, Skull, Globe } from 'lucide-react';
import { sound } from '../utils/audio';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { ThemeMode } from '../App';
import { useLanguage } from '../utils/languageContext';

interface NavbarProps {
  theme: ThemeMode;
  activeSectionId?: string;
  onToggleTheme: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAllProjects?: () => void;
}

const NAV_ITEMS_ID = [
  { id: 'hero', label: 'Home' },
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
  onToggleTheme,
  onNavigateSection,
}) => {
  const { lang, toggleLang } = useLanguage();
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  const navItems = lang === 'id' ? NAV_ITEMS_ID : NAV_ITEMS_EN;

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

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleNavClick = (sectionId: string) => {
    sound.playSelect();
    setMobileMenuOpen(false);
    onNavigateSection?.(sectionId);
  };

  const handleNavHover = () => {
    sound.playTextBlip();
  };

  const handleThemeClick = () => {
    if (isBlackSpace) {
      if (!puzzleState.canWakeUp) {
        // Enforce challenge completion: cannot wake up yet!
        sound.playLampuKedipSFX();
        return;
      }
    }
    sound.playSelect();
    onToggleTheme();
  };

  const isBlackSpace = theme === 'black-space';

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[var(--bg-color)] border-b border-[var(--border-color)] transition-colors duration-500 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between font-mono text-xs">
        
        {/* Branding Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
          onMouseEnter={handleNavHover}
          className="font-bold tracking-wider text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] focus-visible:outline-none"
        >
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[var(--accent-red)] inline-block"></span>
          <span data-glitch="true">FAZA.DEV</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-3.5 lg:gap-5 text-xs">
          {navItems.map((item) => {
            const isActive = activeSectionId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={handleNavHover}
                className={`transition-all cursor-pointer py-1 flex items-center gap-1 font-mono ${
                  isActive
                    ? 'text-[var(--accent-red)] font-bold border-b-2 border-[var(--accent-red)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {isActive && <span className="text-[9px]">■</span>}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Language Toggle (ID / EN) */}
          <button
            onClick={() => {
              sound.playSelect();
              toggleLang();
            }}
            onMouseEnter={handleNavHover}
            className="px-2 py-1 sketch-border font-bold text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)] transition-all flex items-center gap-1 cursor-pointer"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe size={12} />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Unified Sound Control Toggle */}
          <button
            onClick={handleToggleSound}
            onMouseEnter={handleNavHover}
            className={`px-2.5 py-1 sketch-border font-bold text-[11px] transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] focus-visible:outline-none cursor-pointer ${
              !isMuted
                ? 'bg-[var(--paper-color)] text-[var(--accent-red)] border-[var(--accent-red)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--paper-color)]'
            }`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <>
                <VolumeX size={13} />
                <span>MUTE</span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>SOUND</span>
              </>
            )}
          </button>

          {/* Room Dimension Theme Toggle / Black Space Status */}
          <button
            onClick={handleThemeClick}
            onMouseEnter={handleNavHover}
            className={`px-2.5 py-1 sketch-border text-[11px] font-mono transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] focus-visible:outline-none cursor-pointer ${
              isBlackSpace
                ? puzzleState.canWakeUp
                  ? 'bg-red-950 border-red-500 text-red-200 font-bold'
                  : 'bg-[var(--paper-color)] text-red-700 border-red-900 cursor-not-allowed opacity-80'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)]'
            }`}
            title={
              isBlackSpace
                ? puzzleState.canWakeUp
                  ? "Wake up"
                  : "???"
                : "Toggle Theme"
            }
          >
            {isBlackSpace ? (
              <>
                <Skull size={13} className="text-red-500" />
                <span>
                  {puzzleState.canWakeUp ? '[ WAKE UP ]' : '???'}
                </span>
              </>
            ) : theme === 'light' ? (
              <>
                <Sun size={13} />
                <span>LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={13} />
                <span>DARK</span>
              </>
            )}
          </button>
        </nav>

        {/* Mobile Hamburger Button & Quick Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Toggle */}
          <button
            onClick={() => {
              sound.playSelect();
              toggleLang();
            }}
            className="px-2 py-1 sketch-border text-[10px] font-bold text-[var(--text-main)] hover:text-[var(--accent-red)]"
            aria-label="Toggle Language"
          >
            {lang.toUpperCase()}
          </button>

          {/* Quick Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 sketch-border text-[var(--text-main)] hover:text-[var(--accent-red)] transition-colors"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={14} className="text-[var(--text-muted)]" /> : <Volume2 size={14} className="text-[var(--accent-red)]" />}
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            onMouseEnter={handleNavHover}
            className="p-1.5 sketch-border text-[var(--text-main)] hover:text-[var(--accent-red)] focus-visible:ring-2 focus-visible:ring-[var(--accent-red)] focus-visible:outline-none transition-colors"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu (NO blur, strictly crisp background) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-13 z-50 md:hidden bg-[var(--bg-color)] border-b border-[var(--border-color)] overflow-y-auto">
          <div className="px-5 py-6 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] pb-12">
            
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)]">
                <span className="text-[11px] text-[var(--accent-red)] uppercase tracking-wider font-bold">
                  {lang === 'id' ? '> MENU NAVIGASI' : '> NAVIGATION MENU'}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 sketch-border text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex flex-col space-y-2 font-mono text-xs">
                {navItems.map((item, idx) => {
                  const isActive = activeSectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      onMouseEnter={handleNavHover}
                      className={`text-left py-2.5 px-3 sketch-border transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-[var(--accent-red)] text-white font-bold border-[var(--accent-red)]'
                          : 'hover:bg-[var(--paper-color)] text-[var(--text-main)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="opacity-60">0{idx + 1}.</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[10px]">
                        {isActive ? '●' : '→'}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Controls */}
            <div className="pt-4 border-t border-[var(--border-color)] space-y-2.5 font-mono text-xs">
              <button
                onClick={handleToggleSound}
                className="w-full py-2.5 px-3 sketch-border text-[var(--text-main)] hover:bg-[var(--paper-color)] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {isMuted ? <VolumeX size={15} className="text-[var(--text-muted)]" /> : <Volume2 size={15} className="text-[var(--accent-red)]" />}
                  <span>{lang === 'id' ? 'Sistem Audio' : 'Audio System'}</span>
                </div>
                <span className={`text-[10px] font-bold ${!isMuted ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}`}>
                  {isMuted ? 'MUTED' : 'ACTIVE'}
                </span>
              </button>

              <button
                onClick={() => {
                  handleThemeClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-3 sketch-border transition-all flex items-center justify-between ${
                  isBlackSpace
                    ? puzzleState.canWakeUp
                      ? 'bg-red-950 border-red-500 text-red-200 font-bold'
                      : 'bg-[var(--paper-color)] text-red-700 border-red-900 cursor-not-allowed opacity-80'
                    : 'text-[var(--text-main)] hover:bg-[var(--paper-color)]'
                }`}
              >
                <span>{lang === 'id' ? 'Dimensi Ruangan' : 'Room Dimension'}</span>
                <span className="text-[10px] font-bold">
                  {isBlackSpace
                    ? puzzleState.canWakeUp
                      ? '[ WAKE UP ]'
                      : '???'
                    : theme === 'light'
                    ? 'LIGHT'
                    : 'DARK'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
