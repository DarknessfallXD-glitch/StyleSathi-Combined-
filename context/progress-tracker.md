# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Demo/asset foundation: temporary product-image storage on a free cloud host for showcasing the project.

## Current Goal

- Host product images for the temp demo DB on a free cloud image host (Cloudinary) so URLs are public and servable from anywhere.

## Completed

- Cloned `StyleSathi-Combined-` into a working repository.
- Audited full repo structure (Expo app under `StyleSathi/`, FastAPI backend under `style-sathi/server/`).
- Established the Six-File Context System (all 6 files + AGENTS.md + specs).
- Assigned ownership: **Utsav = backend**, **Reejana = frontend/UI**.
- Created `services/storage.py` — Cloudinary upload/download helpers (`upload_image_bytes`, `upload_pil_image`, `download_image_bytes`, `has_cloudinary_config`).
- Created `api/images.py` — `POST /images/upload` endpoint (auth-required) that stores an image on Cloudinary and returns the public URL.
- Registered `images_router` in `app.py`.
- Created `scripts/seed_product_images.py` — downloads curated product images (Unsplash) and uploads them to Cloudinary, then updates `products.image_url`.
- Added `cloudinary>=1.36.0` to `requirements.txt`.
- Added `style-sathi/server/.env.example` documenting all required secrets.
- Verified modules import/compile cleanly (Python 3.14, minimal venv).

## In Progress

- Standing up the actual Cloudinary credentials (needs a free Cloudinary account) before the seed script can run for real.

## Next Up

- Unit 1: Backend search hardening (Utsav) — see `context/specs/01-search-affiliate.md`.
- Unit 2: Frontend search results wiring (Reejana) — see `context/specs/02-frontend-search.md`.
- Run `scripts/seed_product_images.py` once Cloudinary creds are set.

## Open Questions

- Confirm the Cloudinary account/credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
- Should the temporary product images also feed the "Just For You"/featured home feed (currently dummy data)?

## Architecture Decisions

- StyleSathi uses a React Native / Expo frontend + Python FastAPI backend (no desktop packaging in scope).
- Search merges curated pgvector results with live merchant affiliate feeds, ranked by embedding similarity.
- Backend/Frontend boundaries set in `context/architecture.md`.
- TEMP demo product images are hosted on Cloudinary (free cloud host) for public, auth-free URLs; existing Supabase primary project is untouched for product metadata.

## Session Notes

- The example context.zip in `~/Downloads` is the JavaScript Mastery "Ghost AI" kit — used only as a structural reference, not as StyleSathi content.
- Home screen currently uses dummy products via `services/dummyData.ts`; real image URLs will be published into `products.image_url` by the seed script.
- `.gitignore` already excludes `.env`; public anon keys in `src/lib/supabase.ts` are safe to commit.
