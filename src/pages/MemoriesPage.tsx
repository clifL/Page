import { useMemo, useState } from 'react';
import FilterBar from '../features/memories/components/FilterBar';
import Lightbox from '../features/memories/components/Lightbox';
import PhotoGrid from '../features/memories/components/PhotoGrid';
import UploadDialog from '../features/memories/components/UploadDialog';
import styles from '../features/memories/components/Memories.module.css';
import { DEFAULT_FILTERS, collectTags, filterPhotos, groupByMonth } from '../features/memories/filterPhotos';
import type { Photo, PhotoFilters } from '../features/memories/types';
import { usePhotos } from '../features/memories/usePhotos';

export default function MemoriesPage() {
  const { photos, loading, error, upload, remove } = usePhotos();
  const [filters, setFilters] = useState<PhotoFilters>(DEFAULT_FILTERS);
  const [uploading, setUploading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const tags = useMemo(() => collectTags(photos), [photos]);
  const visible = useMemo(() => filterPhotos(photos, filters), [photos, filters]);
  const groups = useMemo(() => groupByMonth(visible, filters.sort), [visible, filters.sort]);
  const openIndex = openId ? visible.findIndex((p) => p.id === openId) : -1;

  const handleDelete = async (photo: Photo) => {
    if (!window.confirm(`Delete "${photo.title}"?`)) return;
    // Move to a neighbour so the lightbox stays open while browsing.
    const neighbour = visible[openIndex + 1] ?? visible[openIndex - 1];
    await remove(photo.id);
    setOpenId(neighbour?.id ?? null);
  };

  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <h1>Memories</h1>
        <button type="button" className={styles.primary} onClick={() => setUploading(true)}>
          + Upload
        </button>
      </div>

      {photos.length > 0 && <FilterBar tags={tags} filters={filters} onChange={setFilters} />}

      {loading ? (
        <p className={styles.empty}>Loading photos…</p>
      ) : error ? (
        <p className={styles.error} role="alert">
          Couldn&apos;t load photos: {error}
        </p>
      ) : photos.length === 0 ? (
        <p className={styles.empty}>No memories yet. Upload your first photo.</p>
      ) : visible.length === 0 ? (
        <p className={styles.empty}>No photos match these filters.</p>
      ) : (
        <PhotoGrid groups={groups} onOpen={(p) => setOpenId(p.id)} />
      )}

      {uploading && <UploadDialog existingTags={tags} onUpload={upload} onClose={() => setUploading(false)} />}

      {openIndex >= 0 && (
        <Lightbox
          photos={visible}
          index={openIndex}
          onIndexChange={(i) => setOpenId(visible[i]?.id ?? null)}
          onClose={() => setOpenId(null)}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
