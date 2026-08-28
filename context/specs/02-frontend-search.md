# Unit 2: Frontend Search Results Wiring

Owner: Reejana (frontend/UI)

## Goal

When a user submits a search from the home screen, navigate to a search results screen that calls the backend `/search` endpoint and renders ranked products using the existing product card patterns and loading/empty/error states from `ui-context.md`.

## Design

- Follow the existing home screen patterns (horizontal product lists, `ProductCard`, `Skeleton` loading, themed empty/error states).
- Use `useTheme()` colors throughout — no hardcoded hex.
- Bottom tab stays visible; keep bottom padding (`paddingBottom: 80`).

## Implementation

### src/services/search.ts

- Keep `searchProducts` but ensure it maps the backend `top_results` + `more_results` array into `SearchProduct[]` (already implemented). Verify `title`/`image_url` correctly map to `name`/`image`.

### src/app/search-result.tsx (existing route)

- Receive the search `query` via route params (the home screen currently has navigation commented out — enable `router.push('/search-result?q=...')` or reuse an existing route).
- Call `searchProducts(query)` on mount.
- Render:
  - "Results for <query>" header
  - A flat list of `ProductCard`s
  - `Skeleton` while loading
  - Empty state ("No products found") when the result set is empty
  - Error state with Retry when the request fails

### src/app/home.tsx

- Uncomment/enable navigation on search submit so the term goes to the results screen (and is still recorded in search history).

## Dependencies

- None new.

## Verify when done

- [ ] Typing a query and submitting navigates to search results
- [ ] Results render product cards with image, name, price
- [ ] Skeleton shows during load; empty state when no results; error + Retry on failure
- [ ] No TypeScript errors (`npm run lint`)
- [ ] No console errors
- [ ] Works in light and dark theme
- [ ] Update `context/progress-tracker.md`
