import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { ProjectItem } from '../types';
import { PlaceholderIcon } from './PlaceholderIcon';
import { OmoriMarkerScribble } from './OmoriMarkerScribble';
import { sound } from '../utils/audio';
import { useLanguage } from '../utils/languageContext';
import {
  getLocalizedText,
  getProjectShortDescription,
  getProjectCategoryLabel,
} from '../utils/projectHelpers';
import { urlFor } from '../sanity/client';

interface OmoriPhotoCardProps {
  project: ProjectItem;
  index: number;
  isBlackSpace?: boolean;
  layout?: 'slider' | 'grid';
  onOpenDetails?: () => void;
  isSelected?: boolean;
}

export const OmoriPhotoCard: React.FC<OmoriPhotoCardProps> = ({
  project,
  index,
  isBlackSpace = false,
  layout = 'slider',
  onOpenDetails,
  isSelected = false,
}) => {
  const { lang } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Resolve localized texts
  const title = getLocalizedText(project.title, lang);
  const shortDesc = getProjectShortDescription(project, lang, layout === 'slider' ? 140 : 110);
  const categoryLabel = getProjectCategoryLabel(project.category, lang);

  // Resolve primary image URL without fixed height so Sanity never crops native aspect ratio (1:1, 16:9, etc.)
  let resolvedImageUrl: string | null = null;
  if (!imageError) {
    if (project.coverImage && (project.coverImage.asset || project.coverImage._type)) {
      try {
        resolvedImageUrl = urlFor(project.coverImage).width(1200).fit('max').auto('format').url();
      } catch {
        resolvedImageUrl = null;
      }
    } else if (project.imageUrl) {
      resolvedImageUrl = project.imageUrl;
    }
  }

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

  const hasMultipleRepos = Boolean(repoWebUrl && repoMobileUrl);

  // Basil's photo album scrapbook tilt: tilted at rest, straightens & lifts smoothly on hover
  const tiltAngles = [
    '-rotate-2',
    'rotate-2',
    '-rotate-1',
    'rotate-1',
  ];
  const restingTilt = tiltAngles[index % tiltAngles.length];

  // ---------------------------------------------------------------------------
  // SLIDER LAYOUT (For Landing Page) - Balanced 2-column on desktop (No Info popup here)
  // ---------------------------------------------------------------------------
  if (layout === 'slider') {
    return (
      <div
        onMouseEnter={() => sound.playTextBlip()}
        className="group omori-card p-4 sm:p-5 h-[370px] sm:h-[315px] flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between select-none hover:!translate-y-0 hover:!transform-none"
      >
        {/* Left Side: Cohesive Basil Album Polaroid (One physical unit with photo, tilts at rest, straightens on hover or when selected) */}
        <div
          className={`w-full sm:w-[245px] md:w-[265px] shrink-0 h-[145px] sm:h-full bg-[#fbfbfa] dark:bg-[#16161d] border-2 border-[var(--border-color)] p-2 pb-2.5 flex flex-col justify-between relative shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.6)] ${
            isSelected ? 'rotate-0 scale-[1.03] shadow-[0_8px_24px_rgba(0,0,0,0.25)]' : restingTilt
          } group-hover:rotate-0 group-hover:scale-[1.03] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer`}
        >
          {/* Scrapbook photo tape accent on top corner */}
          <div className="absolute -top-1.5 left-5 w-8 h-2.5 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-6 pointer-events-none z-20" />

          {/* Inner Photo Frame: Pure aspect-contain letterbox with black background (never cropped) */}
          <div className="relative w-full h-full overflow-hidden bg-[#09090d] border border-black/30 dark:border-white/20 flex items-center justify-center">
            {resolvedImageUrl ? (
              <img
                src={resolvedImageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain ${
                  isBlackSpace ? 'grayscale contrast-135 brightness-75' : ''
                }`}
              />
            ) : (
              /* Nostalgic Basil Notebook Sketch for unphotographed memory */
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-2 text-center ${
                  isBlackSpace ? 'bg-[#090408] text-[#5e3843]' : 'bg-[#15151b] text-[var(--text-muted)]'
                }`}
              >
                <svg
                  viewBox="0 0 64 48"
                  className="w-10 h-8 mb-1 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="8" width="52" height="32" rx="2" strokeDasharray="3 2" />
                  <circle cx="32" cy="24" r="8" strokeWidth="1.5" />
                  <circle cx="32" cy="24" r="3" fill="currentColor" opacity="0.4" />
                  <path d="M 46,14 L 50,14" strokeWidth="2" />
                </svg>
                <span className="text-[9px] font-mono tracking-wider opacity-75">
                  {isBlackSpace ? '[ CORRUPTED ]' : (lang === 'id' ? '[ CETAKAN BELUM ADA ]' : '[ PHOTO NOT YET TAKEN ]')}
                </span>
              </div>
            )}

            {/* Black Space Natural Marker Scribble Overlay */}
            {isBlackSpace && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <OmoriMarkerScribble
                  variant={index}
                  size="cover"
                  className="opacity-95 scale-110"
                />
              </div>
            )}
          </div>

          {/* Basil Hand-Scrawled Marker Polaroid Caption: Left = Location, Right = Year */}
          <div className="mt-1 flex items-center justify-between px-1">
            <span className="font-handwriting font-bold text-[#202028] dark:text-[#d6d6e2] text-base sm:text-lg leading-none">
              {isBlackSpace ? '???' : (project.location || 'Jember, ID')}
            </span>
            <span className="font-handwriting font-medium text-xs sm:text-sm text-[#484856] dark:text-[#a8a8b6] leading-none">
              {project.date || project.year || '2024'}
            </span>
          </div>
        </div>

        {/* Right Side: Clean Project Details (NO redundant year at top right) */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Header: ONLY Category Tag */}
            <div className="flex items-center text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
              <span className="text-[var(--accent-red)] font-bold text-xs uppercase tracking-wide">
                {isBlackSpace ? '[ ANOMALY ]' : categoryLabel}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] mb-1.5 leading-snug truncate sm:whitespace-normal">
              {title}
            </h3>

            <p className="text-xs text-[var(--text-main)]/85 leading-relaxed font-sans line-clamp-2 sm:line-clamp-3 mb-3">
              {shortDesc}
            </p>
          </div>

          {/* Footer: Tech Stack & Actions Aligned to Bottom */}
          <div className="pt-2.5 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {project.techStack?.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-main)] bg-[var(--bg-color)] flex items-center gap-1"
                >
                  <PlaceholderIcon name={tech.toLowerCase()} size={10} />
                  <span>{tech}</span>
                </span>
              ))}
            </div>

            {/* Action Buttons: Multi-Repo & Demo */}
            <div className="flex flex-wrap items-center gap-1.5 ml-auto">
              {repoWebUrl && (
                <a
                  href={repoWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSelect()}
                  className="px-2 py-1 border border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="View Web / Main Repository"
                >
                  <PlaceholderIcon name="git" size={10} />
                  <span>{hasMultipleRepos ? 'REPO (WEB)' : 'REPO'}</span>
                </a>
              )}

              {repoMobileUrl && (
                <a
                  href={repoMobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSelect()}
                  className="px-2 py-1 border border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="View Mobile App Repository"
                >
                  <PlaceholderIcon name="git" size={10} />
                  <span>REPO (APP)</span>
                </a>
              )}

              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSelect()}
                  className="px-2.5 py-1 border border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-color)] font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-[10px]"
                  title="Live Demo"
                >
                  <ExternalLink size={10} />
                  <span>DEMO</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // GRID LAYOUT (For Repository / Projects Page) - Perfect Horizontal Alignment with Info Modal
  // ---------------------------------------------------------------------------
  return (
    <div
      onMouseEnter={() => sound.playTextBlip()}
      className={`group omori-card p-4 h-full flex flex-col justify-between select-none hover:!translate-y-0 hover:!transform-none transition-colors duration-200 ${
        isSelected ? 'border-[var(--text-main)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.6)]' : ''
      }`}
    >
      <div>
        {/* Top Info Bar: Category only (Clean, NO camera badge or photo counter) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-2">
          <span className="text-[var(--accent-red)] font-bold text-xs uppercase tracking-wide">
            {isBlackSpace ? '[ ANOMALY ]' : categoryLabel}
          </span>
        </div>

        {/* Basil Album Photo Frame: 1 cohesive physical unit with photo, smooth tilt hover animation or straightened when selected */}
        <div
          onClick={() => {
            if (onOpenDetails) {
              sound.playSelect();
              onOpenDetails();
            }
          }}
          className={`w-full aspect-[16/10] bg-[#fbfbfa] dark:bg-[#16161d] border-2 border-[var(--border-color)] p-1.5 pb-2 mb-3 flex flex-col justify-between relative shadow-[0_3px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.25)] dark:shadow-[0_5px_14px_rgba(0,0,0,0.55)] ${
            isSelected ? 'rotate-0 scale-[1.03] shadow-[0_8px_22px_rgba(0,0,0,0.25)]' : restingTilt
          } group-hover:rotate-0 group-hover:scale-[1.03] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer`}
          title={onOpenDetails ? (lang === 'id' ? 'Klik foto untuk melihat galeri & detail' : 'Click photo to view gallery & details') : undefined}
        >
          {/* Photo tape accent */}
          <div className="absolute -top-1.5 left-4 w-7 h-2 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-6 pointer-events-none z-20" />

          {/* Inner Photo Frame: Pure aspect-contain letterbox with black background (never cropped) */}
          <div className="relative w-full h-full overflow-hidden bg-[#09090d] border border-black/30 dark:border-white/20 flex items-center justify-center">
            {resolvedImageUrl ? (
              <img
                src={resolvedImageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain ${
                  isBlackSpace ? 'grayscale contrast-135 brightness-75' : ''
                }`}
              />
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-2 text-center ${
                  isBlackSpace ? 'bg-[#090408] text-[#5e3843]' : 'bg-[#15151b] text-[var(--text-muted)]'
                }`}
              >
                <svg
                  viewBox="0 0 64 48"
                  className="w-9 h-7 mb-1 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="8" width="52" height="32" rx="2" strokeDasharray="3 2" />
                  <circle cx="32" cy="24" r="8" strokeWidth="1.5" />
                  <circle cx="32" cy="24" r="3" fill="currentColor" opacity="0.4" />
                  <path d="M 46,14 L 50,14" strokeWidth="2" />
                </svg>
                <span className="text-[8.5px] font-mono tracking-wider opacity-75">
                  {isBlackSpace ? '[ CORRUPTED ]' : (lang === 'id' ? '[ CETAKAN BELUM ADA ]' : '[ PHOTO NOT YET TAKEN ]')}
                </span>
              </div>
            )}

            {/* Black Space Natural Marker Scribble Overlay */}
            {isBlackSpace && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <OmoriMarkerScribble
                  variant={index}
                  size="cover"
                  className="opacity-95 scale-110"
                />
              </div>
            )}
          </div>

          {/* Handwritten Polaroid Chin Note: Left = Location, Right = Year */}
          <div className="mt-1 flex items-center justify-between px-1">
            <span className="font-handwriting font-bold text-[#202028] dark:text-[#d6d6e2] text-sm sm:text-base leading-none">
              {isBlackSpace ? '???' : (project.location || 'Jember, ID')}
            </span>
            <span className="font-handwriting font-medium text-xs text-[#484856] dark:text-[#a8a8b6] leading-none">
              {project.date || project.year || '2024'}
            </span>
          </div>
        </div>

        {/* Title with Fixed Min-Height */}
        <div className="min-h-[2.75rem] flex items-center mb-1">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)] leading-snug line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Short Description with Fixed Clamped Height */}
        <div className="h-[2.75rem] mb-3">
          <p className="text-xs text-[var(--text-main)]/85 leading-relaxed font-sans line-clamp-2">
            {shortDesc}
          </p>
        </div>

        {/* Tech Stack Pills with Fixed Min-Height */}
        <div className="min-h-[2rem] flex items-center flex-wrap gap-1 mb-3">
          {project.techStack?.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 border border-[var(--border-color)] text-[9px] font-mono text-[var(--text-main)] bg-[var(--bg-color)] flex items-center gap-1"
            >
              <PlaceholderIcon name={tech.toLowerCase()} size={9} />
              <span>{tech}</span>
            </span>
          ))}
        </div>
      </div>

      {/* FOOTER PINNED TO BOTTOM - Multi-Repo & Classic Clean [ INFO ] Trigger */}
      <div className="mt-auto pt-2.5 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {repoWebUrl && (
            <a
              href={repoWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playSelect()}
              className="px-2 py-1 border border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors flex items-center gap-1 text-[9.5px] font-mono font-bold"
              title="View Web / Main Repository"
            >
              <PlaceholderIcon name="git" size={10} />
              <span>{hasMultipleRepos ? 'REPO (WEB)' : 'REPO'}</span>
            </a>
          )}

          {repoMobileUrl && (
            <a
              href={repoMobileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playSelect()}
              className="px-2 py-1 border border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors flex items-center gap-1 text-[9.5px] font-mono font-bold"
              title="View Mobile App Repository"
            >
              <PlaceholderIcon name="git" size={10} />
              <span>REPO (APP)</span>
            </a>
          )}

          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playSelect()}
              className="px-2 py-1 border border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-color)] font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-[9.5px]"
              title="Live Demo"
            >
              <ExternalLink size={9.5} />
              <span>DEMO</span>
            </a>
          )}
        </div>

        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            onMouseEnter={() => sound.playTextBlip()}
            className="px-2 py-1 text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors ml-auto cursor-pointer"
            title="View Details"
          >
            [ INFO ]
          </button>
        )}
      </div>
    </div>
  );
};
