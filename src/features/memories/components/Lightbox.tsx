import { useEffect, useRef } from 'react';
import { useSwipe } from '../../../hooks/useSwipe';
import { PRIVATE_TAG } from '../photoApi';
import type { Photo } from '../types';
import styles from './Memories.module.css';

interface LightboxProps {
  photos: Photo[];
  index: number;
  /** Edit and delete are shown only to the logged-in owner. */
  isOwner: boolean;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onEdit: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
}

const takenFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' });
const uploadedFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export default function Lightbox({ photos, index, isOwner, onIndexChange, onClose, onEdit, onDelete }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;
  const prev = () => hasPrev && onIndexChange(index - 1);
  const next = () => hasNext && onIndexChange(index + 1);

  const { offset, dragging, handlers } = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Leave arrow keys alone while a dialog on top (e.g. Edit) has focus.
      if (document.activeElement?.closest('dialog') !== dialogRef.current) return;
      if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndexChange(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, photos.length, onIndexChange]);

  if (!photo) return null;
  const tags = photo.tags.filter((t) => t !== PRIVATE_TAG);

  return (
    <dialog ref={dialogRef} className={styles.lightbox} onClose={onClose} aria-label={photo.title}>
      <div className={styles.lightboxBar}>
        <span className={styles.counter}>
          {index + 1} / {photos.length}
        </span>
        <div className={styles.lightboxActions}>
          {isOwner && (
            <>
              <button type="button" onClick={() => onEdit(photo)}>
                Edit
              </button>
              <button type="button" onClick={() => onDelete(photo)}>
                Delete
              </button>
            </>
          )}
          <button type="button" onClick={onClose} aria-label="Close" autoFocus>
            ✕
          </button>
        </div>
      </div>

      <div className={styles.stage} {...handlers} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img
          key={photo.id}
          src={photo.src}
          alt={photo.title}
          draggable={false}
          className={styles.full}
          data-dragging={dragging || undefined}
          style={{ transform: `translateX(${offset}px)` }}
        />
        {hasPrev && (
          <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={prev} aria-label="Previous photo">
            &#10094;
          </button>
        )}
        {hasNext && (
          <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={next} aria-label="Next photo">
            &#10095;
          </button>
        )}
      </div>

      <div className={styles.caption}>
        <h2>
          {photo.title}
          {photo.tags.includes(PRIVATE_TAG) && <span className={styles.privatePill}>Private</span>}
        </h2>
        {photo.description && <p className={styles.description}>{photo.description}</p>}
        <p>Taken {takenFormat.format(new Date(`${photo.takenAt}T00:00:00Z`))}</p>
        <p>
          Uploaded {uploadedFormat.format(new Date(photo.uploadedAt))} · {photo.sizeMb.toFixed(2)} MB · {photo.width}×
          {photo.height}
        </p>
        {tags.length > 0 && <p className={styles.captionTags}>{tags.map((t) => `#${t}`).join('  ')}</p>}
      </div>
    </dialog>
  );
}
