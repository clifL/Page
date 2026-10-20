import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, collectTags, filterPhotos, groupByMonth, parseTags } from './filterPhotos';
import type { Photo } from './types';

const photo = (id: string, takenAt: string, tags: string[], title = id): Photo => ({
  id,
  title,
  tags,
  takenAt,
  uploadedAt: `${takenAt}T00:00:00Z`,
  src: '',
});

const photos = [
  photo('a', '2026-01-10', ['travel', 'sea'], 'Beach'),
  photo('b', '2026-03-02', ['travel'], 'airport'),
  photo('c', '2025-12-25', ['family'], 'Christmas'),
];

describe('parseTags', () => {
  it('trims, lowercases and de-duplicates', () => {
    expect(parseTags(' Travel, sea ,travel,, ')).toEqual(['travel', 'sea']);
  });
});

describe('collectTags', () => {
  it('returns unique sorted tags', () => {
    expect(collectTags(photos)).toEqual(['family', 'sea', 'travel']);
  });
});

describe('filterPhotos', () => {
  it('sorts newest first by default', () => {
    expect(filterPhotos(photos, DEFAULT_FILTERS).map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });

  it('requires every selected tag', () => {
    expect(filterPhotos(photos, { ...DEFAULT_FILTERS, tags: ['travel', 'sea'] }).map((p) => p.id)).toEqual(['a']);
  });

  it('filters by inclusive date range', () => {
    const result = filterPhotos(photos, { ...DEFAULT_FILTERS, from: '2026-01-10', to: '2026-03-02', sort: 'oldest' });
    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('sorts by title case-insensitively', () => {
    expect(filterPhotos(photos, { ...DEFAULT_FILTERS, sort: 'title' }).map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });

  it('does not mutate the input', () => {
    const copy = [...photos];
    filterPhotos(photos, DEFAULT_FILTERS);
    expect(photos).toEqual(copy);
  });
});

describe('groupByMonth', () => {
  it('groups consecutive photos by month', () => {
    const groups = groupByMonth(filterPhotos(photos, DEFAULT_FILTERS), 'newest');
    expect(groups.map((g) => g.photos.length)).toEqual([1, 1, 1]);
  });

  it('uses a single group for title sort', () => {
    expect(groupByMonth(photos, 'title')).toHaveLength(1);
  });
});
