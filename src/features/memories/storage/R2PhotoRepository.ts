import type { NewPhoto, Photo } from '../types';
import type { PhotoRepository } from './PhotoRepository';

/**
 * Cloudflare R2 backend (not active until VITE_PHOTO_API_URL is set).
 *
 * R2 credentials must never ship to the browser, so this expects a small
 * Cloudflare Worker in front of the bucket exposing:
 *   GET    /photos       -> Photo[]
 *   POST   /photos       -> multipart form (file, title, tags, takenAt) -> Photo
 *   DELETE /photos/:id   -> 204
 * The Worker should also handle authentication so only you can upload or delete.
 */
export class R2PhotoRepository implements PhotoRepository {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { credentials: 'include', ...init });
    if (!res.ok) throw new Error(`Photo API ${res.status}: ${await res.text()}`);
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  list(): Promise<Photo[]> {
    return this.request<Photo[]>('/photos');
  }

  upload({ file, title, tags, takenAt }: NewPhoto): Promise<Photo> {
    const body = new FormData();
    body.append('file', file);
    body.append('title', title);
    body.append('tags', JSON.stringify(tags));
    body.append('takenAt', takenAt);
    return this.request<Photo>('/photos', { method: 'POST', body });
  }

  remove(id: string): Promise<void> {
    return this.request<void>(`/photos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
