# Frontend structure

Daylight uses Next.js App Router. Each URL owns one screen. Shared chrome is mounted once for the workspace. Server state is cached with TanStack Query; forms own their drafts.

## Where code belongs

- `src/app/(workspace)/`: Route files. Keep them small: read URL parameters and render the corresponding screen. `/` redirects to `/dashboard`.
- `src/components/layout/`: Shared shell, sidebar, and theme controls. The shell renders the current route's children; it does not choose screens with conditional view flags. Sidebar loading/errors stay scoped and do not hide route content.
- `src/components/projects/`: Shared project dialogs used from more than one route (create/settings).
- Route `_components/`: Screen-owned UI that is not reused across features (board, task editor, project list cells). Prefer colocation here over inventing a second home for the same components.
- `src/components/ui/`: Installed shadcn and registry components. Keep product-specific behavior out of this folder.
- `src/features/<feature>/`: Data contracts and access only — `types.ts`, `api.ts`, and `data.ts` (query keys, hooks, mutation invalidation). Import types from here; do not add `lib/` re-export shims. Do not put UI trees here.
- `src/providers/`: Infrastructure providers only (for example `query-provider.tsx`). There is no global workspace data store.
- `src/lib/api-client.ts`: Shared HTTP helper (`request`, `ApiError`, base URL). Feature modules call it; screens call feature hooks.

## Data access

| Consumer | Query / API |
| --- | --- |
| Sidebar and projects screen | `GET /projects/summary` via `useProjectSummaries` |
| Project board | `GET /projects/{id}` + `GET /projects/{id}/tasks/summary` |
| Task details | `GET /tasks/{id}` plus supporting project summary/detail queries |
| Dashboard | No task list fetch |

Mutations send sparse PATCH payloads. Invalidation policies live in `features/*/data.ts`.

Task editor placement rules:

- Completion-only edits send `completed` and let the backend choose the named stage.
- Stage-only edits send `stageId`; the backend derives completion.
- Project transfer without an explicit stage omits `stageId` so the backend assigns a destination stage.
- Explicit “No stage” still sends `stageId: null`.

## Adding a module

1. Add its route under `src/app/(workspace)/<module>/page.tsx`.
2. Add screen UI under that route’s `_components/` (or shared dialogs under `src/components/<module>/` when reused).
3. Add `src/features/<module>/{types,api,data}.ts` for contracts, HTTP, and TanStack Query hooks.
4. Add navigation to `src/components/layout/app-sidebar.tsx` if it belongs in the main navigation.
5. Use theme tokens and shared UI components. Project/stage color tokens are defined in `src/app/globals.css`. Use the shared shadcn `Button`: `default` for the primary action, `secondary` or `outline` for cancel and supporting actions, `ghost` for compact controls, and `destructive` for delete.

Keep URL state in routes, server data in the query cache, and local form state inside the form component. Avoid a central component that switches among unrelated pages.
