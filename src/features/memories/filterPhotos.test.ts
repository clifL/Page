import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, collectTags, filterPhotos, groupByMonth, parseTags } from './filterPhotos';
import type { Photo } from './types';

// Midday UTC keeps the local calendar date the same in every time zone from UTC-11 to UTC+11.
const photo = (id: string, day: string, tags: string[], title = id): Photo => ({
  id,
  title,
  description: '',
  tags,
  sizeMb: 1,
  width: 1800,
  height: 1200,
  uploadedAt: `${day}T12:00:00.000Z`,
  takenAt: day,
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
    const groups = groupByMonth(filterPhotos(photos, DEFAULT_FILTERS), DEFAULT_FILTERS);
    expect(groups.map((g) => g.photos.length)).toEqual([1, 1, 1]);
  });

  it('uses a single group for title sort', () => {
    expect(groupByMonth(photos, { ...DEFAULT_FILTERS, sort: 'title' })).toHaveLength(1);
  });
});

describe('date field', () => {
  // Taken long before it was uploaded.
  const old = { ...photo('old', '2026-06-01', []), takenAt: '2019-08-15' };
  const recent = photo('recent', '2026-05-01', []);

  it('filters and sorts by date taken by default', () => {
    expect(filterPhotos([old, recent], DEFAULT_FILTERS).map((p) => p.id)).toEqual(['recent', 'old']);
    const in2019 = filterPhotos([old, recent], { ...DEFAULT_FILTERS, from: '2019-01-01', to: '2019-12-31' });
    expect(in2019.map((p) => p.id)).toEqual(['old']);
  });

  it('can filter and sort by upload date instead', () => {
    const byUpload = { ...DEFAULT_FILTERS, dateField: 'uploaded' as const };
    expect(filterPhotos([old, recent], byUpload).map((p) => p.id)).toEqual(['old', 'recent']);
    expect(filterPhotos([old, recent], { ...byUpload, from: '2019-01-01', to: '2019-12-31' })).toHaveLength(0);
  });

  it('groups by the month of the chosen date', () => {
    const labels = groupByMonth(filterPhotos([old], DEFAULT_FILTERS), DEFAULT_FILTERS).map((g) => g.label);
    expect(labels[0]).toMatch(/2019/);
  });
});
