import { LocalizedText } from '../types';

/**
 * Resolves a localized string or plain string according to current active language ('id' | 'en').
 */
export function getLocalizedText(
  field: LocalizedText | string | undefined | null,
  lang: 'id' | 'en'
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.id || field.en || '';
}

/**
 * Returns the short preview summary for a project card.
 * Uses shortDescription if provided, or automatically excerpts the full description cleanly.
 */
export function getProjectShortDescription(
  project: {
    shortDescription?: LocalizedText | string;
    description: LocalizedText | string;
  },
  lang: 'id' | 'en',
  maxLength: number = 135
): string {
  const short = getLocalizedText(project.shortDescription, lang);
  if (short && short.trim().length > 0) return short;

  const full = getLocalizedText(project.description, lang);
  if (!full) return '';
  if (full.length <= maxLength) return full;
  
  // Cut at last space before maxLength to avoid broken words
  const cut = full.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '...';
}

export const CATEGORY_PRESETS: Record<string, { en: string; id: string }> = {
  academic: { en: 'Academic Project', id: 'Tugas Kuliah' },
  personal: { en: 'Personal Experiment', id: 'Eksperimen Pribadi' },
  client: { en: 'Client Work', id: 'Proyek Klien' },
  opensource: { en: 'Open Source', id: 'Sumber Terbuka' },
  competition: { en: 'Competition Project', id: 'Proyek Lomba' },
};

/**
 * Returns a bilingual, polished category label for project cards.
 */
export function getProjectCategoryLabel(
  category: LocalizedText | string | undefined | null,
  lang: 'id' | 'en'
): string {
  if (!category) return lang === 'id' ? 'PROYEK' : 'PROJECT';
  if (typeof category === 'object') {
    return getLocalizedText(category, lang);
  }
  const key = category.toLowerCase().trim();
  if (CATEGORY_PRESETS[key]) {
    return CATEGORY_PRESETS[key][lang];
  }
  return category;
}

/**
 * Formats a date string into an authentic analog camera timestamp (e.g. '26 10 16).
 */
export function formatFilmTimestamp(dateStr?: string): string {
  if (!dateStr) return "'26 10 16";
  const trimmed = dateStr.trim();
  if (/^\d{4}$/.test(trimmed)) {
    return `'${trimmed.slice(2)} 10 16`;
  }
  const parts = trimmed.split(/[-./ ]/);
  if (parts.length >= 2 && parts[0].length === 4) {
    return `'${parts[0].slice(2)} ${parts[1].padStart(2, '0')}`;
  }
  return trimmed.startsWith("'") ? trimmed : `'${trimmed}`;
}
