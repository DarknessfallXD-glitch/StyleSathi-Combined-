# StyleSathi — AI Workflow Rules

## Approach

- Work spec-driven and incremental. One feature unit at a time, no speculative changes.
- Each unit produces one visible, verifiable result.
- Stay within one system boundary per unit — do not mix backend and frontend changes in a single unit unless the spec explicitly says so.
- Introduce dependencies just in time — do not install packages before a unit needs them.

## Scoping Rules

- Implement exactly what the spec file says. Do not add extra features or "improvements".
- If a requirement is ambiguous or missing, STOP and ask for clarification. Do not guess.
- Backend work goes to the backend owner (Utsav); frontend/UI work goes to the frontend owner (Reejana).
- Do not modify generated UI/library files or `.expo/` cache output.

## Missing or Ambiguous Requirements

- Ask a clarifying question before writing code.
- Prefer asking over assuming when the choice affects architecture, storage, or output shape.
- When unsure about the exact response shape, reference an existing service (e.g. `api/search.py` → `services/search.py`) for the pattern.

## Documentation Sync

- Keep the six context files in `context/` in sync with implementation.
- Update `context/progress-tracker.md` after every meaningful change (mark unit in progress, then complete).
- If implementation changes architecture, scope, or standards, update the relevant context file before continuing.

## Verification Checklist (before marking a unit complete)

- [ ] Matches the spec goal exactly
- [ ] No TypeScript errors (`npm run lint` for frontend)
- [ ] Backend imports/runs (`uvicorn app:app`) without errors
- [ ] No console errors
- [ ] Loading, empty, and error states handled where applicable
- [ ] Secrets remain in `.env`, never committed
- [ ] Update `context/progress-tracker.md`

## Ownership Rules

- Backend boundary (`style-sathi/server/`): owned by Utsav.
- Frontend boundary (`StyleSathi/src/`): owned by Reejana.
- Context/docs directory: shared.
- Never silently change a file owned by the other person without flagging it.
