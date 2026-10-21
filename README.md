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
  pages/                 Home, Memories, Login, 404
  features/memories/
    components/          PhotoGrid, Lightbox, UploadDialog, EditDialog, FilterBar, OwnerBar
    photoApi.ts          calls to the page-backend API
    filterPhotos.ts      filter, sort and month grouping (unit tested)
  features/auth/         login state (AuthProvider, useAuth)
  lib/api.ts             fetch wrapper: base URL, auth token, errors
```

## Memories backend

Memories is served by the **page-backend** Cloudflare Worker (Hono + D1 + R2), in the sibling
`page-backend` folder. It handles uploads, compression for 4R printing, private photos, owner login,
the guest-upload switch and the monthly upload limits.

- **Locally:** run the backend (`npm run dev` in `page-backend`), then copy `.env.example` to
  `.env.local` here. It points at `http://localhost:8787`.
- **Production:** set the repository variable `PHOTO_API_URL` (Settings → Secrets and variables →
  Actions → Variables) to the deployed Worker URL. The deploy workflow passes it into the build.
  Without it, the Memories page says it isn't connected.

Owner login is at `/login`, linked from the bottom of the Memories page.
