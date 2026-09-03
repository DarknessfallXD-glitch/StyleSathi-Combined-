# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Demo/asset foundation + working end-to-end "search" flow (phone-ready).

## Current Goal

- Let the user type "yellow dress" on their phone in Expo Go and see yellow dress product images served via FastAPI → Supabase → Cloudinary.

## Completed

- Cloned `StyleSathi-Combined-` into a working repository.
- Audited full repo structure (Expo app under `StyleSathi/`, FastAPI backend under `style-sathi/server/`).
- Established the Six-File Context System (all 6 files + AGENTS.md + specs).
- Assigned ownership: **Utsav = backend**, **Reejana = frontend/UI**.
- Created `services/storage.py` — Cloudinary upload/download helpers (`upload_image_bytes`, `upload_pil_image`, `download_image_bytes`, `has_cloudinary_config`).
- Created `api/images.py` — `POST /images/upload` endpoint that stores an image on Cloudinary and returns the public URL.
- Added `cloudinary>=1.36.0` to `requirements.txt`; added `style-sathi/server/.env.example` documenting all required secrets.
- Recreated `style-sathi/server/.env` with verified working Cloudinary (**tfpja2zx**) + Supabase (**oqdpwtyjbgzufeblrnww**) credentials.

### Backend demo work (auth-free search)
- **`services/embeddings.py`**: added `DeterministicEmbeddingService` (1024-dim hashed vectors, no deps) and made `get_embedding_service()` fall back to it when `OPENAI_API_KEY` is empty — so `/search` works without an OpenAI key. Restored `LocalBGE3EmbeddingService.__init__`.
- **`api/search.py`**: replaced `checkAuth` with `optional_auth` (`HTTPBearer(auto_error=False)`) so `/search` works anonymously (token still honored if sent).
- **`services/search.py`**: anonymous `supabase_client=None` now falls back to the shared public products client; stripped the heavy `embedding` column from results.
- **`services/products.py`**: `match_products` now requests a large candidate pool (`match_count` scaled up) before trimming — works around the ivfflat approximate index that was only returning 1 result at low counts; threshold set to 0.4.
- **`scripts/seed_yellow_dresses.py`**: seeds 5 curated yellow-dress products (real Unsplash images → Cloudinary, `location=NP`) with embeddings computed by the same deterministic embedder search uses. **5 products live in Supabase.**
- Verified: `curl "…/search/?query=yellow dress&location=NP"` returns all 5 yellow dresses with live Cloudinary image URLs (HTTP 200).

### Backend/server state
- Venv at `style-sathi/server/.venv` with fastapi, uvicorn, supabase, cloudinary, requests, pillow, python-dotenv etc.
- Backend running on `0.0.0.0:8000` (nohup, PID captured in session).

### Frontend phone fixes (`StyleSathi/`)
- **`src/services/api/client.ts`**: API base URL now reads `EXPO_PUBLIC_API_URL` with default `http://192.168.1.102:8000` (LAN IP so a phone in Expo Go can reach it).
- Added **`StyleSathi/.env`** with `EXPO_PUBLIC_API_URL=http://192.168.1.102:8000`.
- Replaced all `react-native-vector-icons/FontAwesome` imports (19 files) with `@expo/vector-icons/FontAwesome` (ships with Expo, no native linking needed).
- **`src/app/home.tsx`**: `handleSearch` now navigates to `/search-result` with `{ q: trimmed }` so searching actually shows results.
- `npm install --legacy-peer-deps` succeeded; Metro bundles the full app (1308 modules) successfully. (`expo export` hits a pre-existing `hermesc`-missing tooling error in this environment — unrelated to code; Expo Go compiles JS on-device.)

## In Progress

- None (demo flow is functional). Remaining is user device/HW steps.

## Next Up

- On the same Wi‑Fi: confirm `192.168.1.102` is this machine's LAN IP; if not, update `StyleSathi/.env` (`EXPO_PUBLIC_API_URL`) and `src/services/api/client.ts` default to the correct IP.
- Run `npx expo start --lan` from `StyleSathi/`, open in Expo Go, log in/sign up, type "yellow dress" on Home → see 5 yellow dresses.
- Unit 1: Backend search hardening (Utsav) — see `context/specs/01-search-affiliate.md`.
- Unit 2: Frontend search results wiring (Reejana) — see `context/specs/02-frontend-search.md`.

## Completed (Speech-to-Text Feature)

- Created `src/hooks/useSpeechToText.ts` — reusable hook using `expo-speech-recognition` with permissions, error handling, and callbacks
- Integrated speech-to-text on Home page (`src/app/home.tsx`) — microphone button in search bar, converts speech to text, triggers search on final result
- Integrated speech-to-text on Search Results page (`src/app/search-result.tsx`) — same functionality for search page
- Added `expo-speech-recognition` plugin to `app.json` with microphone and speech recognition permissions
- Uses on-device speech recognition (iOS SFSpeechRecognizer, Android SpeechRecognizer, Web SpeechRecognition API)

## Open Questions

- Confirm `192.168.1.102` is the correct LAN IP of the dev machine from the phone's network.


## Architecture Decisions

- StyleSathi uses a React Native / Expo frontend + Python FastAPI backend (no desktop packaging in scope).
- Search merges curated pgvector results with live merchant affiliate feeds, ranked by embedding similarity.
- Backend/Frontend boundaries set in `context/architecture.md`.
- TEMP demo product images are hosted on Cloudinary (free cloud host) for public, auth-free URLs; existing Supabase primary project is untouched for product metadata.

## Session Notes

- The example context.zip in `~/Downloads` is the JavaScript Mastery "Ghost AI" kit — used only as a structural reference, not as StyleSathi content.
- Home screen currently uses dummy products via `services/dummyData.ts`; real image URLs will be published into `products.image_url` by the seed script.
- `.gitignore` already excludes `.env`; public anon keys in `src/lib/supabase.ts` are safe to commit.
