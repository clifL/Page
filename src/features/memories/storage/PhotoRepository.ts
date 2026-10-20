import type { NewPhoto, Photo } from '../types';

/**
 * Storage backend for Memories. The UI only talks to this interface, so switching
 * from browser storage to Cloudflare R2 doesn't touch any components.
 */
export interface PhotoRepository {
  list(): Promise<Photo[]>;
  upload(photo: NewPhoto): Promise<Photo>;
  remove(id: string): Promise<void>;
}
