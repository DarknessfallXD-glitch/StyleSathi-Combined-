# Unit 3: Data Seeding + Embeddings Pipeline

Owner: Utsav (backend)

## Goal

Ensure curated products exist with vector embeddings so pgvector search returns real results across categories and locations.

## Implementation

- Review `scripts/seed_products.py` and `scripts/seed_embeddings.py`; run them against a configured Supabase project.
- Verify `match_products` RPC and `idx_products_embedding` index exist (see `supabase_migration.sql`).
- Add curated products across categories (Kurta, Shawl, Dress, Sari, Accessories, Jewelry, etc.) and locations (NP primary).
- Confirm embedding dimension `VECTOR(1024)` matches the provider (`EMBEDDING_DIMENSION=1024`, OpenAI `text-embedding-3-small` or local bge-m3 with `truncate_dim=1024`).

## Dependencies

- Valid embeddings provider configured (`.env`).
- `supabase_migration.sql` applied.

## Verify when done

- [ ] `match_products` returns results for a sample query
- [ ] Curated products have non-null `embedding`
- [ ] Search returns curated products before affiliate fallback
- [ ] Update `context/progress-tracker.md`
