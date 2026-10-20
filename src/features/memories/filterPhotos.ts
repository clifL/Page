import type { Photo, PhotoFilters } from './types';

export const DEFAULT_FILTERS: PhotoFilters = { tags: [], from: '', to: '', sort: 'newest' };

/** Normalises free-text tags: trimmed, lowercase, de-duplicated. */
export function parseTags(input: string): string[] {
  return [...new Set(input.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export function collectTags(photos: readonly Photo[]): string[] {
  return [...new Set(photos.flatMap((p) => p.tags))].sort();
}

/** A photo matches when it has every selected tag and falls within the date range. */
export function filterPhotos(photos: readonly Photo[], { tags, from, to, sort }: PhotoFilters): Photo[] {
  const result = photos.filter(
    (p) =>
      tags.every((t) => p.tags.includes(t)) &&
      (!from || p.takenAt >= from) &&
      (!to || p.takenAt <= to),
  );
  // ISO dates compare correctly as strings; uploadedAt breaks ties within the same day.
  const byDate = (a: Photo, b: Photo) =>
    a.takenAt.localeCompare(b.takenAt) || a.uploadedAt.localeCompare(b.uploadedAt);
  switch (sort) {
    case 'newest':
      return result.sort((a, b) => byDate(b, a));
    case 'oldest':
      return result.sort(byDate);
    case 'title':
      return result.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  }
}

export interface PhotoGroup {
  label: string;
  photos: Photo[];
}

/** Groups already-sorted photos by month, like Google Photos. Title sort is shown as one group. */
export function groupByMonth(photos: readonly Photo[], sort: PhotoFilters['sort']): PhotoGroup[] {
  if (sort === 'title') return photos.length ? [{ label: 'All photos', photos: [...photos] }] : [];
  const format = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const groups: PhotoGroup[] = [];
  for (const photo of photos) {
    const label = format.format(new Date(`${photo.takenAt.slice(0, 7)}-01T00:00:00Z`));
    const last = groups.at(-1);
    if (last?.label === label) last.photos.push(photo);
    else groups.push({ label, photos: [photo] });
  }
  return groups;
}
