import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { ProjectItem } from '../types';
import { sound } from '../utils/audio';
import { useLanguage } from '../utils/languageContext';
import { getLocalizedText } from '../utils/projectHelpers';
import { urlFor } from '../sanity/client';
import { PlaceholderIcon } from './PlaceholderIcon';
import { OmoriMarkerScribble } from './OmoriMarkerScribble';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  isBlackSpace?: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  isBlackSpace = false,
}) => {
  const { lang } = useLanguage();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Reset to first photo whenever a different project is opened
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [project?.id]);

  // Memoize photo list to prevent expensive re-parsing on every state update or thumbnail hover
  const photoList = useMemo<Array<{ url: string; thumbUrl: string; caption?: string }>>(() => {
    if (!project) return [];
    const list: Array<{ url: string; thumbUrl: string; caption?: string }> = [];

    // 1. Cover Image
    if (project.coverImage && (project.coverImage.asset || project.coverImage._type || project.coverImage._ref)) {
      try {
        const coverUrl = urlFor(project.coverImage).width(1600).fit('max').auto('format').url();
        const coverThumb = urlFor(project.coverImage).width(160).height(100).fit('crop').auto('format').url();
        if (coverUrl) {
          list.push({
            url: coverUrl,
            thumbUrl: coverThumb || coverUrl,
            caption: project.coverImage.alt || (lang === 'id' ? 'Foto Utama' : 'Main Cover'),
          });
        }
      } catch (e) {
        console.warn('Cover image URL generation error:', e);
      }
    } else if (project.imageUrl) {
      list.push({
        url: project.imageUrl,
        thumbUrl: project.imageUrl,
        caption: lang === 'id' ? 'Foto Utama' : 'Main Cover',
      });
    }

    // 2. Gallery Images
    if (Array.isArray(project.gallery)) {
      project.gallery.forEach((item, idx) => {
        if (item && (item.asset || item._type || item._ref)) {
          try {
            const galUrl = urlFor(item).width(1600).fit('max').auto('format').url();
            const galThumb = urlFor(item).width(160).height(100).fit('crop').auto('format').url();
            if (galUrl) {
              list.push({
                url: galUrl,
                thumbUrl: galThumb || galUrl,
                caption: item.caption || item.alt || `Screenshot ${idx + 2}`,
              });
            }
          } catch (e) {
            console.warn('Gallery image URL error:', e);
          }
        }
      });
    }

    return list;
  }, [project, lang]);

  // Safe active photo calculation (never out-of-bounds, never null)
  const safeIdx = photoList.length > 0
    ? Math.min(Math.max(0, activePhotoIdx), photoList.length - 1)
    : 0;
  const currentPhoto = photoList.length > 0 ? photoList[safeIdx] : null;

  // Background preload of adjacent images for instant zero-lag photo flipping
  useEffect(() => {
    if (photoList.length <= 1) return;
    const nextIdx = (safeIdx + 1) % photoList.length;
    const prevIdx = (safeIdx - 1 + photoList.length) % photoList.length;
    const preloadNext = new Image();
    preloadNext.src = photoList[nextIdx].url;
    const preloadPrev = new Image();
    preloadPrev.src = photoList[prevIdx].url;
  }, [safeIdx, photoList]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSelect();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSelect();
    setActivePhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for photo carousel (Always called in unconditional hook order)
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && photoList.length > 1) {
        sound.playSelect();
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
      } else if (e.key === 'ArrowRight' && photoList.length > 1) {
        sound.playSelect();
        setActivePhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        sound.playSelect();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, photoList.length, onClose]);

  // Early return ONLY after all hooks are evaluated
  if (!project) return null;

  // External URLs
  const demoUrl = project.links?.demo && project.links.demo.trim() !== '#' && project.links.demo.trim().length > 0
    ? project.links.demo.trim()
    : null;

  const repoWebUrl = (project.links?.repo || project.links?.github) &&
    (project.links.repo || project.links.github)!.trim() !== '#' &&
    (project.links.repo || project.links.github)!.trim().length > 0
    ? (project.links.repo || project.links.github)!.trim()
    : null;

  const repoMobileUrl = project.links?.repoMobile &&
    project.links.repoMobile.trim() !== '#' &&
    project.links.repoMobile.trim().length > 0
    ? project.links.repoMobile.trim()
    : null;

  const repoApiUrl = project.links?.repoApi &&
    project.links.repoApi.trim() !== '#' &&
    project.links.repoApi.trim().length > 0
    ? project.links.repoApi.trim()
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-text"
      onClick={() => {
        sound.playSelect();
        onClose();
      }}
    >
      <div
        className={`omori-box max-w-2xl w-full p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto ${
          isBlackSpace ? 'border-[#6b1b28]' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playSelect();
            onClose();
          }}
          onMouseEnter={() => sound.playTextBlip()}
          className="absolute top-4 right-4 p-1.5 border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-all cursor-pointer z-20"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-[var(--accent-red)] font-bold tracking-wider font-mono uppercase">
            {isBlackSpace ? 'CORRUPTED SYSTEM ENTRY' : 'SYSTEM ARCHIVE ENTRY'}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            • {project.date || project.year || '2024'}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-3 leading-snug pr-8">
          {getLocalizedText(project.title, lang)}
        </h2>

        {/* Interactive Photo Carousel Showcase */}
        {photoList.length > 0 && currentPhoto ? (
          <div className="mb-4">
            {/* Main Active Photo Frame with pure black letterbox (never cropped or distorted) */}
            <div className="relative w-full aspect-[16/10] border-2 border-[var(--border-color)] overflow-hidden bg-[#09090d] rounded-xs flex items-center justify-center group select-none">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption || 'Project visual'}
                loading="eager"
                decoding="async"
                className={`w-full h-full object-contain ${
                  isBlackSpace ? 'grayscale contrast-135 brightness-75' : ''
                }`}
              />

              {/* Prev / Next Controls (if more than 1 photo) */}
              {photoList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    onMouseEnter={() => sound.playTextBlip()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/85 text-white border border-white/20 hover:bg-white hover:text-black transition-all cursor-pointer z-10"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    onMouseEnter={() => sound.playTextBlip()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/85 text-white border border-white/20 hover:bg-white hover:text-black transition-all cursor-pointer z-10"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Photo Counter */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/85 text-white font-mono text-[10px] border border-white/20 z-10">
                    [ {safeIdx + 1} / {photoList.length} ]
                  </div>
                </>
              )}

              {/* Black Space Distortion Overlay */}
              {isBlackSpace && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <OmoriMarkerScribble variant={0} size="cover" className="opacity-95 scale-125" />
                </div>
              )}
            </div>

            {/* Photo Caption & Mini Thumbnail Strip */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[var(--text-muted)] italic truncate">
                {currentPhoto.caption ? `"${currentPhoto.caption}"` : ''}
              </span>

              {photoList.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {photoList.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        sound.playTextBlip();
                        setActivePhotoIdx(i);
                      }}
                      className={`w-9 h-6 border transition-all overflow-hidden shrink-0 cursor-pointer ${
                        safeIdx === i
                          ? 'border-[var(--accent-red)] scale-110 shadow-xs'
                          : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                      }`}
                      title={photo.caption || `Photo ${i + 1}`}
                    >
                      <img
                        src={photo.thumbUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[16/9] mb-4 border-2 border-[var(--border-color)] bg-[#101015] flex flex-col items-center justify-center text-center p-4">
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {isBlackSpace ? '[ CORRUPTED MEMORY ]' : (lang === 'id' ? '[ BELUM ADA CETAKAN FOTO ]' : '[ NO PREVIEW IMAGES ]')}
            </span>
          </div>
        )}

        {/* Full Description */}
        <div className="font-sans text-xs sm:text-sm text-[var(--text-main)]/90 leading-relaxed space-y-2 mb-5">
          <p>{getLocalizedText(project.description, lang)}</p>
        </div>

        {/* Tech Stack List */}
        {Array.isArray(project.techStack) && project.techStack.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-color)] mb-4">
            <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">
              {lang === 'id' ? 'TEKNOLOGI & ARSITEKTUR:' : 'TECH & ARCHITECTURE:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-main)] flex items-center gap-1"
                >
                  <PlaceholderIcon name={tech.toLowerCase()} size={10} />
                  <span>{tech}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Links: Multi-Repo & Demo */}
        <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {repoWebUrl && (
              <a
                href={repoWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSelect()}
                className="px-3 py-1.5 border border-[var(--border-color)] text-xs font-mono font-bold hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] flex items-center gap-1.5 transition-colors"
              >
                <PlaceholderIcon name="git" size={12} />
                <span>{repoMobileUrl ? 'GITHUB (WEB)' : 'GITHUB REPO'}</span>
              </a>
            )}

            {repoMobileUrl && (
              <a
                href={repoMobileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSelect()}
                className="px-3 py-1.5 border border-[var(--border-color)] text-xs font-mono font-bold hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] flex items-center gap-1.5 transition-colors"
              >
                <PlaceholderIcon name="git" size={12} />
                <span>GITHUB (MOBILE APP)</span>
              </a>
            )}

            {repoApiUrl && (
              <a
                href={repoApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSelect()}
                className="px-3 py-1.5 border border-[var(--border-color)] text-xs font-mono font-bold hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] flex items-center gap-1.5 transition-colors"
              >
                <PlaceholderIcon name="git" size={12} />
                <span>BACKEND / API REPO</span>
              </a>
            )}

            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSelect()}
                className="px-3.5 py-1.5 border border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-color)] text-xs font-mono font-bold hover:opacity-90 flex items-center gap-1.5 transition-opacity"
              >
                <ExternalLink size={12} />
                <span>LIVE DEMO</span>
              </a>
            )}
          </div>

          <button
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            className="px-3 py-1.5 border border-[var(--border-color)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer ml-auto"
          >
            {lang === 'id' ? '[ TUTUP ]' : '[ CLOSE ]'}
          </button>
        </div>
      </div>
    </div>
  );
};
