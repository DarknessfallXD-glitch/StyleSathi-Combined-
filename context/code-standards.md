# StyleSathi — Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one screen, component, or service.
- Respect the system boundaries defined in `architecture.md`.
- Add no code comments unless the logic is non-obvious; prefer naming that self-documents.

## TypeScript / React Native (Frontend)

- TypeScript strict mode is enabled (see `StyleSathi/tsconfig.json`); keep it enabled.
- Avoid `any`; use explicit interfaces (e.g. `SearchProduct`, `Product`, `FeaturedCollection`).
- Define shared shapes in `src/services/` or `src/utils/` — not inline in screens.
- Keep screens composed of reusable components from `src/comp/`.
- Use the `useTheme()` hook for colors — never hardcode hex values inside components.
- Prefer `ThemedText`/`ThemedView` for text and containers that vary by theme.
- Navigation uses expo-router (`Stack` in `_layout.tsx`); add new routes under `src/app/`.
- Async local state (theme, search history, wishlist, session) lives in AsyncStorage via a small util (`utils/searchHistory.ts`, `utils/wishlist.ts`).

## Python / FastAPI (Backend)

- Follow the existing module layout: `api/` (thin handlers) → `services/` (logic) → `core/` (exceptions) → `schemas/` (pydantic).
- Keep `app.py` limited to router registration and middleware — no business logic.
- Validate request input (FastAPI `Query`/pydantic models) at the boundary before logic runs.
- Enforce auth via the `checkAuth` dependency before any authenticated operation.
- Return consistent, predictable response shapes.
- Add new merchants/routers as separate service modules and register them in `app.py`.

## Data and Storage

- Curated products go in Supabase `products` with a 1024-d `embedding` column; seed via `scripts/seed_products.py` + `seed_embeddings.py`.
- Search uses the `match_products` pgvector function (cosine, location + category filters).
- Affiliate products are live-queried, not persisted.
- Do not store large generated images in Postgres — content lives on Replicate/URLs and only URLs are referenced.
- Never commit `.env` or real secrets; use a `.env` loaded by `python-dotenv`.

## Naming and Layout

- Frontend: route files in `src/app/`, components in `src/comp/`, services in `src/services/`, utils in `src/utils/`.
- Backend: FastAPI routers in `api/*.py`, business logic in `services/*.py`.
- Name files after their responsibility, not the technology (e.g. `searchHistory.ts`, not `storage.ts`).

## Location / Currency Awareness

- Always thread a `location` through search and affiliate lookups.
- Currencies must match location (NPR / INR / USD) and never be hardcoded per-product.
- New markets must be added to `LOCATION_MAP` / `AFFILIATE_LOCATIONS` and the marketplace map in `affiliate.py`.

## Ownership

- **Utsav (backend)**: any change under `style-sathi/server/` — search, affiliate, try-on, auth, subscriptions.
- **Reejana (frontend/UI)**: any change under `StyleSathi/src/` — screens, components, theming, navigation.
- Code that spans the boundary (new endpoint + screen) is coordinated together; keep backend/API change and frontend wiring as separate review units.
