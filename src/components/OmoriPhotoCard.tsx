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

const getBasilMemoryNote = (project?: ProjectItem | null, lang: 'id' | 'en' = 'id'): string => {
  if (!project) {
    return lang === 'id'
      ? 'Sebuah momen berharga yang tersimpan hangat di halaman album ini.'
      : 'A precious moment kept safe in this album page.';
  }

  if ((project as any)?.memoryNote) {
    return getLocalizedText((project as any).memoryNote, lang);
  }

  const id = (project.id || project.slug || '').toLowerCase();
  const rawTitle = (typeof project.title === 'string' ? project.title : project.title?.en || project.title?.id || '').toLowerCase();

  if (id.includes('qlinica') || rawTitle.includes('qlinica')) {
    return lang === 'id'
      ? 'Waktu itu kami menyinkronkan data presensi mobile dan antrean klinik sampai larut malam...'
      : 'We stayed up late that night getting real-time mobile attendance and clinical queues in sync...';
  }
  if (id.includes('rahmat') || id.includes('bakery') || rawTitle.includes('bakery')) {
    return lang === 'id'
      ? 'Teringat aroma hangat roti manis saat merapikan alur pemesanan dari web ke Android...'
      : 'Still remembering the smell of fresh bread while testing catalog orders from web to Android...';
  }
  if (id.includes('card-clash') || id.includes('inferior') || rawTitle.includes('card clash')) {
    return lang === 'id'
      ? 'Eksperimen strategi kartu seru di mana pemain yang terdesak justru membalikkan keadaan...'
      : 'A fun card battle idea where being on the back foot turns the whole tide around...';
  }
  if (id.includes('kitchen') || id.includes('pos') || rawTitle.includes('kitchenshell')) {
    return lang === 'id'
      ? 'Bunyi "beep" pemindai barcode pertama kali saat sukses mencatat transaksi ke kasir desktop...'
      : 'That first satisfying barcode beep when transactions clicked into the desktop checkout...';
  }
  if (id.includes('omori') || id.includes('white-space') || rawTitle.includes('white space') || rawTitle.includes('portfolio')) {
    return lang === 'id'
      ? 'Menata ruang hening White Space dengan lampu gantung dan synthesizer audio kenangan...'
      : 'Crafting the quiet White Space with the hanging lightbulb and nostalgic procedural audio...';
  }

  const desc = getProjectShortDescription(project, lang, 120);
  if (desc) {
    return lang === 'id'
      ? `Kenangan saat mengerjakan sistem ini: ${desc.toLowerCase().replace(/^\w/, (c) => c.toLowerCase())}`
      : `Memories of putting together this system: ${desc.toLowerCase().replace(/^\w/, (c) => c.toLowerCase())}`;
  }

  return lang === 'id'
    ? 'Sebuah momen berharga yang tersimpan hangat di halaman album ini.'
    : 'A precious moment kept safe in this album page.';
};

interface PolaroidBackSheetProps {
  project?: ProjectItem | null;
  title?: string;
  location?: string;
  date?: string;
  lang: 'id' | 'en';
  isBlackSpace?: boolean;
  compact?: boolean;
}

const PolaroidBackSheet: React.FC<PolaroidBackSheetProps> = ({
  project,
  title = '',
  location,
  date,
  lang,
  isBlackSpace = false,
  compact = false,
}) => {
  const shortTitle = (title || '').split('—')[0].trim().split(':')[0].trim();
  const memoryNote = getBasilMemoryNote(project, lang);

  return (
    <div className="relative w-full h-full bg-[#f4f2ea] dark:bg-[#181822] text-[#22222f] dark:text-[#e0e0ea] flex flex-col justify-between overflow-hidden select-none">
      {/* Authentic photo cardstock fine matte texture / paper grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Top Section: Peringatan Keamanan & Catatan Pabrik (Factory Technical Stamping) */}
      <div className="relative z-10 px-2.5 sm:px-3 pt-2 pb-1 border-b border-black/10 dark:border-white/10 flex items-center justify-between text-[7px] sm:text-[7.5px] font-mono tracking-widest text-black/50 dark:text-white/40 uppercase">
        <span className="truncate mr-2">
          {lang === 'id'
            ? '• INSTANT FILM • JANGAN LIPAT ATAU KUPAS'
            : '• INSTANT FILM • DO NOT BEND OR PEEL'}
        </span>
        <span className="shrink-0 font-bold opacity-75">
          {isBlackSpace ? 'EMULSION-VOID' : 'TYPE-B 600'}
        </span>
      </div>

      {/* Middle Section: Area Tulis (Handwritten Note in Basil / Owner pen ink) */}
      <div className="relative z-10 flex-1 px-3 sm:px-4 py-1.5 flex flex-col justify-center">
        {/* Subtle lined notebook / cardstock ruling guidelines */}
        <div className="relative pb-1.5 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center justify-between text-[7px] sm:text-[7.5px] font-mono tracking-wider text-black/45 dark:text-white/35 uppercase mb-1">
            <span>{lang === 'id' ? '[ CATATAN BASIL ]' : "[ BASIL'S MEMO ]"}</span>
            <span className="font-bold tracking-normal opacity-75 truncate max-w-[120px]">{shortTitle}</span>
          </div>
          <p
            className={`font-handwriting font-bold ${
              compact ? 'text-[13.5px] sm:text-[15px]' : 'text-[15px] sm:text-[17px]'
            } leading-snug text-[#1e1e2d] dark:text-[#f2f2fc] line-clamp-3`}
          >
            "{memoryNote}"
          </p>
        </div>

        {/* Location & Date with razor-sharp inline SVGs (no emojis) */}
        <div className="pt-1.5 flex items-center justify-between font-handwriting text-xs sm:text-sm text-[#3b3b4f] dark:text-[#b4b4c8]">
          <span className="flex items-center gap-1.5">
            {/* Inline sharp vector map pin in red */}
            <svg
              className="w-3.5 h-3.5 inline-block shrink-0 text-[#e11d48] dark:text-[#ff4455] drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span>{location || (isBlackSpace ? 'Faraway Town' : 'Jember, ID')}</span>
          </span>

          <span className="flex items-center gap-1.5">
            {/* Inline sharp vector calendar */}
            <svg
              className="w-3 h-3 inline-block shrink-0 opacity-60 text-current"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{date || '2024'}</span>
          </span>
        </div>
      </div>

      {/* Bottom Section: Bantalan Kimia (Reagent Chemical Pod / Developer Pouch) */}
      <div className="relative z-10 w-full bg-black/[0.05] dark:bg-black/45 border-t-2 border-black/15 dark:border-white/15 px-2.5 sm:px-3 py-1.5 flex flex-col gap-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
        {/* Embossed heat-seal crimp line */}
        <div className="w-full border-t border-dashed border-black/15 dark:border-white/15 mb-0.5" />
        <div className="flex items-center justify-between text-[6.5px] sm:text-[7.5px] font-mono tracking-wider text-black/50 dark:text-white/40 uppercase">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-black/40 dark:bg-white/40 inline-block" />
            <span>
              {lang === 'id'
                ? '▲ BANTALAN REAGEN KIMIA ▲'
                : '▲ CHEMICAL REAGENT POD ▲'}
            </span>
          </span>
          <span className="font-bold">
            {lang === 'id' ? 'JANGAN DITEKAN' : 'DO NOT PRESS'}
          </span>
        </div>
      </div>
    </div>
  );
};

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
        className="group omori-card p-4 sm:p-5 min-h-[420px] sm:min-h-0 sm:h-[315px] flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between select-none hover:!translate-y-0 hover:!transform-none"
      >
        {/* Left Side: Authentic Polaroid Asli / Instax Square (1:1.2 total paper, 1:1 square photo) */}
        {resolvedImageUrl ? (
          <div
            className={`w-[170px] sm:w-[225px] md:w-[235px] aspect-[1/1.2] shrink-0 mx-auto sm:mx-0 bg-[#fbfbfa] dark:bg-[#16161d] p-2 pb-2.5 border-2 border-[var(--border-color)] flex flex-col justify-between relative shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.6)] ${
              isSelected ? 'rotate-0 scale-[1.03] shadow-[0_8px_24px_rgba(0,0,0,0.25)]' : restingTilt
            } group-hover:rotate-0 group-hover:scale-[1.03] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer`}
          >
            {/* Scrapbook photo tape accent on top corner */}
            <div className="absolute -top-1.5 left-5 w-8 h-2.5 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-6 pointer-events-none z-20" />

            {/* Inner Photo Frame: 1:1 Kotak Sempurna */}
            <div className="relative w-full aspect-square overflow-hidden bg-[#09090d] border border-black/30 dark:border-white/20 flex items-center justify-center">
              <img
                src={resolvedImageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain ${
                  isBlackSpace ? 'grayscale contrast-135 brightness-75' : ''
                }`}
              />

              {/* Black Space Natural Marker Scribble Overlay (Only when photo exists) */}
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

            {/* Basil Hand-Scrawled Marker Polaroid Chin Caption */}
            <div className="flex-1 flex items-center justify-between px-1 pt-1">
              <span className="font-handwriting font-bold text-base sm:text-lg leading-none text-[#202028] dark:text-[#d6d6e2]">
                {isBlackSpace ? '???' : (project.location || 'Jember, ID')}
              </span>
              <span className="font-handwriting font-medium text-xs sm:text-sm leading-none text-[#484856] dark:text-[#a8a8b6]">
                {project.date || project.year || '2024'}
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`w-[170px] sm:w-[225px] md:w-[235px] aspect-[1/1.2] shrink-0 mx-auto sm:mx-0 border-2 border-[var(--border-color)] relative shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.6)] ${
              isSelected ? 'rotate-0 scale-[1.03] shadow-[0_8px_24px_rgba(0,0,0,0.25)]' : restingTilt
            } group-hover:rotate-0 group-hover:scale-[1.03] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer`}
          >
            {/* Scrapbook photo tape accent on top corner */}
            <div className="absolute -top-1.5 left-5 w-8 h-2.5 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-6 pointer-events-none z-20" />

            {/* Seamless single-sheet Polaroid Back */}
            <PolaroidBackSheet
              project={project}
              title={title}
              location={project.location}
              date={project.date || project.year}
              lang={lang}
              isBlackSpace={isBlackSpace}
            />
          </div>
        )}

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
        {resolvedImageUrl ? (
          <div
            onClick={() => {
              if (onOpenDetails) {
                sound.playSelect();
                onOpenDetails();
              }
            }}
            className={`w-full max-w-[205px] sm:max-w-[220px] mx-auto aspect-[1/1.2] bg-[#fbfbfa] dark:bg-[#16161d] p-2 pb-2.5 border-2 border-[var(--border-color)] mb-3 flex flex-col justify-between relative shadow-[0_3px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.25)] dark:shadow-[0_5px_14px_rgba(0,0,0,0.55)] ${
              isSelected ? 'rotate-0 scale-[1.03] shadow-[0_8px_22px_rgba(0,0,0,0.25)]' : restingTilt
            } group-hover:rotate-0 group-hover:scale-[1.03] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer`}
            title={onOpenDetails ? (lang === 'id' ? 'Klik foto untuk melihat galeri & detail' : 'Click photo to view gallery & details') : undefined}
          >
            {/* Photo tape accent */}
            <div className="absolute -top-1.5 left-4 w-7 h-2 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-6 pointer-events-none z-20" />

            {/* Inner Photo Frame: 1:1 Kotak Sempurna */}
            <div className="relative w-full aspect-square overflow-hidden bg-[#09090d] border border-black/30 dark:border-white/20 flex items-center justify-center">
              <img
                src={resolvedImageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain ${
                  isBlackSpace ? 'grayscale contrast-135 brightness-75' : ''
                }`}
              />

              {/* Black Space Natural Marker Scribble Overlay (Only when photo exists) */}
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
            <div className="flex-1 flex items-center justify-between px-1 pt-1">
              <span className="font-handwriting font-bold text-sm sm:text-base leading-none text-[#202028] dark:text-[#d6d6e2]">
                {isBlackSpace && resolvedImageUrl ? '???' : (project.location || 'Jember, ID')}
              </span>
              <span className="font-handwriting font-medium text-xs leading-none text-[#484856] dark:text-[#a8a8b6]">
                {project.date || project.year || '2024'}
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              if (onOpenDetails) {
                sound.playSelect();
                onOpenDetails();
              }
            }}
            className={`w-full max-w-[205px] sm:max-w-[220px] mx-auto aspect-[1/1.2] border-2 border-[var(--border-color)] mb-3 relative shadow-[0_3px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.25)] dark:shadow-[0_5px_14px_rgba(0,0,0,0.55)] ${
              isSelected ? 'rotate-0 scale-[1.03] shadow-[0_8px_22px_rgba(0,0,0,0.25)]' : restingTilt
            } group-hover:rotate-0 group-hover:scale-[1.03] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer`}
            title={onOpenDetails ? (lang === 'id' ? 'Klik untuk melihat detail' : 'Click to view details') : undefined}
          >
            {/* Photo tape accent */}
            <div className="absolute -top-1.5 left-4 w-7 h-2 bg-black/10 dark:bg-white/10 border-x border-black/20 -rotate-6 pointer-events-none z-20" />

            {/* Seamless single-sheet Polaroid Back */}
            <PolaroidBackSheet
              project={project}
              title={title}
              location={project.location}
              date={project.date || project.year}
              lang={lang}
              isBlackSpace={isBlackSpace}
              compact
            />
          </div>
        )}

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
