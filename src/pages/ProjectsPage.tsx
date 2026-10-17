import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSanityProjects } from '../sanity/useSanityProjects';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { ArrowLeft, ExternalLink, Search, X } from 'lucide-react';
import { useLanguage } from '../utils/languageContext';
import { OmoriPhotoCard } from '../components/OmoriPhotoCard';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { ProjectItem } from '../types';
import { getLocalizedText } from '../utils/projectHelpers';
import { PlaceholderIcon } from '../components/PlaceholderIcon';
import { urlFor } from '../sanity/client';
import { OmoriMarkerScribble } from '../components/OmoriMarkerScribble';
import { KeyboardHud } from '../components/KeyboardHud';

interface ProjectsPageProps {
  onBack: () => void;
  theme: ThemeMode;
  onToggleTheme?: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onBack,
  theme,
}) => {
  const { lang } = useLanguage();
  const { projects } = useSanityProjects();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);
  const [focusedCardIdx, setFocusedCardIdx] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isBlackSpace = theme === 'black-space';

  // Extract all unique tech stack tags
  const allTechTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (Array.isArray(p.techStack)) {
        p.techStack.forEach((t) => set.add(t));
      }
    });
    return ['ALL', ...Array.from(set).slice(0, 7)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const title = getLocalizedText(project.title, lang).toLowerCase();
      const desc = getLocalizedText(project.description, lang).toLowerCase();
      const shortDesc = getLocalizedText(project.shortDescription, lang).toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const stack = Array.isArray(project.techStack) ? project.techStack : [];

      const matchesSearch = !query ||
        title.includes(query) ||
        desc.includes(query) ||
        shortDesc.includes(query) ||
        stack.some((tech) => tech.toLowerCase().includes(query));

      const matchesTech = selectedTech === 'ALL' ||
        stack.some((t) => t.toLowerCase() === selectedTech.toLowerCase());

      return matchesSearch && matchesTech;
    });
  }, [projects, searchQuery, selectedTech, lang]);

  // Reset keyboard focus when search or filter changes
  useEffect(() => {
    setFocusedCardIdx(-1);
  }, [searchQuery, selectedTech]);

  // Scroll focused card into view smoothly
  useEffect(() => {
    if (focusedCardIdx >= 0 && cardRefs.current[focusedCardIdx]) {
      cardRefs.current[focusedCardIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [focusedCardIdx]);

  // Global keyboard shortcuts for /projects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is actively open, let modal handle its own ESC / Left / Right
      if (detailProject) return;

      const isTyping = document.activeElement === searchInputRef.current;
      const key = e.key.toLowerCase();

      // Quick search shortcut: '/' when not already typing
      if (key === '/' && !isTyping) {
        e.preventDefault();
        sound.playSelect();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Escape key behavior
      if (key === 'escape') {
        if (isTyping) {
          e.preventDefault();
          searchInputRef.current?.blur();
        } else {
          e.preventDefault();
          sound.playSelect();
          onBack();
        }
        return;
      }

      // If user is typing in search input, don't intercept other keys
      if (isTyping) return;

      // Back to home shortcuts: 'b' or Backspace
      if (key === 'b' || key === 'backspace') {
        e.preventDefault();
        sound.playSelect();
        onBack();
        return;
      }

      // Grid Card Navigation
      if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        sound.playSelect();
        setFocusedCardIdx((prev) => (prev < filteredProjects.length - 1 ? prev + 1 : 0));
      } else if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        sound.playSelect();
        setFocusedCardIdx((prev) => (prev > 0 ? prev - 1 : filteredProjects.length - 1));
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        sound.playSelect();
        const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        setFocusedCardIdx((prev) => Math.min(filteredProjects.length - 1, (prev < 0 ? 0 : prev) + cols));
      } else if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        sound.playSelect();
        const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        setFocusedCardIdx((prev) => Math.max(0, (prev < 0 ? 0 : prev) - cols));
      } else if (key === 'enter' || key === ' ' || key === 'i') {
        if (focusedCardIdx >= 0 && focusedCardIdx < filteredProjects.length) {
          e.preventDefault();
          sound.playSelect();
          setDetailProject(filteredProjects[focusedCardIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailProject, filteredProjects, focusedCardIdx, onBack]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] font-mono transition-colors duration-500 pt-16 sm:pt-20 select-none">
      
      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-24 sm:pb-32">
        
        {/* Back Navigation Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => {
              sound.playSelect();
              onBack();
            }}
            onMouseEnter={() => sound.playTextBlip()}
            className="press inline-flex items-center gap-2 px-3.5 py-1.5 border border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-all cursor-pointer font-bold text-xs"
          >
            <ArrowLeft size={13} />
            <span>{lang === 'id' ? '[ KEMBALI KE BERANDA ]' : '[ BACK TO HOME ]'}</span>
          </button>
        </div>
        
        {/* Page Banner */}
        <div className="border-b border-[var(--border-color)] pb-6 mb-8">
          <span className="text-xs text-[var(--accent-red)] uppercase tracking-wider font-bold">
            {isBlackSpace
              ? '02. ARTIFACTS // CORRUPTED MEMORIES'
              : lang === 'id'
              ? '02. ARTIFAK // ARSIP LENGKAP'
              : '02. ARTIFACTS // COMPLETE ARCHIVE'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text-main)] mt-1">
            {isBlackSpace ? (
              <>
                <span className="line-through opacity-40 mr-2">
                  {lang === 'id' ? 'Arsip Lengkap' : 'Complete Archive'}
                </span>
                <span className="text-[var(--text-main)] font-mono">
                  {lang === 'id' ? 'Repositori Terdistorsi' : 'Corrupted Repositories'}
                </span>
              </>
            ) : (
              lang === 'id' ? 'Arsip Lengkap Portofolio Proyek' : 'Software Systems Complete Archive'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-sans max-w-2xl leading-relaxed">
            {isBlackSpace ? (
              <span className="text-[var(--text-muted)] italic">
                {lang === 'id'
                  ? '"Repositori kode terdistorsi dalam kegelapan."'
                  : '"Codebases and repositories distorted in the dark."'}
              </span>
            ) : (
              lang === 'id'
                ? 'Koleksi dokumentasi proyek rekayasa perangkat lunak, sistem ERP terpadu, dan aplikasi mobile.'
                : 'Complete collection of clinical ERP platforms, retail order systems, and technical software applications.'
            )}
          </p>
        </div>

        {/* Filter Tags & Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Tech Tag Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {allTechTags.map((tech) => (
              <button
                key={tech}
                onClick={() => {
                  sound.playTextBlip();
                  setSelectedTech(tech);
                }}
                className={`px-3 py-1 text-xs border transition-all cursor-pointer ${
                  selectedTech === tech
                    ? 'border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg-color)] font-bold'
                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)]'
                }`}
              >
                {tech === 'ALL' ? (lang === 'id' ? 'SEMUA' : 'ALL') : tech}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              placeholder={lang === 'id' ? "Cari judul atau teknologi... [/]" : "Search title or tech stack... [/]"}
              className="pl-9 pr-4 py-2 bg-[var(--paper-color)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-red)] w-full md:w-72"
            />
          </div>

        </div>

        {/* Project Count Status */}
        <div className="text-xs text-[var(--text-muted)] mb-6 font-mono flex items-center justify-between">
          <span>
            {lang === 'id' ? (
              <>Menampilkan <strong className="text-[var(--text-main)]">{filteredProjects.length}</strong> dari <strong className="text-[var(--text-main)]">{projects.length}</strong> sistem</>
            ) : (
              <>Showing <strong className="text-[var(--text-main)]">{filteredProjects.length}</strong> of <strong className="text-[var(--text-main)]">{projects.length}</strong> systems</>
            )}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">
            {lang === 'id' ? '[ TEKAN INFO UNTUK DETAIL LENGKAP ]' : '[ CLICK INFO FOR FULL DETAILS ]'}
          </span>
        </div>

        {/* PROJECTS GALLERY GRID - Equal Height with Aligned Footers */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                onClick={() => setFocusedCardIdx(idx)}
                className={`h-full transition-all duration-200 rounded-xs ${
                  focusedCardIdx === idx
                    ? 'ring-2 ring-[var(--accent-red)] ring-offset-2 ring-offset-[var(--bg-color)] shadow-lg'
                    : ''
                }`}
              >
                <OmoriPhotoCard
                  project={project}
                  index={idx}
                  isBlackSpace={isBlackSpace}
                  layout="grid"
                  isSelected={focusedCardIdx === idx}
                  onOpenDetails={() => {
                    sound.playSelect();
                    setDetailProject(project);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[var(--border-color)] p-10 bg-[var(--paper-color)] text-center my-8">
            <p className="text-sm text-[var(--text-muted)] font-mono">
              {lang === 'id'
                ? '[ TIDAK ADA PROYEK YANG COCOK DENGAN PENCARIAN ]'
                : '[ NO PROJECTS MATCHING SEARCH CRITERIA ]'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTech('ALL');
              }}
              className="mt-4 px-3 py-1.5 border border-[var(--border-color)] text-xs text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)]"
            >
              {lang === 'id' ? '[ RESET FILTER ]' : '[ RESET FILTERS ]'}
            </button>
          </div>
        )}

      </main>

      {/* Bottom-Right Keyboard Controls HUD (PC/Desktop Only) */}
      <KeyboardHud lang={lang}>
        <span>
          <kbd className="font-bold text-[var(--accent-red)]">[ESC / B]</kbd> {lang === 'id' ? 'Kembali' : 'Back'} <span className="opacity-40">|</span>{' '}
          <kbd className="font-bold text-[var(--accent-red)]">[W/S/A/D / Panah]</kbd> {lang === 'id' ? 'Pilih' : 'Select'} <span className="opacity-40">|</span>{' '}
          <kbd className="font-bold text-[var(--accent-red)]">[ENTER / I]</kbd> {lang === 'id' ? 'Buka Info' : 'Open Info'} <span className="opacity-40">|</span>{' '}
          <kbd className="font-bold text-[var(--accent-red)]">[/]</kbd> {lang === 'id' ? 'Cari' : 'Search'}
        </span>
      </KeyboardHud>

      {/* Reusable OMORI DIALOGUE-BOX DETAIL & GALLERY MODAL */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          isBlackSpace={isBlackSpace}
        />
      )}

    </div>
  );
};
