/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** page-backend Worker URL, e.g. https://page-backend.<account>.workers.dev */
  readonly VITE_PHOTO_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
