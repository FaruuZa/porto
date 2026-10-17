import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../utils/audio';

interface KeyboardHudProps {
  children: React.ReactNode;
  lang?: 'id' | 'en';
  className?: string;
}

export const KeyboardHud: React.FC<KeyboardHudProps> = ({
  children,
  lang = 'id',
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('porto_hud_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = useCallback(() => {
    sound.playSelect();
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('porto_hud_collapsed', String(next));
      } catch {
        // ignore local storage errors
      }
      return next;
    });
  }, []);

  // Global shortcut to toggle HUD with 'H' or '?'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't toggle if user is typing in form inputs
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
      if (key === 'h' || key === '?') {
        e.preventDefault();
        toggleCollapsed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  if (isCollapsed) {
    return (
      <button
        onClick={toggleCollapsed}
        type="button"
        className={`keyboard-hud hidden md:flex fixed bottom-4 right-4 z-40 items-center gap-2 px-2.5 py-1.5 sketch-border bg-[var(--paper-color)] text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-xl transition-all cursor-pointer group select-none ${className}`}
        title={lang === 'id' ? 'Tampilkan Petunjuk Kontrol [H / ?]' : 'Show Keyboard Controls [H / ?]'}
        aria-label={lang === 'id' ? 'Buka petunjuk tombol keyboard' : 'Open keyboard shortcuts'}
      >
        <span className="w-2 h-2 bg-[var(--accent-red)] inline-block group-hover:scale-125 transition-transform" />
        <span className="font-bold text-[var(--accent-red)]">[?]</span>
        <span className="text-[10px] tracking-wider uppercase">
          {lang === 'id' ? 'KONTROL' : 'KEYS'}
        </span>
        <span className="text-[9px] opacity-60 ml-0.5 font-bold text-[var(--accent-red)]">[H]</span>
      </button>
    );
  }

  return (
    <div
      className={`keyboard-hud hidden md:flex fixed bottom-4 right-4 z-40 items-center gap-2.5 px-3 py-1.5 sketch-border bg-[var(--paper-color)] text-[11px] font-mono text-[var(--text-muted)] shadow-xl select-none ${className}`}
      title={lang === 'id' ? 'Petunjuk Keyboard (Tekan H untuk ciutkan)' : 'Keyboard Controls (Press H to collapse)'}
    >
      <span className="w-2 h-2 bg-[var(--accent-red)] inline-block shrink-0" />
      <div className="flex items-center gap-1.5 text-[11px]">
        {children}
      </div>
      <span className="opacity-30">|</span>
      <button
        onClick={toggleCollapsed}
        type="button"
        className="ml-0.5 text-[10px] font-bold text-[var(--accent-red)] hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1"
        title={lang === 'id' ? 'Ciutkan / Sembunyikan [H]' : 'Collapse / Hide [H]'}
        aria-label={lang === 'id' ? 'Ciutkan petunjuk keyboard' : 'Collapse keyboard shortcuts'}
      >
        <span>[{lang === 'id' ? 'H: TUTUP' : 'H: HIDE'}]</span>
      </button>
    </div>
  );
};
