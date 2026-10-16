import React, { useState, useEffect, useMemo } from 'react';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { GraduationCap, BookOpen, Terminal } from 'lucide-react';
import { useLanguage } from '../utils/languageContext';
import { BlackScribble } from './BlackScribble';
import { useSanityProfile } from '../sanity/useSanityProfile';
import { getLocalizedText } from '../utils/projectHelpers';

interface StatsSheetProps {
  theme?: ThemeMode;
}

export const StatsSheet: React.FC<StatsSheetProps> = ({ theme = 'light' }) => {
  const { lang } = useLanguage();
  const { profile } = useSanityProfile();
  const isBlackSpace = theme === 'black-space';
  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  const profileScribble: ScribbleLocation | undefined = useMemo(() => {
    if (!isBlackSpace) return undefined;
    return puzzleState.scribbles.find((s) => s.section === 'profile');
  }, [isBlackSpace, puzzleState.scribbles]);

  return (
    <section
      id="profile"
      className="section-shell font-mono"
    >
      <div className="section-inner relative">
        {/* Section Header */}
        <div className="section-header sm:mb-6 relative">
          <div className="flex items-center gap-2">
            <span data-no-glitch="true" className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
              04. {lang === 'id' ? 'PROFIL' : 'PROFILE'} {isBlackSpace ? '// CORRUPTED' : lang === 'id' ? '// PENDIDIKAN & LATAR BELAKANG' : '// EDUCATION & BACKGROUND'}
            </span>

            {/* Slot 0: In header */}
            {profileScribble && profileScribble.slotIndex === 0 && (
              <BlackScribble scribble={profileScribble} className="ml-1" />
            )}
          </div>

          <h2 data-no-glitch="true" className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
            {isBlackSpace
              ? 'Corrupted Character Sheet'
              : lang === 'id'
              ? 'Pendidikan & Profil Akademik'
              : 'Education & Academic Profile'}
          </h2>
          <div className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
            {isBlackSpace ? (
              <span className="text-[var(--text-muted)] italic">
                {lang === 'id'
                  ? 'Catatan akademik terdistorsi memori. Data tidak dapat diverifikasi.'
                  : 'Academic records corrupted by memory loss. Data cannot be verified.'}
              </span>
            ) : (
              lang === 'id'
                ? 'Riwayat pendidikan formal, penguasaan bahasa, dan eksplorasi rekayasa sistem.'
                : 'Academic milestones, language proficiency, and software engineering exploration.'
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          
          {/* Education Box */}
          <div
            onMouseEnter={() => sound.playTextBlip()}
            className="sketch-border sketch-card p-4 sm:p-5 bg-[var(--paper-color)] flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[var(--accent-red)] font-bold tracking-widest uppercase">
                  &gt; {lang === 'id' ? 'PENDIDIKAN FORMAL' : 'FORMAL EDUCATION'}
                </span>
                <GraduationCap size={16} className="text-[var(--text-muted)]" />
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] mb-1">
                {profile.education?.institution || 'Politeknik Negeri Jember'}
              </h3>
              <p className="text-xs text-[var(--accent-red)] font-semibold mb-2">
                {profile.education?.major || 'D4 Teknik Informatika'} (Semester {profile.education?.semester ?? 5})
              </p>
              <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed mb-4">
                {getLocalizedText(profile.education?.description, lang)}
              </p>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{lang === 'id' ? 'Status Akademik:' : 'Academic Status:'}</span>
              <span className="font-bold text-[var(--text-main)]">
                {isBlackSpace
                  ? '???'
                  : profile.education?.academicStatus
                  ? getLocalizedText(profile.education.academicStatus, lang)
                  : lang === 'id'
                  ? `IPK ${profile.education?.gpa || '3.72'} (Aktif)`
                  : `GPA ${profile.education?.gpa || '3.72'} (Active)`}
              </span>
            </div>
          </div>

          {/* Languages & Specialization Box */}
          <div
            onMouseEnter={() => sound.playTextBlip()}
            className="sketch-border sketch-card p-4 sm:p-5 bg-[var(--paper-color)] flex flex-col justify-between relative"
          >
            {/* Slot 1: Nestled in 2nd card top-right */}
            {profileScribble && profileScribble.slotIndex === 1 && (
              <div className="absolute -top-3 -right-2 z-10">
                <BlackScribble scribble={profileScribble} />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[var(--accent-red)] font-bold tracking-widest uppercase">
                  &gt; {lang === 'id' ? 'BAHASA & KOMPETENSI' : 'LANGUAGES & FOCUS'}
                </span>
                <BookOpen size={16} className="text-[var(--text-muted)]" />
              </div>

              <div className="space-y-3 mb-4 text-xs">
                {(profile.languages && profile.languages.length > 0 ? profile.languages : []).map((langItem, idx) => {
                  const langName = getLocalizedText(langItem.name, lang);
                  const langLevel = getLocalizedText(langItem.level, lang);
                  const pct = Math.min(100, Math.max(0, langItem.percentage ?? 70));
                  return (
                    <div key={langItem._key || `lang-${idx}`}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[var(--text-main)] font-semibold">{langName}</span>
                        <span className="text-[var(--accent-red)] font-bold">{langLevel}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-color)] sketch-border overflow-hidden">
                        <div className="h-full bg-[var(--accent-red)]" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[var(--border-color)] pt-3 text-xs space-y-1">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {lang === 'id' ? 'SPESIALISASI UTAMA:' : 'PRIMARY SPECIALIZATION:'}
                </div>
                <div className="font-bold text-[var(--text-main)] text-[11px] flex items-center gap-1.5">
                  <Terminal size={12} className="text-[var(--accent-red)]" />
                  <span>{profile.specialization || 'Backend Systems & Database Engineering'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3 mt-3 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{lang === 'id' ? 'Kesiapan Kerja:' : 'Availability:'}</span>
              <span className="font-bold text-[var(--text-main)]">
                {isBlackSpace ? '???' : getLocalizedText(profile.status, lang)}
              </span>
            </div>
          </div>

          {/* Slot 2: Tucked at bottom of sheet */}
          {profileScribble && profileScribble.slotIndex === 2 && (
            <div className="absolute -bottom-7 left-2">
              <BlackScribble scribble={profileScribble} />
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
