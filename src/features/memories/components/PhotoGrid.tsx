import type { PhotoGroup } from '../filterPhotos';
import type { Photo } from '../types';
import styles from './Memories.module.css';

interface PhotoGridProps {
  groups: PhotoGroup[];
  onOpen: (photo: Photo) => void;
}

/**
 * Square tiles in a CSS grid. Column count adapts to the viewport width
 * (3 on a typical phone, more on tablets and desktops), like Google Photos.
 */
export default function PhotoGrid({ groups, onOpen }: PhotoGridProps) {
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h2 className={styles.groupLabel}>{group.label}</h2>
          <ul className={styles.grid}>
            {group.photos.map((photo) => (
              <li key={photo.id}>
                <button type="button" className={styles.tile} onClick={() => onOpen(photo)}>
                  <img src={photo.src} alt={photo.title} loading="lazy" decoding="async" />
                  <span className={styles.tileTitle}>{photo.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
