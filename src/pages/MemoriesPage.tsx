import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../features/auth/authContext';
import EditDialog from '../features/memories/components/EditDialog';
import FilterBar from '../features/memories/components/FilterBar';
import Lightbox from '../features/memories/components/Lightbox';
import styles from '../features/memories/components/Memories.module.css';
import OwnerBar from '../features/memories/components/OwnerBar';
import PhotoGrid from '../features/memories/components/PhotoGrid';
import UploadDialog from '../features/memories/components/UploadDialog';
import { DEFAULT_FILTERS, collectTags, filterPhotos, groupByMonth } from '../features/memories/filterPhotos';
import type { Photo, PhotoFilters } from '../features/memories/types';
import { usePhotos } from '../features/memories/usePhotos';
import { apiConfigured, errorMessage } from '../lib/api';

export default function MemoriesPage() {
  if (!apiConfigured) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Memories</h1>
        <p className={styles.empty}>Memories isn&apos;t connected to a server yet.</p>
      </main>
    );
  }
  return <Memories />;
}

function Memories() {
  const { user, checking, logout } = useAuth();
  // Wait for a stored session to be checked so private photos load on the first fetch.
  const viewerKey = checking ? 'checking' : (user?.username ?? 'guest');
  const { photos, settings, loading, error, upload, update, remove, setUploadsEnabled, refreshSettings } =
    usePhotos(viewerKey);

  const [filters, setFilters] = useState<PhotoFilters>(DEFAULT_FILTERS);
  const [uploading, setUploading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = user !== null;
  const tags = useMemo(() => collectTags(photos), [photos]);
  const visible = useMemo(() => filterPhotos(photos, filters), [photos, filters]);
  const groups = useMemo(() => groupByMonth(visible, filters), [visible, filters]);
  const openIndex = openId ? visible.findIndex((p) => p.id === openId) : -1;

  const run = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const deleteOne = (photo: Photo) =>
    run(async () => {
      if (!window.confirm(`Delete "${photo.title}"? This can't be undone.`)) return;
      // Move to a neighbour so the lightbox stays open while browsing.
      const neighbour = visible[openIndex + 1] ?? visible[openIndex - 1];
      await remove([photo.id]);
      setOpenId(neighbour?.id ?? null);
    });

  const deleteSelected = () =>
    run(async () => {
      if (!selected?.size) return;
      if (!window.confirm(`Delete ${selected.size} photo${selected.size > 1 ? 's' : ''}? This can't be undone.`)) return;
      // The API deletes up to 100 per request.
      const ids = [...selected];
      for (let i = 0; i < ids.length; i += 100) await remove(ids.slice(i, i + 100));
      setSelected(new Set());
    });

  const toggleSelected = (photo: Photo) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) next.delete(photo.id);
      else next.add(photo.id);
      return next;
    });

  const closeUpload = () => {
    setUploading(false);
    void refreshSettings(); // usage count and limit may have changed
  };

  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Memories</h1>
        {/* Hidden while loading so a previous viewer's permission never shows */}
        {!loading && settings?.canUpload && (
          <button type="button" className={styles.primary} onClick={() => setUploading(true)}>
            + Upload
          </button>
        )}
      </div>

      {isOwner && (
        <OwnerBar
          username={user.username}
          settings={settings}
          selecting={selected !== null}
          onToggleUploads={setUploadsEnabled}
          onToggleSelect={() => setSelected((s) => (s ? null : new Set()))}
          onLogout={() => {
            setSelected(null);
            void logout();
          }}
        />
      )}

      {photos.length > 0 && <FilterBar tags={tags} filters={filters} onChange={setFilters} />}

      {actionError && (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className={styles.empty}>Loading photos…</p>
      ) : error ? (
        <p className={styles.error} role="alert">
          Couldn&apos;t load photos: {error}
        </p>
      ) : photos.length === 0 ? (
        <p className={styles.empty}>No memories yet.</p>
      ) : visible.length === 0 ? (
        <p className={styles.empty}>No photos match these filters.</p>
      ) : (
        <PhotoGrid groups={groups} selected={selected} onOpen={(p) => setOpenId(p.id)} onToggle={toggleSelected} />
      )}

      {!isOwner && !checking && (
        <footer className={styles.footer}>
          <Link to="/login">Owner login</Link>
        </footer>
      )}

      {selected && (
        <div className={styles.selectionBar} role="toolbar" aria-label="Selection">
          <span>{selected.size} selected</span>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setSelected(new Set(visible.map((p) => p.id)))}
          >
            Select all
          </button>
          <button type="button" className={styles.danger} disabled={selected.size === 0} onClick={deleteSelected}>
            Delete
          </button>
        </div>
      )}

      {uploading && <UploadDialog existingTags={tags} onUpload={upload} onClose={closeUpload} />}

      {openIndex >= 0 && (
        <Lightbox
          photos={visible}
          index={openIndex}
          isOwner={isOwner}
          onIndexChange={(i) => setOpenId(visible[i]?.id ?? null)}
          onClose={() => setOpenId(null)}
          onEdit={setEditing}
          onDelete={deleteOne}
        />
      )}

      {editing && (
        <EditDialog photo={editing} existingTags={tags} onSave={update} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}
