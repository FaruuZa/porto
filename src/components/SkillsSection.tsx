import React, { useState, useEffect, useMemo } from 'react';
import { PlaceholderIcon } from './PlaceholderIcon';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { useLanguage } from '../utils/languageContext';
import { BlackScribble } from './BlackScribble';
import { useSanityProfile } from '../sanity/useSanityProfile';
import { Server, Smartphone, Database, LucideIcon } from 'lucide-react';
import { SkillItem } from '../types';

interface SkillsSectionProps {
  theme?: ThemeMode;
}

interface SkillDomain {
  id: string;
  pageNum: string;
  title: string;
  note: string;
  icon: LucideIcon;
  skills: SkillItem[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ theme = 'light' }) => {
  const { lang } = useLanguage();
  const { skills } = useSanityProfile();
  const isBlackSpace = theme === 'black-space';
  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  const skillsScribble: ScribbleLocation | undefined = useMemo(() => {
    if (!isBlackSpace) return undefined;
    return puzzleState.scribbles.find((s) => s.section === 'skills');
  }, [isBlackSpace, puzzleState.scribbles]);

  // Clean domain role grouping (Directly matching Sanity category & sort order)
  const skillDomains: SkillDomain[] = useMemo(() => {
    const isBackend = (s: SkillItem) => {
      const cat = (s.category || '').toLowerCase();
      if (cat === 'backend') return true;
      if (cat === 'mobile' || cat === 'client' || cat === 'database-tools' || cat === 'database' || cat === 'tool') return false;
      const name = s.name.toLowerCase();
      const id = (s.iconId || '').toLowerCase();
      return ['laravel', 'php', 'java', 'kotlin', 'spring', 'node', 'express', 'golang', 'rust', 'python'].some(k => name.includes(k) || id.includes(k));
    };

    const isMobileOrClient = (s: SkillItem) => {
      const cat = (s.category || '').toLowerCase();
      if (cat === 'mobile' || cat === 'client') return true;
      if (cat === 'backend' || cat === 'database-tools' || cat === 'database' || cat === 'tool') return false;
      const name = s.name.toLowerCase();
      const id = (s.iconId || '').toLowerCase();
      return ['flutter', 'javascript', 'typescript', 'react', 'vue', 'html', 'css', 'android', 'ios', 'code'].some(k => name.includes(k) || id.includes(k));
    };

    const sortByOrder = (a: SkillItem, b: SkillItem) => (a.order ?? 99) - (b.order ?? 99);

    const backend = skills.filter(isBackend).sort(sortByOrder);
    const mobile = skills.filter((s) => isMobileOrClient(s) && !backend.includes(s)).sort(sortByOrder);
    const dataTools = skills.filter((s) => !backend.includes(s) && !mobile.includes(s)).sort(sortByOrder);

    return [
      {
        id: 'backend',
        pageNum: 'pg. 01',
        title: lang === 'id' ? 'backend & systems' : 'backend & systems',
        note: lang === 'id' ? 'logika server, rest api & oop' : 'server logic, rest apis & oop',
        icon: Server,
        skills: backend,
      },
      {
        id: 'client',
        pageNum: 'pg. 02',
        title: lang === 'id' ? 'mobile & client' : 'mobile & client',
        note: lang === 'id' ? 'antarmuka aplikasi & web' : 'mobile apps & web interfaces',
        icon: Smartphone,
        skills: mobile,
      },
      {
        id: 'data-tools',
        pageNum: 'pg. 03',
        title: lang === 'id' ? 'database & tooling' : 'database & tooling',
        note: lang === 'id' ? 'relasi data & kolaborasi git' : 'relational data & git versioning',
        icon: Database,
        skills: dataTools,
      },
    ];
  }, [skills, lang]);

  return (
    <section id="skills" className="section-shell font-mono">
      <div className="section-inner relative">
        {/* Section Header (Sketchbook style with Caveat handwriting & curly arrow) */}
        <div className="section-header relative">
          <div className="flex items-center gap-2">
            <span
              data-no-glitch="true"
              className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold"
            >
              03. {lang === 'id' ? 'KEAHLIAN' : 'SKILLS'}{' '}
              {isBlackSpace ? '// CORRUPTED' : '// TOOLBOX'}
            </span>

            {/* Slot 0: In header next to badge */}
            {skillsScribble && skillsScribble.slotIndex === 0 && (
              <BlackScribble scribble={skillsScribble} className="ml-1" />
            )}
          </div>

          <h2
            data-no-glitch="true"
            className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5"
          >
            {isBlackSpace
              ? 'Corrupted Tech Stack'
              : lang === 'id'
              ? 'Keahlian & Perkakas Kerja'
              : 'Skills & Everyday Tools'}
          </h2>

          {/* Subtitle with Caveat handwritten annotation & arrow doodle */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-sans text-xs text-[var(--text-muted)]">
            <span>
              {isBlackSpace
                ? lang === 'id'
                  ? 'Kompilasi perkakas terdistorsi memori. Sesuatu hilang...'
                  : 'Distorted tools and code environments. Something is missing...'
                : lang === 'id'
                ? 'Teknologi dan bahasa yang saya gunakan untuk merancang sistem.'
                : 'Technologies and environments I rely on to build working software.'}
            </span>

            {!isBlackSpace && (
              <span className="font-handwriting text-sm sm:text-base text-[var(--accent-red)] text-line-boil -rotate-1 select-none">
                {lang === 'id' ? '~ perkakas andalan harian' : '~ tools I actually build with'}
              </span>
            )}
          </div>
        </div>

        {/* 3 Sketchbook Memo Columns (Unboxed, airy, tape accents, OMORI sketchbook vibe) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 relative items-stretch">
          {skillDomains.map((domain, colIdx) => {
            const IconComponent = domain.icon;
            const tiltAngles = ['-rotate-1', 'rotate-1', '-rotate-1.5'];
            const restingTilt = tiltAngles[colIdx % tiltAngles.length];

            return (
              <div
                key={domain.id}
                className={`omori-card p-3.5 sm:p-4 flex flex-col justify-between relative group select-none ${restingTilt} hover:rotate-0 hover:scale-[1.02] transition-all duration-300 ease-out cursor-default shadow-[0_3px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.65)]`}
              >
                {/* Scrapbook photo tape accent centered on top */}
                <div
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3 bg-black/15 dark:bg-white/15 border-x border-black/25 ${
                    colIdx === 0 ? '-rotate-1' : colIdx === 1 ? 'rotate-1' : '-rotate-0.5'
                  } pointer-events-none z-10 shadow-[0_1px_2px_rgba(0,0,0,0.08)]`}
                />

                {/* Slot 1: Nestled inside first domain column */}
                {skillsScribble && skillsScribble.slotIndex === 1 && colIdx === 0 && (
                  <div className="absolute -top-3 -right-2 z-20">
                    <BlackScribble scribble={skillsScribble} />
                  </div>
                )}

                <div>
                  {/* Sketchbook Memo Header (Clean pixel title + Caveat handwritten note + page number) */}
                  <div className="border-b border-dashed border-[var(--border-color)] pb-2 mb-2.5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <IconComponent size={13} className="text-[var(--accent-red)] shrink-0" />
                        <h3 className="text-xs sm:text-sm font-bold text-[var(--text-main)] font-mono lowercase tracking-wide">
                          {domain.title}
                        </h3>
                      </div>
                      <span className="font-handwriting text-xs text-[var(--text-muted)] block mt-0.5">
                        ~ {domain.note}
                      </span>
                    </div>

                    <span className="font-handwriting text-xs text-[var(--accent-red)] font-semibold shrink-0 pt-0.5">
                      {domain.pageNum}
                    </span>
                  </div>

                  {/* Skills List: AIRY, UNBOXED ROWS (No boxes inside boxes! Just clean notebook dividers, NO klaim kemahiran) */}
                  <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                    {domain.skills.map((skill) => {
                      const displayName = skill.name.toLowerCase().includes('javascript')
                        ? 'JavaScript'
                        : skill.name;
                      return (
                        <div
                          key={skill._id || skill.name}
                          className="py-1.5 flex items-center gap-2.5 hover:translate-x-0.5 transition-transform group/skill"
                        >
                          <span className="text-[var(--text-muted)] group-hover/skill:text-[var(--accent-red)] transition-colors text-xs font-mono">
                            •
                          </span>
                          <div className="shrink-0 group-hover/skill:scale-110 transition-transform">
                            <PlaceholderIcon
                              name={skill.iconId || displayName.toLowerCase()}
                              size={14}
                            />
                          </div>
                          <span className="font-bold text-xs text-[var(--text-main)] truncate font-mono">
                            {displayName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subtle handwritten memo footer */}
                <div className="mt-3 pt-2 border-t border-dashed border-[var(--border-color)] flex items-center justify-between text-[11px] font-handwriting text-[var(--text-muted)]">
                  <span>{domain.skills.length} {lang === 'id' ? 'perkakas siap pakai' : 'items equipped'}</span>
                  <span className="text-[10px] font-mono text-[var(--accent-red)]">✓</span>
                </div>
              </div>
            );
          })}

          {/* Slot 2: Tucked at bottom right of grid */}
          {skillsScribble && skillsScribble.slotIndex === 2 && (
            <div className="absolute -bottom-7 right-2">
              <BlackScribble scribble={skillsScribble} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
