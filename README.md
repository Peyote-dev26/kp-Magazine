# KP MAGAZINES

KP MAGAZINES is a premium digital magazine platform built with a traditional HTML frontend, a Node.js/Express backend, and a PostgreSQL/Supabase-ready service layer.

## Project structure

- `frontend/` - public-facing HTML, CSS, and vanilla JS pages
- `admin/` - editorial and CMS dashboard HTML pages
- `backend/` - Express REST API and business logic

## Local development

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the API:
   ```bash
   npm run dev
   ```
4. Open the frontend pages directly in a browser or serve them through a static local server:
   ```bash
   cd ..
   python -m http.server 5500
   ```

## API endpoints

The backend exposes JWT-authenticated endpoints under `/api/*` for auth, articles, categories, authors, videos, comments, users, newsletter and contact.

## Supabase setup

The backend uses the server-only Supabase secret key for trusted writes and profile/role lookups. The publishable key is used for public reads that must still respect Row Level Security. The secret key is never included in frontend files or API responses.

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in `backend/.env`.
3. Open `backend/supabase/001_initial_schema.sql` in the Supabase SQL editor and run it. The migration is additive and does not reset existing objects.
4. Create the first administrator in Supabase Auth, then insert or update the matching row in `public.profiles` with role `super_admin`.

Until the migration is applied, configured article requests return an explicit `503` rather than silently using demo data.

## Authentication and roles

Registration and login use Supabase Auth when the Supabase variables are configured. The API accepts Supabase access tokens and loads the role from `public.profiles`. Protected routes enforce roles server-side: `super_admin`, `editor`, `author`, `moderator`, and `member`.

## Vercel deployment

The repository is configured as one Vercel deployment. `vercel.json` maps `/` to
`frontend/index.html`, serves the existing `frontend/` and `admin/` files, and
routes `/api/*` through the Express catch-all function in `api/[...path].js`.

Add the production values from `backend/.env.example` to the Vercel project:
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`,
`JWT_SECRET`, `SESSION_SECRET`, `CLIENT_URL`, and `NODE_ENV=production`.
Set `CLIENT_URL` to the deployed Vercel origin. Keep `SUPABASE_SECRET_KEY`
server-only; it is never included in frontend files.

After applying the Supabase migration, deploy from the repository root with
`vercel` or connect the repository in the Vercel dashboard. Local development
continues to use `cd backend && npm.cmd run dev`; the frontend helper directs
pages served on `localhost:5500` to the local API and uses same-origin `/api`
requests on Vercel.

## Environment variables

See `backend/.env.example` for configuration references.
