# Fix Session Notes

## Reported problem

"Fix the error" so the frontend and backend both work and the application is viewable.

## Diagnosis (2026-11-01)

1. **Blocking error:** `npx expo export --platform web` fails with
   `Unable to resolve module expo-file-system from src/app/try-on.tsx`.
   - `StyleSathi/package.json` lists `expo-file-system` but it is not installed in
     `StyleSathi/node_modules`.
   - Metro then falls back to a stray `C:\Users\NITRO\node_modules\expo-file-system`
     (v58) that is outside the repo, which is the wrong API for this app.
2. **Wrong API usage:** `try-on.tsx` uses `FileSystem.cacheDirectory` and
   `FileSystem.downloadAsync`. In `expo-file-system` 19+/55+ those live under the
   `expo-file-system/legacy` entry point, not the main entry point.
3. **TypeScript errors** (`npx tsc --noEmit`): implicit `any` params in
   `product-detail.tsx` and `BottomTab.tsx`, `price` number-vs-string mismatches in
   `search-result.tsx`, `setSession` shape in `signin.tsx` / `signup.tsx`, and
   `ColorSchemeName` including `"unspecified"` in `ThemeContext.tsx`.
4. **Dependency pollution:** `C:\Users\NITRO\node_modules` contains Expo SDK 58
   packages and duplicates the project's SDK 54/55 modules. Local installs take
   precedence; the stray folder should not be deleted without the user's OK.
5. **Backend:** `import app` already succeeds with `style-sathi/server/venv`
   (Python 3.13.2). Runtime endpoints still need a smoke test.

## Plan

- Install project dependencies locally (`npm install` in `StyleSathi/`).
- Point `try-on.tsx` at `expo-file-system/legacy`.
- Fix the TypeScript errors without changing behavior.
- Verify `npx tsc --noEmit` and a web export.
- Run the FastAPI server and smoke-test endpoints.
- Serve the Expo web build and keep the backend running so the app is viewable.
- Do not upgrade Expo; keep the existing SDK 54 core + 55 packages to avoid
  destabilising the committed native project.

## Notes on execution

- Work is delegated to subagents to keep the main session lean.
- No secrets from `.env` are printed or committed.
