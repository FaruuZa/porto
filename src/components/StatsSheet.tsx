import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { RedactedText } from './RedactedText';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { GraduationCap, Award, BookOpen, Terminal } from 'lucide-react';
import { useLanguage } from '../utils/languageContext';

interface StatsSheetProps {
  theme?: ThemeMode;
}

export const StatsSheet: React.FC<StatsSheetProps> = ({ theme = 'dark' }) => {
  const { lang } = useLanguage();
  const isBlackSpace = theme === 'black-space';
  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  const shouldSpawnAnomalyHere =
    isBlackSpace &&
    (puzzleState.spawnLocations.homeSection === 'profile' ||
      (puzzleState.spawnLocations.homeSection as string) === 'stats');

  return (
    <section
      id="profile"
      className="h-[100dvh] md:h-screen w-full flex flex-col justify-center items-center overflow-y-auto md:overflow-hidden px-4 sm:px-6 font-mono select-none pt-12 pb-6 md:py-0"
    >
      <div className="w-full max-w-3xl flex flex-col justify-center my-auto">
        {/* Section Header */}
        <div className="border-b border-[var(--border-color)] pb-3 mb-4 sm:mb-6">
          <span data-glitch="true" className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
            04. {lang === 'id' ? 'PROFIL' : 'PROFILE'} {isBlackSpace ? '// CORRUPTED' : lang === 'id' ? '// PENDIDIKAN & LATAR BELAKANG' : '// EDUCATION & BACKGROUND'}
          </span>
          <h2 data-glitch="true" className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
            {isBlackSpace
              ? 'Corrupted Character Sheet'
              : lang === 'id'
              ? 'Pendidikan & Profil Akademik'
              : 'Education & Academic Profile'}
          </h2>
          <div className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
            {isBlackSpace ? (
              <div className="text-[#fca5a5]/80">
                <span>Trauma metrics recorded in the subconscious.{' '}</span>
                {shouldSpawnAnomalyHere && (
                  <RedactedText
                    theme={theme}
                    anomalyId="anomaly-stats"
                    originalText="A dark memory from the classroom."
                    corruptedText="STUDENT_RECORD_#04"
                  />
                )}
              </div>
            ) : (
              lang === 'id'
                ? 'Riwayat pendidikan formal, penguasaan bahasa, dan spesialisasi rekayasa sistem.'
                : 'Academic milestones, language proficiency, and software engineering competencies.'
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Education Box */}
          <div
            onMouseEnter={() => sound.playTextBlip()}
            className="sketch-border p-4 sm:p-5 bg-[var(--paper-color)] hover:border-[var(--text-main)] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[var(--accent-red)] font-bold tracking-widest uppercase">
                  &gt; {lang === 'id' ? 'PENDIDIKAN FORMAL' : 'FORMAL EDUCATION'}
                </span>
                <GraduationCap size={16} className="text-[var(--text-muted)]" />
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] mb-1">
                Politeknik Negeri Jember
              </h3>
              <p className="text-xs text-[var(--accent-red)] font-semibold mb-2">
                D4 Teknik Informatika (Semester 5)
              </p>
              <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed mb-4">
                {lang === 'id'
                  ? 'Fokus pada arsitektur sistem berbasis web & mobile, rekayasa basis data relasional, dan praktik clean code.'
                  : 'Focused on web & mobile system architecture, relational database engineering, and clean code practices.'}
              </p>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{lang === 'id' ? 'Status Akademik:' : 'Academic Status:'}</span>
              <span className="font-bold text-[var(--text-main)]">
                {isBlackSpace ? '???' : lang === 'id' ? 'IPK 3.72 (Aktif)' : 'GPA 3.72 (Active)'}
              </span>
            </div>
          </div>

          {/* Languages & Specialization Box */}
          <div
            onMouseEnter={() => sound.playTextBlip()}
            className="sketch-border p-4 sm:p-5 bg-[var(--paper-color)] hover:border-[var(--text-main)] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[var(--accent-red)] font-bold tracking-widest uppercase">
                  &gt; {lang === 'id' ? 'BAHASA & KOMPETENSI' : 'LANGUAGES & FOCUS'}
                </span>
                <BookOpen size={16} className="text-[var(--text-muted)]" />
              </div>

              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[var(--text-main)] font-semibold">{lang === 'id' ? 'Bahasa Indonesia' : 'Indonesian'}</span>
                    <span className="text-[var(--accent-red)] font-bold">{lang === 'id' ? 'Penutur Asli (Native)' : 'Native'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-color)] sketch-border overflow-hidden">
                    <div className="h-full bg-[var(--accent-red)] w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[var(--text-main)] font-semibold">{lang === 'id' ? 'Bahasa Inggris' : 'English'}</span>
                    <span className="text-[var(--accent-red)] font-bold">CEFR B1 (Intermediate)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-color)] sketch-border overflow-hidden">
                    <div className="h-full bg-[var(--accent-red)] w-[70%]"></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border-color)] pt-3 text-xs space-y-1">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {lang === 'id' ? 'SPESIALISASI UTAMA:' : 'PRIMARY SPECIALIZATION:'}
                </div>
                <div className="font-bold text-[var(--text-main)] text-[11px] flex items-center gap-1.5">
                  <Terminal size={12} className="text-[var(--accent-red)]" />
                  <span>Backend Architecture & Database Engineering</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3 mt-3 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{lang === 'id' ? 'Kesiapan Kerja:' : 'Availability:'}</span>
              <span className="font-bold text-[var(--text-main)]">
                {isBlackSpace ? '???' : lang === 'id' ? 'Siap Magang' : 'Open for Internship'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
