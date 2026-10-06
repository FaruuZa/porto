import React, { useRef, useState, useEffect } from 'react';
import { FEATURED_PROJECTS } from '../data/projectsData';
import { PlaceholderIcon } from './PlaceholderIcon';
import { sound } from '../utils/audio';
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink, FolderArchive } from 'lucide-react';
import { ThemeMode } from '../App';
import { RedactedText } from './RedactedText';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { useLanguage } from '../utils/languageContext';

interface ProjectsSectionProps {
  theme?: ThemeMode;
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
  onNavigateProjects?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  theme = 'dark',
  currentSlide = 0,
  onSlideChange,
  onNavigateProjects,
}) => {
  const { lang } = useLanguage();
  const isBlackSpace = theme === 'black-space';
  const touchStartX = useRef<number | null>(null);
  const totalSlides = FEATURED_PROJECTS.length + 1;

  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  const handlePrev = () => {
    if (currentSlide > 0) {
      sound.playSelect();
      onSlideChange?.(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      sound.playSelect();
      onSlideChange?.(currentSlide + 1);
    } else {
      // If already on the final slide and clicks next, open archive!
      sound.playSelect();
      onNavigateProjects?.();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="projects"
      className="h-[100dvh] md:h-screen w-full flex flex-col justify-center items-center overflow-y-auto md:overflow-hidden px-4 sm:px-6 font-mono select-none pt-12 pb-6 md:py-0"
    >
      <div className="w-full max-w-3xl flex flex-col justify-center my-auto">
        {/* Section Header */}
        <div className="border-b border-[var(--border-color)] pb-3 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span data-glitch="true" className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
              02. {lang === 'id' ? 'PROYEK' : 'PROJECTS'} // {isBlackSpace ? 'ANOMALIES' : lang === 'id' ? 'PROYEK UNGGULAN' : 'FEATURED'}
            </span>
            <h2 data-glitch="true" className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
              {isBlackSpace
                ? 'Corrupted Systems'
                : lang === 'id'
                ? 'Pilihan Proyek Perangkat Lunak'
                : 'Featured Software Systems'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
              {lang === 'id'
                ? 'Geser kartu proyek atau gunakan tombol panah / [A / D].'
                : 'Slide project cards or use arrow keys / [A / D].'}
            </p>
          </div>

          {/* Slider Controls & Counter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] text-[var(--text-muted)] font-mono mr-1">
              [ 0{currentSlide + 1} / 0{totalSlides} ]
            </span>

            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              onMouseEnter={() => sound.playTextBlip()}
              className={`p-1.5 sketch-border transition-all flex items-center justify-center ${
                currentSlide === 0
                  ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
                  : 'hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] text-[var(--text-main)] cursor-pointer'
              }`}
              aria-label="Previous project (A / Left)"
              title="Previous project [A]"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={handleNext}
              onMouseEnter={() => sound.playTextBlip()}
              className="p-1.5 sketch-border transition-all flex items-center justify-center hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] text-[var(--text-main)] cursor-pointer"
              aria-label="Next project (D / Right)"
              title={currentSlide === totalSlides - 1 ? "Open archive [D]" : "Next project [D]"}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Horizontal Slider Stage */}
        <div
          className="relative overflow-hidden w-full touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-400 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Featured Project Cards (1 to 4) */}
            {FEATURED_PROJECTS.map((project, idx) => (
              <div key={project.id} className="w-full shrink-0 px-0.5">
                <div
                  onMouseEnter={() => sound.playTextBlip()}
                  className="sketch-border p-4 sm:p-6 bg-[var(--paper-color)] hover:border-[var(--text-main)] transition-colors min-h-[310px] sm:min-h-[330px] flex flex-col justify-between"
                >
                  <div>
                    {/* Top Meta Line */}
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono mb-2">
                      <span className="text-[var(--accent-red)] font-bold tracking-wider">
                        {project.badge || `PROJ_0${idx + 1}`}
                      </span>
                      <span>{project.year || '2024'}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] mb-1 leading-snug">
                      {project.title}
                    </h3>

                    {/* Tagline / Subtitle */}
                    <p className="text-xs text-[var(--text-muted)] mb-3 italic">
                      "{project.tagline}"
                    </p>

                    {/* Description or Anomaly */}
                    <div className="text-xs text-[var(--text-main)]/90 leading-relaxed font-sans mb-4 line-clamp-3">
                      {isBlackSpace &&
                      puzzleState.spawnLocations.secondaryLocation === 'projects' &&
                      idx === puzzleState.spawnLocations.projectCardIndex ? (
                        <RedactedText
                          theme={theme}
                          anomalyId="anomaly-projects"
                          originalText="A dark memory from this project repository."
                          corruptedText="GIT_COMMIT_HORROR_#02"
                        />
                      ) : (
                        project.description
                      )}
                    </div>

                    {/* Key Metrics / Highlights */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-t border-[var(--border-color)] text-center text-[10px] font-mono">
                      {project.stats.map((stat) => (
                        <div key={stat.label} className="bg-[var(--bg-color)]/50 p-1.5 sketch-border">
                          <div className="text-[var(--text-muted)]">{stat.label}</div>
                          <div className="font-bold text-[var(--text-main)] mt-0.5 truncate">
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack & Links Footer */}
                  <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mr-1">
                        STACK:
                      </span>
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          onMouseEnter={() => sound.playTextBlip()}
                          className="px-2 py-0.5 sketch-border text-[10px] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-all flex items-center gap-1"
                        >
                          <PlaceholderIcon name={tech.toLowerCase()} size={10} />
                          <span>{tech}</span>
                        </span>
                      ))}
                    </div>

                    {/* Direct Actions */}
                    <div className="flex items-center gap-2">
                      {project.links?.github && (
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playSelect()}
                          className="p-1.5 sketch-border hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors flex items-center gap-1 text-[11px]"
                          title="View Repository"
                        >
                          <PlaceholderIcon name="git" size={12} />
                          <span className="hidden sm:inline">REPO</span>
                        </a>
                      )}
                      {project.links?.demo && (
                        <a
                          href={project.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playSelect()}
                          className="px-2.5 py-1.5 sketch-border bg-[var(--text-main)] text-[var(--bg-color)] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-[11px]"
                          title="View Demo"
                        >
                          <ExternalLink size={12} />
                          <span>DEMO</span>
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Final Slide: "View All Projects →" */}
            <div className="w-full shrink-0 px-0.5">
              <div
                onClick={() => {
                  sound.playSelect();
                  onNavigateProjects?.();
                }}
                onMouseEnter={() => sound.playTextBlip()}
                className="sketch-border p-6 bg-[var(--paper-color)] hover:border-[var(--accent-red)] transition-all min-h-[310px] sm:min-h-[330px] flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full sketch-border flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[var(--accent-red)] transition-all">
                  <FolderArchive size={22} className="text-[var(--accent-red)]" />
                </div>

                <span className="text-[10px] text-[var(--accent-red)] uppercase font-bold tracking-widest mb-1">
                  &gt; {lang === 'id' ? 'ARSIP SISTEM' : 'SYSTEM ARCHIVE'}
                </span>

                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-1.5">
                  {lang === 'id' ? 'Lihat Semua Proyek' : 'View All Projects'}
                </h3>

                <p className="text-xs text-[var(--text-muted)] max-w-sm font-sans mb-5">
                  {lang === 'id'
                    ? 'Buka halaman arsip lengkap untuk menelusuri seluruh modul ERP klinik, platform e-commerce, dan aplikasi desktop.'
                    : 'Open the complete archive page to explore clinical ERP modules, multi-channel commerce platforms, and desktop tools.'}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playSelect();
                    onNavigateProjects?.();
                  }}
                  className="px-5 py-2.5 sketch-border-bold bg-[var(--text-main)] text-[var(--bg-color)] font-bold text-xs flex items-center gap-2 group-hover:translate-x-1 transition-all cursor-pointer"
                >
                  <span>{lang === 'id' ? 'BUKA ARSIP LENGKAP' : 'OPEN COMPLETE ARCHIVE'}</span>
                  <ArrowRight size={14} />
                </button>

                <span className="text-[10px] text-[var(--text-muted)] mt-3 font-mono">
                  {lang === 'id'
                    ? '[TEKAN ENTER ATAU KLIK UNTUK MEMBUKA /PROJECTS]'
                    : '[PRESS ENTER OR CLICK TO OPEN /PROJECTS]'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Slide Indicator Bar & Quick Jump */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playTextBlip();
                onSlideChange?.(idx);
              }}
              className={`h-1.5 transition-all rounded-full cursor-pointer ${
                currentSlide === idx
                  ? 'w-5 bg-[var(--accent-red)]'
                  : 'w-2 bg-[var(--border-color)] hover:bg-[var(--text-muted)]'
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
};
