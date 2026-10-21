import type { DateField, Photo, PhotoFilters } from './types';

export const DEFAULT_FILTERS: PhotoFilters = { tags: [], from: '', to: '', sort: 'newest', dateField: 'taken' };

/** Normalises free-text tags: trimmed, lowercase, de-duplicated, no commas. */
export function parseTags(input: string): string[] {
  return [...new Set(input.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export function collectTags(photos: readonly Photo[]): string[] {
  return [...new Set(photos.flatMap((p) => p.tags))].sort();
}

/** Upload timestamp as YYYY-MM-DD in the viewer's time zone, to match the date pickers. */
export const localDate = (iso: string) => new Date(iso).toLocaleDateString('en-CA');

/** The calendar day (YYYY-MM-DD) for the chosen date field. */
export const photoDay = (p: Photo, field: DateField) => (field === 'taken' ? p.takenAt : localDate(p.uploadedAt));

/** Sort key: taken date with upload time as tie-break, or the upload time alone. */
const sortKey = (p: Photo, field: DateField) => (field === 'taken' ? `${p.takenAt} ${p.uploadedAt}` : p.uploadedAt);

/** A photo matches when it has every selected tag and its chosen date is within the range. */
export function filterPhotos(photos: readonly Photo[], { tags, from, to, sort, dateField }: PhotoFilters): Photo[] {
  const result = photos.filter((p) => {
    const day = photoDay(p, dateField);
    return tags.every((t) => p.tags.includes(t)) && (!from || day >= from) && (!to || day <= to);
  });
  // ISO dates and timestamps compare correctly as strings.
  switch (sort) {
    case 'newest':
      return result.sort((a, b) => sortKey(b, dateField).localeCompare(sortKey(a, dateField)));
    case 'oldest':
      return result.sort((a, b) => sortKey(a, dateField).localeCompare(sortKey(b, dateField)));
    case 'title':
      return result.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  }
}

export interface PhotoGroup {
  label: string;
  photos: Photo[];
}

/** Groups already-sorted photos by month of the chosen date, like Google Photos. Title sort is one group. */
export function groupByMonth(
  photos: readonly Photo[],
  { sort, dateField }: Pick<PhotoFilters, 'sort' | 'dateField'>,
): PhotoGroup[] {
  if (sort === 'title') return photos.length ? [{ label: 'All photos', photos: [...photos] }] : [];
  // Format the 1st of the month at UTC midnight, in UTC, so no time zone shifts it into another month.
  const format = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const groups: PhotoGroup[] = [];
  for (const photo of photos) {
    const label = format.format(new Date(`${photoDay(photo, dateField).slice(0, 7)}-01T00:00:00Z`));
    const last = groups.at(-1);
    if (last?.label === label) last.photos.push(photo);
    else groups.push({ label, photos: [photo] });
  }
  return groups;
}
