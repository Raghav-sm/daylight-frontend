<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Daylight frontend rules

Read `ARCHITECTURE.md` before changing the frontend.

- Give each screen its own route. Keep route files limited to route parameters and rendering that screen.
- Put shared chrome in `components/layout/`, feature UI in `components/<feature>/`, shared data in `providers/`, and HTTP requests in `lib/api.ts`.
- Add new feature files when a component owns a form, a distinct screen, or substantial independent behavior. Keep short helpers near their caller.
- Keep product behavior out of `components/ui/`; those files are installed primitives.
- Use shared theme tokens for styling. Use `@/components/ui/button` with `default`, `secondary`/`outline`, `ghost`, or `destructive` variants for visible page actions; pair matching sizes in dialog footers.
- Avoid changing existing API contracts or route URLs as part of a visual refactor.
