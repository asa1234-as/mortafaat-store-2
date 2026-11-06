# GitHub + Supabase + Cloudflare Pages

This repository is prepared for CI checks and Cloudflare Pages SPA routing. This change does not deploy the site or modify the Supabase database.

## GitHub Actions
The workflow in `.github/workflows/ci.yml` runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to the production branch.

## Cloudflare Pages
Connect this GitHub repository to Cloudflare Pages and set:
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

The `public/_redirects` file is copied into `dist` by Vite and supports client-side routes.

## Supabase
The app expects these public build variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or the supported publishable key)

Set them in Cloudflare Pages > Settings > Environment variables for Production and Preview as appropriate. Do not put service-role keys, payment secrets, or webhook secrets in any `VITE_` variable or commit them to GitHub. Store server-side secrets in Supabase Edge Function secrets.

Before changing the live database, review the schema and existing policies against the live project. Do not re-run the full schema on a populated project without a migration plan.

## Production checks
Before launch, test customer/admin access, RLS, order creation, stock updates, uploads, checkout, invoice printing, and QR scanning on a real phone. Confirm Supabase Auth redirect URLs and Storage policies include the final production domain.
