export interface Photo {
  id: string;
  title: string;
  description: string;
  tags: string[];
  /** Stored (compressed) size in megabytes. */
  sizeMb: number;
  width: number;
  height: number;
  /** ISO timestamp of the upload. */
  uploadedAt: string;
  /** Date the photo was taken, YYYY-MM-DD. */
  takenAt: string;
  /** Image URL. Private photos get a signed link that expires after an hour. */
  src: string;
}

export interface PhotoMeta {
  title: string;
  description: string;
  /** YYYY-MM-DD, or empty to let the uploader pick a default. */
  takenAt: string;
  tags: string[];
}

export interface SiteSettings {
  uploadsEnabled: boolean;
  /** Whether the current visitor may upload right now (switch and monthly limit). */
  canUpload: boolean;
  /** Owner only. */
  monthlyUploads?: number;
  monthlyLimit?: number;
}

export type SortOrder = 'newest' | 'oldest' | 'title';

/** Which date the date range, date sorting and month grouping use. */
export type DateField = 'taken' | 'uploaded';

export interface PhotoFilters {
  tags: string[];
  from: string;
  to: string;
  sort: SortOrder;
  dateField: DateField;
}
