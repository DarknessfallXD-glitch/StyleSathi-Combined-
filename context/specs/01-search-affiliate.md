# Unit 1: Backend Search Hardening + Affiliate Reliability

Owner: Utsav (backend)

## Goal

Make the `/search` endpoint robust regardless of merchant API availability, so it returns a ranked `{ top_results, more_results }` response without ever crashing on affiliate or embedding failures. Document all required environment variables.

## Design

- Follow existing response shape in `services/search.py` (`process_search`).
- Affiliate providers must degrade gracefully: missing keys → return `[]` (already the pattern), never raise.
- The Amazon direct PAAPI path should report the human locale in `location` (e.g. `"US"`, `"IN"`), not the AWS region (`"us-east-1"`).

## Implementation

### services/affiliate.py

- In `_search_amazon_paapi_direct`, change the per-product `"location": region` assignment to use the caller-provided `location` argument (the human locale), consistent with the other sources.
- Guard the `AmazonAPI` import path (`amazon.paapi`) so the direct SigV4 fallback is the full behavior when the library is not installed; wrap in try/except (already done — keep it).

### services/search.py

- Ensure `search_affiliate_all` errors never propagate: wrap the affiliate call in try/except and continue with curated results.
- Keep keyword extraction, vector search → fallback, merge, rank, and `top_results`/`more_results` split unchanged.

### requirements.txt

- Add `boto3`-free note: the direct PAAPI path is pure `requests`/`hmac`, so no extra dep is required; do not add heavy AWS SDKs. Keep `amazon-paapi` optional.
- Ensure `python-dotenv` is present (it is).

### .env.example

Create `style-sathi/server/.env.example` documenting:
- `SUPABASE_PROJECT_URL`, `SUPABASE_SERVICE_KEY`
- `DARAZ_API_KEY`, `FLIPKART_AFFILIATE_ID`, `FLIPKART_API_KEY`
- `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_ASSOCIATE_TAG`
- `OPENAI_API_KEY`, `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSION`
- Replicate/Flux and Stripe keys as used by try-on/subscription
- OAuth/redirect variables used by the frontend

## Dependencies

- None new (all logic already present).

## Verify when done

- [ ] `uvicorn app:app` starts without errors
- [ ] `GET /search?query=kurta` returns `{ query, keywords, location, total_results, top_results, more_results }`
- [ ] Search still works when Amazon keys are absent (returns curated results, no 500)
- [ ] Amazon affiliate entries (when keys present) report a human locale, not a region
- [ ] `.env.example` documents every secret
- [ ] No secrets committed
- [ ] Update `context/progress-tracker.md`
