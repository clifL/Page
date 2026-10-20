import type { NewPhoto, Photo } from '../types';
import type { PhotoRepository } from './PhotoRepository';

const DB_NAME = 'memories';
const DB_VERSION = 1;
const STORE = 'photos';

type StoredPhoto = Omit<Photo, 'src'> & { blob: Blob };

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    request.result.createObjectStore(STORE, { keyPath: 'id' });
  };
  return requestToPromise(request);
}

/** Keeps photos in this browser only. Good for development and offline use. */
export class IndexedDbPhotoRepository implements PhotoRepository {
  private db: Promise<IDBDatabase> | null = null;
  private urls = new Map<string, string>();

  private async store(mode: IDBTransactionMode) {
    this.db ??= openDb();
    return (await this.db).transaction(STORE, mode).objectStore(STORE);
  }

  private toPhoto({ blob, ...meta }: StoredPhoto): Photo {
    let src = this.urls.get(meta.id);
    if (!src) {
      src = URL.createObjectURL(blob);
      this.urls.set(meta.id, src);
    }
    return { ...meta, src };
  }

  async list(): Promise<Photo[]> {
    const records = await requestToPromise<StoredPhoto[]>((await this.store('readonly')).getAll());
    return records.map((r) => this.toPhoto(r));
  }

  async upload({ file, ...meta }: NewPhoto): Promise<Photo> {
    const record: StoredPhoto = {
      ...meta,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
      blob: file,
    };
    await requestToPromise((await this.store('readwrite')).add(record));
    return this.toPhoto(record);
  }

  async remove(id: string): Promise<void> {
    await requestToPromise((await this.store('readwrite')).delete(id));
    const url = this.urls.get(id);
    if (url) URL.revokeObjectURL(url);
    this.urls.delete(id);
  }
}
