# StyleSathi — Architecture

## Stack

| Layer            | Technology                                            | Role                                                          |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| Framework (FE)   | React Native 0.83 + Expo 54 + expo-router             | Mobile app shell, routing, screens                            |
| UI (FE)          | React Native core components + @expo/vector-icons     | Screens, cards, tabs, themed components                       |
| State (FE)       | React context (`ThemeContext`), AsyncStorage          | Theme + local persistence (search history, wishlist, session) |
| Auth             | Supabase Auth (+ expo-auth-session OAuth)             | User identity, session, backend bearer token                  |
| HTTP (FE)        | axios (`src/services/api/client.ts`)                  | Calls FastAPI backend                                          |
| API (BE)         | Python 3 + FastAPI + uvicorn                          | HTTP routers                                                   |
| Database         | Supabase Postgres + pgvector (1024d embeddings)       | Products, users, try-on history                               |
| Embeddings       | sentence-transformers (backend)                        | Query/product embedding for vector search                     |
| AI Try-On        | Replicate / Flux (backend)                            | Virtual try-on image generation                               |
| Affiliates       | Daraz API, Flipkart affiliate API, Amazon PAAPI v5    | Merchant product search + monetization                        |
| Subscriptions    | Stripe                                                | Plan billing and daily usage limits                           |

## System Boundaries

- `StyleSathi/src/app/` — expo-router screen routes (welcome, signin, signup, home, style, try-on, profile, settings, saved, etc.).
- `StyleSathi/src/comp/` — Reusable UI components (BottomTab, ProductCard, Skeleton, ThemedText/View, ErrorBoundary, NetworkStatus).
- `StyleSathi/src/services/` — API clients and data services (api client, oauth, search, dummyData, searchData).
- `StyleSathi/src/utils/` — Pure helpers (haptic, searchHistory, wishlist, subscription, errorHandler).
- `StyleSathi/src/Context/` — React context providers (ThemeContext).
- `StyleSathi/src/constants/` — Color and layout constants.
- `StyleSathi/src/lib/` — Configuration (config.ts), supabase client, API base URL.
- `style-sathi/server/api/` — FastAPI router handlers (user, audio, search, subscription, preferences, try-on).
- `style-sathi/server/services/` — Business logic (search, products, embeddings, affiliate, tryon, users, subscription, audio/flux/voice).
- `style-sathi/server/schemas/` — Pydantic request body schemas.
- `style-sathi/server/core/` — AppException and exception handlers.

## Storage Model

- **Supabase Postgres**: Users, curated `products` (with `VECTOR(1024)` embedding), `tryon_history`, usage limits (`daily_limit`, `user_usage`).
- **pgvector**: `match_products` function does cosine-similarity vector search with location/category filters.
- **Local (AsyncStorage)**: Auth token, user profile cache, theme, search history, wishlist.
- **Embeddings**: computed at seed time via `seed_embeddings.py` using sentence-transformers; stored in the `embedding` column.
- Merchants (Daraz/Flipkart/Amazon) are queried live at search time; affiliate products are not persisted.

## Auth and Access Model

- Supabase Auth issues a session; the access token is also stored in AsyncStorage.
- The FastAPI backend uses a bearer token to build a Supabase client per request (`api/user.py`: `checkAuth` dependency → `get_supabase` → `getUser`).
- RLS policies: authenticated users can `SELECT` `products`; users can read/insert their own `tryon_history`.
- Root layout redirects unauthenticated users to `/welcome` and signed-in users away from `/welcome`.

## Search Model

- Backend `process_search` (backend `services/search.py`):
  1. Extract keywords from the query (stopword filtering).
  2. Embed the query; run pgvector `match_products` (curated, location/category filtered).
  3. If no curated results, fall back to a random sample of `products`.
  4. Query merchant affiliate feeds (Daraz if NP/IN, Flipkart if IN, Amazon PAAPI for all locations).
  5. Rank affiliate results against the query embedding, merge with curated, sort by score.
  6. Return `{ top_results: [3], more_results: [rest], total_results, keywords, location }`.

## Backend Routers

| Prefix          | File                        | Responsibility                             |
| --------------- | --------------------------- | ------------------------------------------ |
| `/user`         | `api/user.py`               | Auth dependency, user info                 |
| `/audio`        | `api/audio.py`              | Audio (voice) handling                     |
| `/subscription` | `api/subscription.py`       | Plans, usage limits, Stripe                |
| `/preferences`  | `api/preferences.py`        | Style/language preferences                 |
| `/search`       | `api/search.py`             | Search endpoint                            |
| `/try-on`       | `api/tryon.py`              | AI virtual try-on                          |

All routers are registered in `style-sathi/server/app.py` with CORS wide open for dev.

## Invariants

1. All search results must be merged, ranked by score, and split into `top_results`/`more_results` before returning.
2. Merchants must be dialed in by location — Daraz for NP/IN, Flipkart only for IN, Amazon for all supported markets.
3. Vector search failures must never crash the request — always fall back to curated sample products.
4. The backend must never return a raw affiliate list without ranking against the query embedding.
5. Frontend screens must not call Supabase/HTTP directly from styles; data access lives in `services/`.
6. Search ranking and scored output must stay consistent between backend and the frontend `SearchProduct` mapping.
7. Secrets (Amazon keys, Flipkart keys, Supabase URL/anon, OpenAI key) must never be committed — loaded from `.env`.
