import type { PhotoGroup } from '../filterPhotos';
import { PRIVATE_TAG } from '../photoApi';
import type { Photo } from '../types';
import styles from './Memories.module.css';

interface PhotoGridProps {
  groups: PhotoGroup[];
  /** When set, tapping a tile toggles selection instead of opening it. */
  selected: ReadonlySet<string> | null;
  onOpen: (photo: Photo) => void;
  onToggle: (photo: Photo) => void;
}

/**
 * Square tiles in a CSS grid. Column count adapts to the viewport width
 * (3 on a typical phone, more on tablets and desktops), like Google Photos.
 */
export default function PhotoGrid({ groups, selected, onOpen, onToggle }: PhotoGridProps) {
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h2 className={styles.groupLabel}>{group.label}</h2>
          <ul className={styles.grid}>
            {group.photos.map((photo) => {
              const isSelected = selected?.has(photo.id) ?? false;
              return (
                <li key={photo.id}>
                  <button
                    type="button"
                    className={styles.tile}
                    data-selecting={selected ? true : undefined}
                    aria-pressed={selected ? isSelected : undefined}
                    onClick={() => (selected ? onToggle(photo) : onOpen(photo))}
                  >
                    <img src={photo.src} alt={photo.title} loading="lazy" decoding="async" />
                    <span className={styles.tileTitle}>{photo.title}</span>
                    {photo.tags.includes(PRIVATE_TAG) && (
                      <span className={styles.badge} title="Private">
                        🔒<span className="visually-hidden">Private</span>
                      </span>
                    )}
                    {selected && <span className={styles.check} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
