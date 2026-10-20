import { IndexedDbPhotoRepository } from './IndexedDbPhotoRepository';
import type { PhotoRepository } from './PhotoRepository';
import { R2PhotoRepository } from './R2PhotoRepository';

export type { PhotoRepository };

/** Picks the backend from the environment: R2 when an API URL is configured, otherwise the browser. */
export function createPhotoRepository(): PhotoRepository {
  const apiUrl = import.meta.env.VITE_PHOTO_API_URL;
  return apiUrl ? new R2PhotoRepository(apiUrl.replace(/\/$/, '')) : new IndexedDbPhotoRepository();
}
