# Clif.L

Personal site: a full-screen photo carousel and a **Memories** photo gallery.
Live at https://www.iamclif.com

Built with React 19, TypeScript, Vite and React Router.

## Getting started

Requires Node 22.12+ (Node 24 LTS recommended).

```bash
npm install       # once, and whenever package.json changes
npm run dev       # dev server with hot reload at http://localhost:5173
```

To test on your phone over the same Wi-Fi: `npm run dev -- --host`, then open the `Network:` URL.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run lint` | ESLint, including React hooks rules |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve `dist/` at http://localhost:4173 |

The build is plain static files, but it must be served over HTTP (`npm run preview`, or GitHub Pages).
Opening `dist/index.html` directly from disk shows a blank page.

## Deployment

Pushing to `master` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which lints, tests,
builds and publishes to GitHub Pages. One-time setup: **Settings → Pages → Source: GitHub Actions**.

## Project structure

```
public/                  static files copied as-is (images, CNAME, Learning/)
src/
  components/            Header, Carousel
  hooks/useSwipe.ts      touch/mouse drag-to-swipe, shared by Carousel and Lightbox
  pages/                 Home, Memories, 404
  features/memories/
    components/          PhotoGrid, Lightbox, UploadDialog, FilterBar
    storage/             PhotoRepository interface + IndexedDB and R2 implementations
    filterPhotos.ts      filter, sort and month grouping (unit tested)
```

## Memories storage

Photos go through the `PhotoRepository` interface in `src/features/memories/storage/`.

- **Default: browser storage (IndexedDB).** Photos stay in that browser only. Other visitors and
  other devices don't see them, and clearing site data deletes them.
- **Cloudflare R2.** Set `VITE_PHOTO_API_URL` (see `.env.example`) to a Cloudflare Worker that fronts the
  bucket. `R2PhotoRepository.ts` documents the endpoints it expects. R2 credentials and upload
  authentication belong in the Worker, never in this frontend.
