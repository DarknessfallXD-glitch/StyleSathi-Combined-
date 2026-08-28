# Unit 4: Personalization + Preferences Wiring

Owner: Reejana (frontend/UI), with backend support from Utsav

## Goal

Wire the language and style personalization screens to the backend `/preferences` endpoint, and use detected location from user preferences to shape search results.

## Implementation

- Confirm backend `services/preferences.py` + `api/preferences.py` response shape.
- Wire `personalize1`, `language`, and `style` screens to save preferences for the current user.
- Pass the detected `location` (NP/IN/US) derived from `language_preference` when calling search, so location-aware affiliate sourcing applies.
- Render success/failure feedback inline per `ui-context.md`.

## Dependencies

- Unit 1 (robust search) and Unit 2 (frontend search flow) complete.

## Verify when done

- [ ] Selecting a language/style persists and reads back from backend
- [ ] Search uses the user's detected location
- [ ] No TypeScript errors
- [ ] Update `context/progress-tracker.md`
