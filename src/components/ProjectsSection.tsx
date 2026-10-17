import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSanityProjects } from '../sanity/useSanityProjects';
import { sound } from '../utils/audio';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ThemeMode } from '../App';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { useLanguage } from '../utils/languageContext';
import { BlackScribble } from './BlackScribble';
import { OmoriPhotoCard } from './OmoriPhotoCard';
import { ProjectItem } from '../types';

interface ProjectsSectionProps {
  theme?: ThemeMode;
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
  onNavigateProjects?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  theme = 'light',
  currentSlide = 0,
  onSlideChange,
  onNavigateProjects,
}) => {
  const { lang } = useLanguage();
  const { featuredProjects } = useSanityProjects();
  const isBlackSpace = theme === 'black-space';
  const touchStartX = useRef<number | null>(null);
  const totalSlides = featuredProjects.length + 1;

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

  // Check if projects section has a scribble in this session
  const projectScribble: ScribbleLocation | undefined = useMemo(() => {
    if (!isBlackSpace) return undefined;
    return puzzleState.scribbles.find((s) => s.section === 'projects');
  }, [isBlackSpace, puzzleState.scribbles]);

  return (
    <section
      id="projects"
      className="section-shell font-mono"
    >
      <div className="section-inner relative">
        {/* Section Header */}
        <div className="border-b border-[var(--border-color)] pb-3 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 relative">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span data-no-glitch="true" className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
                02. {lang === 'id' ? 'PROYEK' : 'PROJECTS'} // {isBlackSpace ? 'ANOMALIES' : lang === 'id' ? 'PROYEK PILIHAN' : 'FEATURED'}
              </span>

              {/* Slot 2: Tucked quietly next to section marker */}
              {projectScribble && projectScribble.slotIndex === 2 && (
                <BlackScribble scribble={projectScribble} className="ml-1" />
              )}
            </div>

            <h2 data-no-glitch="true" className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
              {isBlackSpace
                ? 'Corrupted Systems'
                : lang === 'id'
                ? 'Pilihan Proyek'
                : 'Featured Projects'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
              {lang === 'id'
                ? 'Sistem perangkat lunak dan aplikasi pilihan. Geser kartu atau gunakan tombol panah / [A / D].'
                : 'Selected software systems and technical projects. Slide cards or use arrow keys / [A / D].'}
            </p>
          </div>

          {/* Slider Controls & Counter */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 whitespace-nowrap">
            {/* Slot 0: Alongside slider counter */}
            {projectScribble && projectScribble.slotIndex === 0 && (
              <BlackScribble scribble={projectScribble} className="mr-1" />
            )}

            <span className="text-[11px] text-[var(--text-muted)] font-mono mr-1 whitespace-nowrap shrink-0 select-none">
              [ 0{currentSlide + 1} / 0{totalSlides} ]
            </span>

            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              onMouseEnter={() => sound.playTextBlip()}
              className={`p-1.5 border border-[var(--border-color)] transition-all flex items-center justify-center ${
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
              className="p-1.5 border border-[var(--border-color)] transition-all flex items-center justify-center hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] text-[var(--text-main)] cursor-pointer"
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
            {/* Featured Project Cards (Qlinica & RahmatBakery) */}
            {featuredProjects.map((project, idx) => (
              <div key={project.id} className="w-full shrink-0 px-0.5 relative">
                <OmoriPhotoCard
                  project={project}
                  index={idx}
                  isBlackSpace={isBlackSpace}
                  layout="slider"
                />

                {/* Slot 1: Tucked quietly in card corner for primary card in Black Space */}
                {projectScribble && projectScribble.slotIndex === 1 && idx === 0 && (
                  <div className="absolute bottom-4 right-4 z-30">
                    <BlackScribble scribble={projectScribble} />
                  </div>
                )}
              </div>
            ))}

            {/* Final Slide: "View All Projects →" with MATCHING HEIGHT & OMORI CARD STYLING */}
            <div className="w-full shrink-0 px-0.5">
              <div
                onClick={() => {
                  sound.playSelect();
                  onNavigateProjects?.();
                }}
                onMouseEnter={() => sound.playTextBlip()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sound.playSelect();
                    onNavigateProjects?.();
                  }
                }}
                className="omori-card p-6 min-h-[420px] sm:min-h-0 sm:h-[315px] flex flex-col justify-center items-center text-center cursor-pointer group select-none"
              >
                <div className="p-3 border-2 border-[var(--border-color)] bg-[var(--bg-color)] group-hover:scale-110 transition-transform mb-3">
                  <ExternalLink size={24} className="text-[var(--accent-red)]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] mb-1">
                  {lang === 'id' ? 'Buka Arsip Lengkap' : 'Open Complete Archive'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 font-sans leading-relaxed">
                  {lang === 'id'
                    ? 'Eksplorasi seluruh repositori kode, platform web, dan aplikasi yang telah dibangun.'
                    : 'Explore all repositories, web platforms, and application architectures built.'}
                </p>
                <span className="px-4 py-2 border-2 border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg-color)] font-bold text-xs inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                  <span>{lang === 'id' ? '[ BUKA ARSIP LENGKAP ]' : '[ EXPLORE ALL PROJECTS ]'}</span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
