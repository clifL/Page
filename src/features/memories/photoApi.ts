import { api } from '../../lib/api';
import type { Photo, PhotoMeta, SiteSettings } from './types';

export const PRIVATE_TAG = 'private';

/** Standard formats the backend accepts. Mirrors page-backend/src/lib/imageFormat.ts. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp,.gif,.avif,' + ACCEPTED_IMAGE_TYPES.join(',');
/** Cloudflare Images input limit. */
export const MAX_UPLOAD_MB = 20;

export const photoApi = {
  list: () => api<Photo[]>('/photos'),

  upload: (file: File, meta: PhotoMeta) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', meta.title);
    form.append('description', meta.description);
    if (meta.takenAt) form.append('takenAt', meta.takenAt);
    meta.tags.forEach((tag) => form.append('tags', tag));
    return api<Photo>('/photos', { method: 'POST', body: form });
  },

  update: (id: string, patch: Partial<PhotoMeta>) => api<Photo>(`/photos/${id}`, { method: 'PATCH', body: patch }),

  remove: (ids: string[]) => api<{ deleted: number }>('/photos/delete', { method: 'POST', body: { ids } }),

  settings: () => api<SiteSettings>('/settings'),

  setUploadsEnabled: (uploadsEnabled: boolean) =>
    api<{ uploadsEnabled: boolean }>('/settings', { method: 'PUT', body: { uploadsEnabled } }),
};

/** Returns an error message, or null if the file can be uploaded. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPEG, PNG, WebP, GIF or AVIF`;
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `${file.name}: larger than ${MAX_UPLOAD_MB} MB`;
  return null;
}
