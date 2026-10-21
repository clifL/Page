import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../../lib/api';
import { photoApi } from './photoApi';
import type { Photo, PhotoMeta, SiteSettings } from './types';

/**
 * Photos and site settings for the current visitor. `viewerKey` changes on
 * login/logout, which refetches so private photos appear or disappear.
 */
export function usePhotos(viewerKey: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  /** Which viewer the current data was loaded for; differs from viewerKey while a fetch is in flight. */
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = loadedFor !== viewerKey;

  const refreshSettings = useCallback(() => photoApi.settings().then(setSettings), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([photoApi.list(), photoApi.settings()])
      .then(([list, s]) => {
        if (cancelled) return;
        setPhotos(list);
        setSettings(s);
        setError(null);
      })
      .catch((e: unknown) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoadedFor(viewerKey));
    return () => {
      cancelled = true;
    };
  }, [viewerKey]);

  const upload = useCallback(async (file: File, meta: PhotoMeta) => {
    const photo = await photoApi.upload(file, meta);
    setPhotos((prev) => [photo, ...prev]);
    return photo;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<PhotoMeta>) => {
    const photo = await photoApi.update(id, patch);
    setPhotos((prev) => prev.map((p) => (p.id === id ? photo : p)));
  }, []);

  const remove = useCallback(async (ids: string[]) => {
    await photoApi.remove(ids);
    setPhotos((prev) => prev.filter((p) => !ids.includes(p.id)));
  }, []);

  const setUploadsEnabled = useCallback(
    async (enabled: boolean) => {
      await photoApi.setUploadsEnabled(enabled);
      await refreshSettings();
    },
    [refreshSettings],
  );

  return { photos, settings, loading, error, upload, update, remove, setUploadsEnabled, refreshSettings };
}
