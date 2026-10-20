/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloudflare Worker URL for R2 photo storage. Empty means browser-only storage. */
  readonly VITE_PHOTO_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
