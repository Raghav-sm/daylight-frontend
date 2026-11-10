# Frontend structure

Daylight uses Next.js App Router. Each URL owns one screen. Shared layout and shared data are mounted once for the workspace.

## Where code belongs

- `src/app/(workspace)/`: Route files. Keep them small: read URL parameters and render the corresponding screen. `/` redirects to `/dashboard`.
- `src/components/layout/`: Shared shell, sidebar, and theme controls. The shell renders the current route's children; it does not choose screens with conditional view flags.
- `src/components/<feature>/`: UI for one feature (`projects`, `board`, `tasks`). Put a route's data callbacks in its screen component; put reusable forms in that feature's dialog components. Keep small, tightly related rendering helpers in the same file until they have a separate use.
- `src/components/ui/`: Installed shadcn and registry components. Keep product-specific behavior out of this folder.
- `src/providers/`: Context that must persist across route changes. The workspace provider currently loads project and task data and owns REST mutations.
- `src/lib/api.ts`: HTTP requests and response handling. Components call the provider, never `fetch` directly. Domain types and color definitions live beside it in `src/lib/`.

## Adding a module

1. Add its route under `src/app/(workspace)/<module>/page.tsx`.
2. Add its screen and related UI under `src/components/<module>/`. Create new files for independently useful dialogs or large sections, not for every icon or small helper.
3. Add REST methods to `src/lib/api.ts` and state/mutations to a provider if the data is shared across routes. If a module becomes large, move its API and provider into a module folder together.
4. Add navigation to `src/components/layout/app-sidebar.tsx` if it belongs in the main navigation.
5. Use theme tokens and shared UI components. Project/stage color tokens are defined in `src/app/globals.css`. Use the shared shadcn `Button`: `default` for the primary action, `secondary` or `outline` for cancel and supporting actions, `ghost` for compact controls, and `destructive` for delete. Pair buttons in a dialog footer at the same size.

Keep URL state in routes, server data access in the API layer, shared client state in providers, and local form state inside the form component. Avoid a central component that switches among unrelated pages.
