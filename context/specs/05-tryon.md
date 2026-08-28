# Unit 5: Try-On Flow Reliability

Owners: Utsav (backend `tryon.py`), Reejana (frontend `try-on`/`upload` screens)

## Goal

Verify the AI virtual try-on flow works end-to-end and wire try-on history to the saved screen.

## Implementation

- Backend: confirm `api/tryon.py` + `services/tryon.py` (Replicate/Flux) return a `result_url`, and that `tryon_history` inserts respect RLS.
- Frontend: verify `try-on.tsx` and `upload.tsx` call the endpoint, handle loading/error, and display the generated image.
- Route try-on history results into `saved.tsx` using `tryon_history`.

## Dependencies

- Replicate/Flux configured in `.env`.
- Unit 1 backend robustness (error handling patterns).

## Verify when done

- [ ] Uploading a garment returns a generated try-on image
- [ ] Result is viewable and saved to history
- [ ] Loading/error states shown
- [ ] Update `context/progress-tracker.md`
