# Deployment

Interview OS is a static, client-side SPA. There is no backend, no database server and **no environment variables**. Vercel serves the built `dist/` folder.

## Requirements

- Node **22.18+** (see `engines` in `package.json`; Vercel: Project → Settings → General → Node.js Version → 22.x or newer)
- npm (lockfile is `package-lock.json`)

## First deploy (GitHub → Vercel)

1. Push the repository to GitHub.
2. In Vercel: **Add New… → Project → Import Git Repository**, pick the repo.
3. Framework preset: **Vite** (auto-detected; `vercel.json` also pins it).
4. Build & output settings (already set in `vercel.json`, leave the UI defaults):
   - Install command: `npm install` (default)
   - Build command: `npm run build` (runs `vue-tsc --build` type-check, then `vite build`)
   - Output directory: `dist`
5. Environment variables: none.
6. **Deploy.** The production URL is assigned to the default branch (`main`).

## Ongoing

- Every push to the default branch → production deployment.
- Every push to any other branch / every pull request → its own **preview deployment** with a unique URL (Vercel comments the link on the PR).
- Rollback: Vercel → Deployments → pick a previous deployment → **Promote to Production**.

## `vercel.json`

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{ "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }]
}
```

- **SPA rewrite**: vue-router uses history mode, so deep links like `/q/some-id` must serve `index.html`. Vercel checks real files first, so `/assets/*`, `favicon`, etc. are still served directly.
- **Immutable cache for `/assets`**: Vite fingerprints everything in `dist/assets/` with a content hash, so those files can be cached forever. `index.html` is not under `/assets` and keeps Vercel's default (revalidated) caching, so new deploys are picked up on next load.

## Local checks before pushing

```bash
npm install
npm run build      # type-check + bundle, same as Vercel
npm run preview    # serve dist/ locally
```

`npm run build-only` skips the type-check (faster, for bundle-only checks).

## Data and deployments

User data lives in the browser (IndexedDB) **per origin**. The production domain, each preview URL and `localhost` each have separate, independent data. Use **Settings → Backup** to move data between them. See [DATA.md](./DATA.md).

If you ever change the production domain, users must export a backup on the old domain and import it on the new one.
