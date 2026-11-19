<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Daylight frontend rules

Read `ARCHITECTURE.md` before changing the frontend.

- Give each screen its own route. Keep route files limited to route parameters and rendering that screen.
- Put shared chrome in `components/layout/`, reusable cross-route dialogs in `components/<feature>/`, screen-owned UI in route `_components/`, HTTP/query logic in `features/<feature>/`, and shared transport in `lib/api-client.ts`. Import domain types from `features/*/types`.
- Use TanStack Query for server state. Do not reintroduce a global workspace data provider that loads every project and task for every screen.
- Screens should fetch by route ID. Shared sidebar/project metadata uses `GET /projects/summary`. Boards use project-scoped task summaries. Task details use `GET /tasks/{id}`.
- Mutations send only changed fields. Keep invalidation in `features/*/data.ts`. For task placement: send `completed` or `stageId`, not both; omit `stageId` on project transfer unless the user chose a stage or No stage.
- Forms own drafts and dirty state. Do not overwrite unsaved edits from background refetch.
- Keep product behavior out of `components/ui/`; those files are installed primitives.
- Use shared theme tokens for styling. Use `@/components/ui/button` with `default`, `secondary`/`outline`, `ghost`, or `destructive` variants for visible page actions; pair matching sizes in dialog footers.
