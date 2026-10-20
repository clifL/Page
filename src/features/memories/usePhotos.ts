import { useCallback, useEffect, useState } from 'react';
import { createPhotoRepository, type PhotoRepository } from './storage';
import type { NewPhoto, Photo } from './types';

export function usePhotos() {
  const [repo] = useState<PhotoRepository>(createPhotoRepository);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo
      .list()
      .then((list) => !cancelled && setPhotos(list))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const upload = useCallback(
    async (items: NewPhoto[]) => {
      const added = await Promise.all(items.map((item) => repo.upload(item)));
      setPhotos((prev) => [...prev, ...added]);
    },
    [repo],
  );

  const remove = useCallback(
    async (id: string) => {
      await repo.remove(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    },
    [repo],
  );

  return { photos, loading, error, upload, remove };
}
