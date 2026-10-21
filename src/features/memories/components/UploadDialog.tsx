import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { errorMessage } from '../../../lib/api';
import { submitKeepingValues } from '../../../lib/forms';
import { ACCEPT_ATTRIBUTE, MAX_UPLOAD_MB, validateImageFile } from '../photoApi';
import type { Photo, PhotoMeta } from '../types';
import styles from './Memories.module.css';
import { readPhotoFields } from '../readPhotoFields';
import PhotoFields from './PhotoFields';

interface UploadDialogProps {
  existingTags: string[];
  onUpload: (file: File, meta: PhotoMeta) => Promise<Photo>;
  onClose: () => void;
}

const fileTitle = (file: File) => file.name.replace(/\.[^.]+$/, '');
/** The file's last-modified date, usually when the photo was taken or copied off the camera. */
const fileDate = (file: File) => new Date(file.lastModified).toLocaleDateString('en-CA');

export default function UploadDialog({ existingTags, onUpload, onClose }: UploadDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Free preview object URLs when they change or the dialog closes.
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const onFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const errors = files.map(validateImageFile).filter((m): m is string => m !== null);
    setFileErrors(errors);
    if (errors.length) e.target.setCustomValidity('Remove the files listed below');
    else e.target.setCustomValidity('');
    setPreviews(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
  };

  const [error, submitAction, isPending] = useActionState<string | null, FormData>(async (_prev, form) => {
    const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return 'Choose at least one photo.';
    const invalid = files.map(validateImageFile).find(Boolean);
    if (invalid) return invalid;

    const meta = readPhotoFields(form);
    const failures: string[] = [];
    for (const [i, file] of files.entries()) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`);
      // One title for a batch: number them so each stays distinguishable.
      const title = meta.title ? (files.length > 1 ? `${meta.title} ${i + 1}` : meta.title) : fileTitle(file);
      try {
        await onUpload(file, { ...meta, title, takenAt: meta.takenAt || fileDate(file) });
      } catch (e) {
        failures.push(`${file.name}: ${errorMessage(e)}`);
        // No point trying the rest when uploads are off or the monthly limit is hit.
        if (/disabled|limit/i.test(errorMessage(e))) break;
      }
    }
    setProgress(null);
    if (failures.length === 0) {
      onClose();
      return null;
    }
    return failures.join('\n');
  }, null);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={(e) => isPending && e.preventDefault()}
      onClick={(e) => !isPending && e.target === dialogRef.current && onClose()}
      aria-labelledby="upload-title"
    >
      <form onSubmit={submitKeepingValues(submitAction)} className={styles.form}>
        <h2 id="upload-title">Upload photos</h2>

        <label className={styles.field}>
          <span>Photos</span>
          <input name="files" type="file" accept={ACCEPT_ATTRIBUTE} multiple required onChange={onFilesChange} />
          <small>
            JPEG, PNG, WebP, GIF or AVIF, up to {MAX_UPLOAD_MB} MB each. Photos are resized for 4R printing at 300
            dpi.
          </small>
        </label>

        {fileErrors.length > 0 && (
          <ul className={styles.error} role="alert">
            {fileErrors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        {previews.length > 0 && (
          <ul className={styles.previews} aria-label="Selected photos">
            {previews.map((p) => (
              <li key={p.url}>
                <img src={p.url} alt={p.name} />
              </li>
            ))}
          </ul>
        )}

        <PhotoFields
          existingTags={existingTags}
          titlePlaceholder="Defaults to the file name"
          dateHint="Leave empty to use each file's own date."
        />

        {error && (
          <p className={`${styles.error} ${styles.preLine}`} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          {progress && <span className={styles.progress}>{progress}</span>}
          <button type="button" className={styles.secondary} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button type="submit" className={styles.primary} disabled={isPending || fileErrors.length > 0}>
            {isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
