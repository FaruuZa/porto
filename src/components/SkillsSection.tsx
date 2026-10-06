import React, { useState, useEffect } from 'react';
import { SKILLS } from '../data/portfolioData';
import { PlaceholderIcon } from './PlaceholderIcon';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { RedactedText } from './RedactedText';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { useLanguage } from '../utils/languageContext';

interface SkillsSectionProps {
  theme?: ThemeMode;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ theme = 'dark' }) => {
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
    isBlackSpace && puzzleState.spawnLocations.homeSection === 'skills';

  return (
    <section
      id="skills"
      className="h-[100dvh] md:h-screen w-full flex flex-col justify-center items-center overflow-y-auto md:overflow-hidden px-4 sm:px-6 font-mono select-none pt-12 pb-6 md:py-0"
    >
      <div className="w-full max-w-3xl flex flex-col justify-center my-auto">
        {/* Section Header */}
        <div className="border-b border-[var(--border-color)] pb-3 mb-4">
          <span data-glitch="true" className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
            03. {lang === 'id' ? 'KEAHLIAN' : 'SKILLS'} {isBlackSpace ? '// CORRUPTED' : lang === 'id' ? '// TEKNOLOGI & TOOLS' : '// TECH STACK'}
          </span>
          <h2 data-glitch="true" className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
            {isBlackSpace
              ? 'Forbidden Toolset'
              : lang === 'id'
              ? 'Keahlian & Penguasaan Teknologi'
              : 'Skills & Technologies'}
          </h2>
          <div className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
            {isBlackSpace ? (
              <div className="text-[#fca5a5]/80">
                <span>Memory fragments scattered across the digital room.{' '}</span>
                {shouldSpawnAnomalyHere && (
                  <RedactedText
                    theme={theme}
                    anomalyId="anomaly-skills"
                    originalText="A strange artifact rests among the code files."
                    corruptedText="REDACTED_TOOL_#03"
                  />
                )}
              </div>
            ) : (
              lang === 'id'
                ? 'Bahasa pemrograman, backend framework, basis data relasional, dan mobile development.'
                : 'Programming languages, backend frameworks, relational databases, and mobile engineering.'
            )}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {SKILLS.map((skill) => (
            <div
              key={skill.name}
              onMouseEnter={() => sound.playTextBlip()}
              className="sketch-border p-2.5 sm:p-3 bg-[var(--paper-color)] hover:border-[var(--text-main)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between group"
            >
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
        </div>
      </div>
    </section>
  );
};
