# StyleSathi — Agent Entry Point

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, scope, and team ownership
2. `context/architecture.md` — system structure, boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography, and component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, ownership, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## Repo Layout (two apps)

- `StyleSathi/` — React Native / Expo mobile frontend (routes in `StyleSathi/src/app/`).
- `style-sathi/` — Python FastAPI backend (routers in `style-sathi/server/api/`, logic in `style-sathi/server/services/`).

## Ownership

- Backend (`style-sathi/server/`): **Utsav**.
- Frontend/UI (`StyleSathi/src/`): **Reejana**.
- Shared: `context/`.
