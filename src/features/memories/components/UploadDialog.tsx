import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { parseTags } from '../filterPhotos';
import type { NewPhoto } from '../types';
import styles from './Memories.module.css';

interface UploadDialogProps {
  existingTags: string[];
  onUpload: (items: NewPhoto[]) => Promise<void>;
  onClose: () => void;
}

const MAX_FILE_MB = 25;

/** YYYY-MM-DD in the user's local time zone. */
const toIsoDate = (ms: number) => new Date(ms).toLocaleDateString('en-CA');

export default function UploadDialog({ existingTags, onUpload, onClose }: UploadDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [today] = useState(() => toIsoDate(Date.now()));

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Free preview object URLs when they change or the dialog closes.
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const onFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
  };

  const [error, submitAction, isPending] = useActionState<string | null, FormData>(async (_prev, form) => {
    const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return 'Choose at least one photo.';
    const tooBig = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) return `${tooBig.name} is larger than ${MAX_FILE_MB} MB.`;
    if (files.some((f) => !f.type.startsWith('image/'))) return 'Only image files can be uploaded.';

    const title = String(form.get('title') ?? '').trim();
    const tags = parseTags(String(form.get('tags') ?? ''));
    const date = String(form.get('takenAt') ?? '');

    try {
      await onUpload(
        files.map((file, i) => ({
          file,
          // One title for a batch: number them so each stays distinguishable.
          title: title ? (files.length > 1 ? `${title} ${i + 1}` : title) : file.name.replace(/\.[^.]+$/, ''),
          tags,
          // No date chosen: fall back to each file's own date.
          takenAt: date || toIsoDate(file.lastModified),
        })),
      );
      onClose();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Upload failed.';
    }
  }, null);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="upload-title"
    >
      <form action={submitAction} className={styles.form}>
        <h2 id="upload-title">Upload photos</h2>

        <label className={styles.field}>
          <span>Photos</span>
          <input name="files" type="file" accept="image/*" multiple required onChange={onFilesChange} />
        </label>

        {previews.length > 0 && (
          <ul className={styles.previews} aria-label="Selected photos">
            {previews.map((p) => (
              <li key={p.url}>
                <img src={p.url} alt={p.name} />
              </li>
            ))}
          </ul>
        )}

        <label className={styles.field}>
          <span>Title</span>
          <input name="title" type="text" maxLength={100} placeholder="Defaults to the file name" />
        </label>

        <label className={styles.field}>
          <span>Tags</span>
          <input name="tags" type="text" list="tag-suggestions" placeholder="e.g. travel, family" autoComplete="off" />
          <datalist id="tag-suggestions">
            {existingTags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <small>Separate tags with commas.</small>
        </label>

        <label className={styles.field}>
          <span>Date taken</span>
          <input name="takenAt" type="date" max={today} />
          <small>Leave empty to use each file&apos;s date.</small>
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button type="submit" className={styles.primary} disabled={isPending}>
            {isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
