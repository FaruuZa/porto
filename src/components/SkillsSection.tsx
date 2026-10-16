import React, { useState, useEffect, useMemo } from 'react';
import { PlaceholderIcon } from './PlaceholderIcon';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { useLanguage } from '../utils/languageContext';
import { BlackScribble } from './BlackScribble';
import { useSanityProfile } from '../sanity/useSanityProfile';

interface SkillsSectionProps {
  theme?: ThemeMode;
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

  return (
    <section
      id="skills"
      className="section-shell font-mono"
    >
      <div className="section-inner relative">
        {/* Section Header */}
        <div className="section-header relative">
          <div className="flex items-center gap-2">
            <span data-no-glitch="true" className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
              03. {lang === 'id' ? 'KEAHLIAN' : 'SKILLS'} {isBlackSpace ? '// CORRUPTED' : lang === 'id' ? '// TEKNOLOGI & TOOLS' : '// TECH STACK'}
            </span>

            {/* Slot 0: In header next to badge */}
            {skillsScribble && skillsScribble.slotIndex === 0 && (
              <BlackScribble scribble={skillsScribble} className="ml-1" />
            )}
          </div>

          <h2 data-no-glitch="true" className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
            {isBlackSpace
              ? 'Corrupted Tech Stack'
              : lang === 'id'
              ? 'Keahlian & Penguasaan Teknologi'
              : 'Skills & Technologies'}
          </h2>
          <div className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
            {isBlackSpace ? (
              <span className="text-[var(--text-muted)] italic">
                {lang === 'id'
                  ? 'Kompilasi perkakas dan repositori terdistorsi. Sesuatu hilang...'
                  : 'Distorted tools and code environments. Something is missing...'}
              </span>
            ) : (
              lang === 'id'
                ? 'Bahasa pemrograman, backend framework, basis data relasional, dan mobile development.'
                : 'Programming languages, backend frameworks, relational databases, and mobile engineering.'
            )}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 relative">
          {skills.map((skill, idx) => (
            <div
              key={skill._id || skill.name}
              onMouseEnter={() => sound.playTextBlip()}
              className="sketch-border sketch-card p-2.5 sm:p-3 bg-[var(--paper-color)] flex flex-col justify-between group relative"
            >
              {/* Slot 1: Nestled inside first card */}
              {skillsScribble && skillsScribble.slotIndex === 1 && idx === 0 && (
                <div className="absolute -top-3 -right-2 z-10">
                  <BlackScribble scribble={skillsScribble} />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  [{skill.category}]
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 sketch-border font-bold ${
                    skill.level === 'Advanced' || skill.level === 'Proficient'
                      ? 'text-[var(--accent-red)] border-[var(--accent-red)]'
                      : 'text-[var(--text-muted)] border-[var(--border-color)]'
                  }`}
                >
                  {skill.level}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-1.5 sketch-border bg-[var(--bg-color)] group-hover:scale-105 transition-transform flex items-center justify-center">
                  <PlaceholderIcon name={skill.iconId || skill.name.toLowerCase()} size={18} />
                </div>
                <div className="font-bold text-xs sm:text-sm text-[var(--text-main)]">
                  {skill.name}
                </div>
              </div>
            </div>
          ))}

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
