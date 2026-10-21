import { parseTags } from './filterPhotos';
import { PRIVATE_TAG } from './photoApi';
import type { PhotoMeta } from './types';

/** Reads the PhotoFields inputs back out of a submitted form. */
export function readPhotoFields(form: FormData): PhotoMeta {
  const tags = parseTags(String(form.get('tags') ?? '')).filter((t) => t !== PRIVATE_TAG);
  if (form.get('private') === 'on') tags.push(PRIVATE_TAG);
  return {
    title: String(form.get('title') ?? '').trim(),
    description: String(form.get('description') ?? '').trim(),
    takenAt: String(form.get('takenAt') ?? ''),
    tags,
  };
}
