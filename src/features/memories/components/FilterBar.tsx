import { DEFAULT_FILTERS } from '../filterPhotos';
import type { DateField, PhotoFilters, SortOrder } from '../types';
import styles from './Memories.module.css';

interface FilterBarProps {
  tags: string[];
  filters: PhotoFilters;
  onChange: (filters: PhotoFilters) => void;
}

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  title: 'Title A–Z',
};

export default function FilterBar({ tags, filters, onChange }: FilterBarProps) {
  const update = (patch: Partial<PhotoFilters>) => onChange({ ...filters, ...patch });
  const toggleTag = (tag: string) =>
    update({ tags: filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag] });
  const isFiltered = filters.tags.length > 0 || filters.from || filters.to;

  return (
    <section className={styles.filters} aria-label="Filter and sort photos">
      <div className={styles.filterRow}>
        <label className={styles.inline}>
          <span>Sort</span>
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortOrder })}>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.inline}>
          <span>Date</span>
          <select value={filters.dateField} onChange={(e) => update({ dateField: e.target.value as DateField })}>
            <option value="taken">Taken</option>
            <option value="uploaded">Uploaded</option>
          </select>
        </label>
        <label className={styles.inline}>
          <span>From</span>
          <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => update({ from: e.target.value })} />
        </label>
        <label className={styles.inline}>
          <span>To</span>
          <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => update({ to: e.target.value })} />
        </label>
        {isFiltered && (
          <button type="button" className={styles.clear} onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort, dateField: filters.dateField })}>
            Clear filters
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className={styles.chips} role="group" aria-label="Tags">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.chip}
              aria-pressed={filters.tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
