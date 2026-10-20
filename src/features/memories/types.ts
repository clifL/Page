export interface Photo {
  id: string;
  title: string;
  tags: string[];
  /** ISO date (YYYY-MM-DD) the photo was taken. Used for sorting, filtering and grouping. */
  takenAt: string;
  /** ISO timestamp of the upload. */
  uploadedAt: string;
  /** URL the browser can display: an object URL locally, or a public R2 URL. */
  src: string;
}

export interface NewPhoto {
  file: File;
  title: string;
  tags: string[];
  takenAt: string;
}

export type SortOrder = 'newest' | 'oldest' | 'title';

export interface PhotoFilters {
  tags: string[];
  from: string;
  to: string;
  sort: SortOrder;
}
