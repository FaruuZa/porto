import React, { useState, useEffect } from 'react';
import { PROJECTS_DATA } from '../data/projectsData';
import { PlaceholderIcon } from '../components/PlaceholderIcon';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { ArrowLeft, ExternalLink, Search, Volume2, VolumeX, Globe } from 'lucide-react';
import { RedactedText } from '../components/RedactedText';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { useLanguage } from '../utils/languageContext';

interface ProjectsPageProps {
  onBack: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onBack,
  theme,
  onToggleTheme,
}) => {
  const { lang, toggleLang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const isBlackSpace = theme === 'black-space';

  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    const unsubAudio = sound.subscribe((muted) => setIsMuted(muted));
    return () => {
      unsub();
      unsubAudio();
    };
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleThemeClick = () => {
    if (isBlackSpace) {
      if (!puzzleState.canWakeUp) {
        sound.playLampuKedipSFX();
        return;
      }
    }
    sound.playSelect();
    onToggleTheme();
  };

  const categories = ['ALL', 'Full-Stack Ecosystem', 'Web & Mobile App', 'Desktop POS Application', 'System Architecture'];

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const matchesCategory = selectedCategory === 'ALL' || project.category === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] font-mono transition-colors duration-500">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-color)] border-b border-[var(--border-color)] transition-colors select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs">
          
          {/* Back Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onBack();
            }}
            onMouseEnter={() => sound.playTextBlip()}
            className="flex items-center gap-2 px-3 py-1.5 sketch-border hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-all cursor-pointer font-bold"
          >
            <ArrowLeft size={14} />
            <span>{lang === 'id' ? '[ KEMBALI KE BERANDA ]' : '[ BACK TO HOME ]'}</span>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Toggle */}
            <button
              onClick={() => {
                sound.playSelect();
                toggleLang();
              }}
              onMouseEnter={() => sound.playTextBlip()}
              className="px-2 py-1 sketch-border font-bold text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)] transition-all flex items-center gap-1 cursor-pointer"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe size={12} />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Unified Audio Toggle */}
            <button
              onClick={handleToggleSound}
              onMouseEnter={() => sound.playTextBlip()}
              className={`px-2.5 py-1 sketch-border font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                !isMuted
                  ? 'bg-[var(--paper-color)] text-[var(--accent-red)] border-[var(--accent-red)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--paper-color)]'
              }`}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span className="hidden sm:inline">{isMuted ? 'MUTE' : 'SOUND'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeClick}
              onMouseEnter={() => sound.playTextBlip()}
              className={`px-2.5 py-1 sketch-border text-[11px] transition-all cursor-pointer ${
                isBlackSpace
                  ? puzzleState.canWakeUp
                    ? 'bg-red-950 border-red-500 text-red-200 font-bold'
                    : 'bg-[var(--paper-color)] text-red-700 border-red-900 cursor-not-allowed opacity-80'
                  : 'text-[var(--text-main)] hover:bg-[var(--paper-color)]'
              }`}
            >
              {isBlackSpace
                ? puzzleState.canWakeUp
                  ? '[ WAKE UP ]'
                  : '[ ??? ]'
                : theme === 'light'
                ? '[ DARK ]'
                : '[ WHITE ]'}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
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
                <span className="line-through decoration-[#8b0000] text-[#fca5a5]/60 mr-2">
                  {lang === 'id' ? 'Arsip Lengkap' : 'Complete Archive'}
                </span>
                <span className="text-[#ff0033]">
                  {lang === 'id' ? 'Repositori Terdistorsi' : 'Corrupted Repositories'}
                </span>
              </>
            ) : (
              lang === 'id' ? 'Arsip Lengkap Portofolio Rekayasa Perangkat Lunak' : 'Software Systems Complete Archive'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-sans max-w-2xl">
            {isBlackSpace ? (
              <span className="text-[#fca5a5]/80 italic">
                {lang === 'id'
                  ? '"Repositori kode terdistorsi oleh Black Space. Temukan anomali tersembunyi."'
                  : '"Codebases distorted by the Black Space anomaly. Find the missing fragment hidden among the repositories."'}
              </span>
            ) : (
              lang === 'id'
                ? 'Koleksi lengkap platform ERP klinik terintegrasi, platform pemesanan multi-channel, dan driver kasir barcode desktop.'
                : 'Complete collection of clinical ERP platforms, retail order systems, and desktop inventory drivers.'
            )}
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playTextBlip();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 text-xs sketch-border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--text-main)] text-[var(--bg-color)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--paper-color)]'
                }`}
              >
                {cat === 'ALL' ? (lang === 'id' ? 'SEMUA' : 'ALL') : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'id' ? "Cari teknologi atau nama sistem..." : "Search by technology or system name..."}
              className="pl-9 pr-4 py-2 bg-[var(--paper-color)] sketch-border text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-red)] w-full md:w-72"
            />
          </div>

        </div>

        {/* Project Count Status */}
        <div className="text-xs text-[var(--text-muted)] mb-6">
          {lang === 'id' ? (
            <>Menampilkan <strong className="text-[var(--text-main)]">{filteredProjects.length}</strong> dari <strong className="text-[var(--text-main)]">{PROJECTS_DATA.length}</strong> sistem</>
          ) : (
            <>Showing <strong className="text-[var(--text-main)]">{filteredProjects.length}</strong> of <strong className="text-[var(--text-main)]">{PROJECTS_DATA.length}</strong> systems</>
          )}
        </div>

        {/* Projects Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, idx) => {
            const isAnomalyTarget =
              isBlackSpace && idx === puzzleState.spawnLocations.projectCardIndex;

            return (
              <div
                key={project.id}
                onMouseEnter={() => sound.playTextBlip()}
                className="sketch-border p-6 bg-[var(--paper-color)] hover:border-[var(--text-main)] transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Header info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--accent-red)]">
                        [ {isBlackSpace ? 'ANOMALY' : project.category.toUpperCase()} ]
                      </span>
                      {project.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800">
                          {isBlackSpace ? '???' : project.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      #0{idx + 1} {project.year ? `• ${project.year}` : ''}
                    </span>
                  </div>

                  {/* Title & Flavor quote */}
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-1">
                    {isBlackSpace && idx === 1 ? (
                      <span className="line-through decoration-[#8b0000] text-[#fca5a5]/70 mr-1">{project.title}</span>
                    ) : (
                      project.title
                    )}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] italic mb-4">
                    {project.quote}
                  </p>

                  {/* Description or Anomaly Target */}
                  <div className="text-xs sm:text-sm text-[var(--text-main)]/90 font-sans leading-relaxed mb-6">
                    {isAnomalyTarget ? (
                      <div className="p-3 sketch-border bg-red-950/20 my-2">
                        <RedactedText
                          theme={theme}
                          anomalyId="anomaly-project-page"
                          originalText="A dark presence lurks inside the project build cache."
                          corruptedText="GIT_COMMIT_ANOMALY_#03"
                        />
                      </div>
                    ) : (
                      <p>{project.description}</p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-1.5 mb-6">
                    <div className="text-[10px] text-[var(--accent-red)] uppercase font-bold tracking-wider mb-2">
                      &gt; {lang === 'id' ? 'FITUR UTAMA SISTEM' : 'KEY SYSTEM CAPABILITIES'}
                    </div>
                    {project.features.map((feat, fIdx) => (
                      <div key={fIdx} className="text-xs flex items-start gap-2">
                        <span className="text-[var(--accent-red)] font-bold">»</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-[var(--border-color)] text-center text-[10px] font-mono mb-6">
                    {project.stats.map((stat, sIdx) => (
                      <div key={sIdx} className="bg-[var(--bg-color)]/60 p-2 sketch-border">
                        <div className="text-[var(--text-muted)]">{stat.label}</div>
                        <div className="font-bold text-[var(--text-main)] mt-0.5 truncate">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack & Links Footer */}
                <div className="pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        onMouseEnter={() => sound.playTextBlip()}
                        className="px-2 py-0.5 text-[10px] sketch-border hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-all flex items-center gap-1"
                      >
                        <PlaceholderIcon name={tech.toLowerCase()} size={11} />
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {project.links?.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playSelect()}
                        className="p-1.5 sketch-border hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors flex items-center gap-1 text-xs"
                      >
                        <PlaceholderIcon name="git" size={12} />
                        <span>REPO</span>
                      </a>
                    )}
                    {project.links?.demo && (
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playSelect()}
                        className="px-3 py-1.5 sketch-border bg-[var(--text-main)] text-[var(--bg-color)] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-xs"
                      >
                        <ExternalLink size={12} />
                        <span>DEMO</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

    </div>
  );
};
