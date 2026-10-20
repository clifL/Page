import { useEffect, useRef } from 'react';
import { useSwipe } from '../../../hooks/useSwipe';
import type { Photo } from '../types';
import styles from './Memories.module.css';

interface LightboxProps {
  photos: Photo[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDelete: (photo: Photo) => void;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' });

export default function Lightbox({ photos, index, onIndexChange, onClose, onDelete }: LightboxProps) {
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
      if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndexChange(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, photos.length, onIndexChange]);

  if (!photo) return null;

  return (
    <dialog ref={dialogRef} className={styles.lightbox} onClose={onClose} aria-label={photo.title}>
      <div className={styles.lightboxBar}>
        <span className={styles.counter}>
          {index + 1} / {photos.length}
        </span>
        <div className={styles.lightboxActions}>
          <button type="button" onClick={() => onDelete(photo)} aria-label="Delete photo">
            Delete
          </button>
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
        <h2>{photo.title}</h2>
        <p>{dateFormat.format(new Date(`${photo.takenAt}T00:00:00Z`))}</p>
        {photo.tags.length > 0 && <p className={styles.captionTags}>{photo.tags.map((t) => `#${t}`).join('  ')}</p>}
      </div>
    </dialog>
  );
}
