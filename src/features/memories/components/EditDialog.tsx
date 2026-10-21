import { useActionState, useEffect, useRef } from 'react';
import { errorMessage } from '../../../lib/api';
import { submitKeepingValues } from '../../../lib/forms';
import type { Photo, PhotoMeta } from '../types';
import styles from './Memories.module.css';
import { readPhotoFields } from '../readPhotoFields';
import PhotoFields from './PhotoFields';

interface EditDialogProps {
  photo: Photo;
  existingTags: string[];
  onSave: (id: string, patch: PhotoMeta) => Promise<void>;
  onClose: () => void;
}

export default function EditDialog({ photo, existingTags, onSave, onClose }: EditDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const [error, submitAction, isPending] = useActionState<string | null, FormData>(async (_prev, form) => {
    try {
      await onSave(photo.id, readPhotoFields(form));
      onClose();
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  }, null);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => !isPending && e.target === dialogRef.current && onClose()}
      aria-labelledby="edit-title"
    >
      <form onSubmit={submitKeepingValues(submitAction)} className={styles.form}>
        <h2 id="edit-title">Edit photo</h2>
        <img className={styles.editPreview} src={photo.src} alt="" />
        <PhotoFields defaults={photo} existingTags={existingTags} titleRequired />

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
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
