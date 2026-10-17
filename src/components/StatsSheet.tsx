import React, { useState, useEffect, useMemo } from 'react';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { GraduationCap, BookOpen, Terminal, User, CheckCircle2 } from 'lucide-react';
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

  const institution = profile.education?.institution || 'Politeknik Negeri Jember';
  const major = profile.education?.major || 'D4 Teknik Informatika';
  const semester = profile.education?.semester ?? 5;
  const gpa = profile.education?.gpa || '3.72';

  return (
    <section id="profile" className="section-shell font-mono">
      <div className="section-inner relative">
        {/* Section Header (Sketchbook style with Caveat handwriting & star doodle) */}
        <div className="section-header relative">
          <div className="flex items-center gap-2">
            <span
              data-no-glitch="true"
              className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold"
            >
              04. {lang === 'id' ? 'PROFIL' : 'PROFILE'}{' '}
              {isBlackSpace
                ? '// CORRUPTED'
                : lang === 'id'
                ? '// CATATAN AKADEMIK'
                : '// STUDENT DOSSIER'}
            </span>

            {/* Slot 0: In header */}
            {profileScribble && profileScribble.slotIndex === 0 && (
              <BlackScribble scribble={profileScribble} className="ml-1" />
            )}
          </div>

          <h2
            data-no-glitch="true"
            className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5"
          >
            {isBlackSpace
              ? 'Corrupted Character Sheet'
              : lang === 'id'
              ? 'Profil & Rekam Akademik'
              : 'Academic Record & Profile'}
          </h2>

          {/* Subtitle with Caveat handwritten annotation & star scribble */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-sans text-xs text-[var(--text-muted)]">
            <span>
              {isBlackSpace
                ? lang === 'id'
                  ? 'Catatan akademik terdistorsi memori. Data tidak dapat diverifikasi.'
                  : 'Academic records corrupted by memory loss. Data cannot be verified.'
                : lang === 'id'
                ? 'Latar belakang pendidikan, penguasaan bahasa, dan komitmen rekayasa perangkat lunak.'
                : 'Educational milestones, language proficiency, and software engineering discipline.'}
            </span>

            {!isBlackSpace && (
              <span className="font-handwriting text-sm sm:text-base text-[var(--accent-red)] text-line-boil rotate-1 select-none">
                {lang === 'id' ? '~ catatan mahasiswa polije' : '~ student field notes'}
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Balanced Layout (Left: Student Memo ID clipping, Right: Curriculum & Language Dossier) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 relative items-stretch">
          
          {/* LEFT: Student Character Dossier / Memo Card (md:col-span-5) */}
          <div className="md:col-span-5 omori-card p-4 sm:p-4.5 flex flex-col justify-between relative group select-none">
            {/* Scrapbook photo tape accent on top corner */}
            <div className="absolute -top-1.5 left-5 w-8 h-2.5 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-3 pointer-events-none z-10" />

            {/* Slot 1: Nestled in character card */}
            {profileScribble && profileScribble.slotIndex === 1 && (
              <div className="absolute -top-3 -right-2 z-20">
                <BlackScribble scribble={profileScribble} />
              </div>
            )}

            <div>
              {/* Card Header (Clean notebook memo header, zero military HUD tags) */}
              <div className="border-b border-dashed border-[var(--border-color)] pb-2 mb-3.5 flex items-center justify-between">
                <span className="font-handwriting text-sm text-[var(--accent-red)]">
                  {isBlackSpace
                    ? '~ corrupted memory record'
                    : lang === 'id'
                    ? '~ kartu identitas mahasiswa'
                    : '~ student profile clipping'}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {isBlackSpace ? '???' : `sem. 0${semester}`}
                </span>
              </div>

              {/* Persona & Name Frame (Airy, unboxed, sketchbook style) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 border-2 border-[var(--border-color)] bg-[var(--bg-color)] flex items-center justify-center shrink-0 relative group-hover:rotate-1 transition-transform">
                  <User size={22} className="text-[var(--text-main)] opacity-85" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[var(--accent-red)] border border-[var(--paper-color)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] truncate leading-tight">
                    {profile.name || 'Ahmad Abdillah Faza'}
                  </h3>
                  <div className="font-handwriting text-sm text-[var(--accent-red)] mt-0.5 truncate">
                    "Faza" • Software Engineering
                  </div>
                </div>
              </div>

              {/* Verified Credentials List (Airy, unboxed, subtle pencil dividers) */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-baseline justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-1.5">
                  <span className="font-handwriting text-sm text-[var(--text-muted)] shrink-0">
                    {lang === 'id' ? 'kampus:' : 'campus:'}
                  </span>
                  <span className="font-bold text-[var(--text-main)] text-right text-xs pl-2 truncate">
                    {isBlackSpace ? '???' : institution}
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-1.5">
                  <span className="font-handwriting text-sm text-[var(--text-muted)] shrink-0">
                    {lang === 'id' ? 'jurusan:' : 'major:'}
                  </span>
                  <span className="font-bold text-[var(--text-main)] text-right text-xs pl-2 truncate">
                    {isBlackSpace ? '???' : major}
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-1.5">
                  <span className="font-handwriting text-sm text-[var(--text-muted)] shrink-0">
                    {lang === 'id' ? 'akademik:' : 'academic:'}
                  </span>
                  <span className="font-bold text-xs text-[var(--text-main)]">
                    {isBlackSpace ? (
                      '???'
                    ) : (
                      <>
                        <span className="text-[var(--accent-red)] font-bold text-sm">IPK {gpa}</span> / 4.00
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Availability Indicator & Handwritten footnote */}
            <div className="mt-4 pt-2.5 border-t border-dashed border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="font-handwriting text-xs text-[var(--text-muted)]">
                {lang === 'id' ? '~ siap berkontribusi' : '~ open to work & learn'}
              </span>
              <span className="font-bold text-[10px] text-[var(--accent-red)] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] inline-block animate-pulse" />
                <span>
                  {isBlackSpace ? '???' : getLocalizedText(profile.status, lang) || 'Open for Internship'}
                </span>
              </span>
            </div>
          </div>

          {/* RIGHT: Academic Curriculum & Language Dossier (md:col-span-7) */}
          <div className="md:col-span-7 omori-card p-4 sm:p-4.5 flex flex-col justify-between relative group select-none">
            {/* Scrapbook photo tape accent on top right */}
            <div className="absolute -top-1.5 right-6 w-8 h-2.5 bg-black/10 dark:bg-white/10 border-x border-black/20 rotate-2 pointer-events-none z-10" />

            <div>
              {/* Section 1: Curriculum & Coursework Focus */}
              <div className="mb-4">
                <div className="flex items-center justify-between border-b border-dashed border-[var(--border-color)] pb-2 mb-2">
                  <h3 className="font-mono text-xs font-bold text-[var(--text-main)] lowercase tracking-wide flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-[var(--accent-red)] shrink-0" />
                    <span>{lang === 'id' ? 'kurikulum & fokus rekayasa' : 'curriculum & engineering focus'}</span>
                  </h3>
                  <span className="font-handwriting text-xs text-[var(--accent-red)]">
                    sem. 05
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed mb-3">
                  {getLocalizedText(profile.education?.description, lang)}
                </p>

                {/* Core Competencies Badges: Airy, lightweight dashed pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    lang === 'id' ? 'basis data relasional' : 'relational db design',
                    lang === 'id' ? 'arsitektur mvc & rest api' : 'mvc & rest api architecture',
                    lang === 'id' ? 'sinkronisasi mobile' : 'mobile synchronization',
                    lang === 'id' ? 'kolaborasi tim git' : 'git team workflows',
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 border border-dashed border-[var(--border-color)] bg-[var(--bg-color)]/70 text-[10px] font-mono text-[var(--text-main)] flex items-center gap-1 hover:border-[var(--accent-red)] transition-colors"
                    >
                      <CheckCircle2 size={9.5} className="text-[var(--accent-red)] shrink-0" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 2: Languages & Specialization (Zero nested boxes! Clear & breathable) */}
              <div className="border-t border-dashed border-[var(--border-color)] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-xs font-bold text-[var(--text-main)] lowercase tracking-wide flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[var(--accent-red)] shrink-0" />
                    <span>{lang === 'id' ? 'kemampuan bahasa' : 'languages'}</span>
                  </h3>
                  <span className="font-handwriting text-xs text-[var(--text-muted)]">
                    {lang === 'id' ? '~ verifikasi komunikasi' : '~ communication'}
                  </span>
                </div>

                {/* Languages List: Open, breathable, informative */}
                <div className="space-y-2">
                  {profile.languages && profile.languages.length > 0 ? (
                    profile.languages.map((item, idx) => {
                      const langName = getLocalizedText(item.name, lang);
                      const levelName = getLocalizedText(item.level, lang);
                      const rawName = (typeof item.name === 'string' ? item.name : item.name?.en || item.name?.id || '').toLowerCase();
                      const isEnglish = rawName.includes('inggris') || rawName.includes('english');

                      return (
                        <div key={item._key || idx} className="border-b border-black/[0.05] dark:border-white/[0.05] pb-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                              {langName}
                            </span>
                            <span
                              className={`text-[11px] font-mono ${
                                isEnglish
                                  ? 'font-bold text-[var(--accent-red)]'
                                  : 'font-semibold text-[var(--text-main)]'
                              }`}
                            >
                              {levelName}
                            </span>
                          </div>
                          {isEnglish && (
                            <span className="font-handwriting text-xs text-[var(--text-muted)] block mt-0.5">
                              {lang === 'id'
                                ? '~ terbiasa membaca dokumentasi teknis, spesifikasi rest, & commit git'
                                : '~ comfortable reading technical docs, api specs & git commits'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Indonesian */}
                      <div className="flex items-baseline justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-1">
                        <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                          {lang === 'id' ? 'Bahasa Indonesia' : 'Indonesian'}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-[var(--text-main)]">
                          {lang === 'id' ? 'Penutur Asli (Native)' : 'Native Speaker'}
                        </span>
                      </div>

                      {/* English */}
                      <div className="border-b border-black/[0.05] dark:border-white/[0.05] pb-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                            {lang === 'id' ? 'Bahasa Inggris' : 'English'}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[var(--accent-red)]">
                            CEFR B1 (Intermediate)
                          </span>
                        </div>
                        <span className="font-handwriting text-xs text-[var(--text-muted)] block mt-0.5">
                          {lang === 'id'
                            ? '~ terbiasa membaca dokumentasi teknis, spesifikasi rest, & commit git'
                            : '~ comfortable reading technical docs, api specs & git commits'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Specialization Footer */}
            <div className="mt-3 pt-2.5 border-t border-dashed border-[var(--border-color)] flex items-center justify-between text-xs font-mono">
              <span className="font-handwriting text-xs text-[var(--text-muted)]">
                {lang === 'id' ? 'fokus rekayasa:' : 'primary focus:'}
              </span>
              <span className="font-bold text-[11px] text-[var(--text-main)] flex items-center gap-1.5">
                <Terminal size={12} className="text-[var(--accent-red)] shrink-0" />
                <span className="truncate">
                  {profile.specialization || 'Backend Systems & Database Engineering'}
                </span>
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

export default StatsSheet;
