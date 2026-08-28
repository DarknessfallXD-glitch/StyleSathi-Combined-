# StyleSathi — Build Plan

This plan breaks the current codebase into verifiable work units. The existing app already has the full scaffold (auth, home, search backend, try-on, subscription, preferences). These units focus on hardening and wiring the existing search/discovery flow end-to-end, since that is the feature with an open question (Amazon affiliate).

Ordering follows dependency-first: backend search first, then frontend wiring, then polish.

## Units (in build order)

### Unit 1 — Backend search hardening + affiliate reliability (backend · Utsav)
- Make vector search failures non-fatal (already partially handled; ensure `search.py` never 500s on affiliate/embedding errors).
- Confirm Amazon PAAPI v5 path works or returns cleanly when keys are absent.
- Fix the `_search_amazon_paapi_direct` result `"location"` value so it stores the human locale, not the AWS region.
- Ensure `requirements.txt` includes `amazon-paapi` fallback deps handled gracefully.
- Add `.env.example` documenting all required keys (Daraz, Flipkart, Amazon, Supabase, OpenAI, Stripe).
- Spec: `01-search-affiliate.md`

### Unit 2 — Frontend search-results wiring (frontend · Reejana)
- Wire home search bar to navigate to a real search results experience using the backend `/search` endpoint.
- Map backend `top_results`/`more_results` through `search.ts` → `SearchProduct`.
- Render product cards with working product-detail navigation.
- Respect loading/empty/error states per `ui-context.md`.
- Spec: `02-frontend-search.md`

### Unit 3 — Data seeding + embeddings pipeline (backend · Utsav)
- Run/verify `seed_products.py` + `seed_embeddings.py` so curated products have embeddings.
- Verify `match_products` RPC and index (`idx_products_embedding`).
- Add more curated products across categories/locations.
- Spec: `03-seeding.md`

### Unit 4 — Personalization + preferences wiring (frontend · Reejana)
- Wire style/language preference screens to the backend `/preferences` endpoints.
- Pass detected location from user preferences to search.
- Spec: `04-preferences.md`

### Unit 5 — Try-on flow reliability (shared)
- Verify AI try-on backend (`tryon.py`, flux/replicate) and frontend `try-on`/`upload` screens.
- Wire try-on history to the saved screen.
- Spec: `05-tryon.md`

### Unit 6 — Subscription + limits (backend · Utsav → frontend wiring · Reejana)
- Verify Stripe subscription + daily usage limits backend.
- Wire subscription screen to plan billing state.
- Spec: `06-subscription.md`

## Validation

- Each unit depends only on earlier units.
- Each unit has a visible result (an endpoint that returns, a screen that renders) — no unit leaves things broken.
- Backend (Utsav) and frontend (Reejana) work is split by boundary per unit.
