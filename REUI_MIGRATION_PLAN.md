# ReUI UI migration plan for Daylight

## Goal

Remove Cult UI's TextureButton styling and use one consistent shadcn/Radix visual system informed by ReUI's free component examples. Preserve all routes, CRUD behavior, board stages, light/dark themes, and the existing module structure. This is a UI migration, not a backend change.

## Read before editing

- `AGENTS.md` and `ARCHITECTURE.md` in this folder.
- ReUI: https://reui.io/components/button, https://reui.io/components/dialog, https://reui.io/components/alert-dialog, and https://reui.io/components/card.
- ReUI's `@reui/c-*` items are examples composed from shadcn primitives. Stock `button`, `dialog`, `sidebar`, and `card` are installed with bare shadcn names. Do not install an example and leave its demo in the app. Use an example as a reference, then adapt the existing feature component.

## Design decisions

1. Keep the project's existing `radix-nova` shadcn style and Radix UI stack. Do not change to Base UI or replace the existing sidebar primitive.
2. Use `@/components/ui/button` throughout the product. `default` is the primary action; `outline` or `secondary` is a supporting or Cancel action; `destructive` is an irreversible action; `ghost` is for compact icon controls. Match button sizes within each action row. ReUI's default, secondary, destructive, small, and icon examples (`c-button-1`, `c-button-2`, `c-button-5`, `c-button-8`, `c-button-11`) show the intended hierarchy.
3. Keep Dialog for create/edit forms. Use ReUI's basic dialog (`c-dialog-1`) for short forms and its scrollable dialog with a footer that remains visible (`c-dialog-3`) for Add Task. Use Alert Dialog for the final delete confirmation. Do not nest a confirmation dialog inside another modal if focus handling becomes awkward; close or replace the edit dialog before showing the confirmation.
4. Use the shadcn Card primitive for project cards and the task details container. Keep the board's stage/card interaction and geometry; align its borders, radius, and spacing with the same tokens.
5. Use existing CSS theme tokens in `src/app/globals.css` for colors and spacing. Avoid hardcoded neutral/indigo gradients and extensive inline styles.

## Implementation sequence

### 1. Set up the needed primitives

From `frontend/`, inspect `src/components/ui/button.tsx` and `dialog.tsx` before running the CLI: they already exist and may contain local changes. Install only missing primitives:

```bash
npx shadcn@latest add card alert-dialog
```

If Luna needs source for a specific free ReUI example, add `"@reui": "https://reui.io/r/{style}/{name}.json"` to `components.json` (retain `"style": "radix-nova"`), then install only that example, such as `npx shadcn@latest add @reui/c-dialog-3`. Inspect the generated files before integrating; avoid overwriting the current Button, Dialog, or Sidebar without comparing changes. No ReUI Pro purchase or license is needed for this plan.

### 2. Replace buttons in feature components

Remove `TextureButton` imports and use the shared shadcn `Button` in:

- `src/components/projects/project-hub.tsx`: Create project uses primary `size="sm"`.
- `src/components/projects/project-create-dialog.tsx`: Cancel outline/secondary, Create primary, matching sizes.
- `src/components/projects/project-settings-dialog.tsx`: Edit and Cancel secondary, Save primary, Delete/Confirm destructive.
- `src/components/board/add-stage-dialog.tsx`: Add Stage in board header secondary, form submit primary, Cancel secondary.
- `src/components/board/KanbanBoard.tsx`: per-stage Add Task secondary/ghost with a clear hover state.
- `src/components/tasks/add-task-dialog.tsx`: Cancel secondary, Create Task primary; preserve scrollable form body and visible footer.
- `src/components/tasks/task-details.tsx`: Back/Add secondary, Save primary, Delete and remove-subtask destructive. Give icon-only controls accessible labels.

Use the existing Button sizes rather than copying TextureButton's `w-full` and `w-fit` overrides. Check the other shared controls (`theme-menu.tsx`, sidebar trigger, dialog close) for coherent size and spacing. Once references are gone, remove `src/components/ui/texture-button.tsx`, its Cult UI registry entry in `components.json`, and `@radix-ui/react-slot` only if nothing else imports it. Update `ARCHITECTURE.md` and `AGENTS.md` to name shadcn Button variants instead of TextureButton.

### 3. Normalize dialogs and delete confirmation

Apply the same header, field spacing, footer separation, overlay, close-button policy, and button sizing to Create Project, Edit Project, Add Stage, and Add Task. Keep form state and submission errors in each feature component. Use Alert Dialog for project/task deletion confirmations while preserving the current rule that projects with tasks cannot be deleted. Ensure Escape, focus return, cancel, and pending-submit states work.

### 4. Align cards and page layouts

In `project-hub.tsx`, use Card as the clickable project tile with a consistent icon, title, task/stage metadata, padding, border, hover, and keyboard focus. In `task-details.tsx`, group task fields into Task, Details, and Subtasks sections using Card and consistent form controls. In `KanbanBoard.tsx`, retain the current stage color variable, drag/drop, per-stage Add Task action, and horizontally scrollable board.

## Done when

- No `TextureButton` imports, Cult UI registry config, or Cult UI-only dependency remain.
- Primary/secondary/destructive buttons match in height, radius, and typography across project, board, task, and dialog screens in both themes.
- `/` still redirects to `/dashboard`; `/projects`, `/projects/[id]`, and `/tasks/[taskId]` work with the same CRUD calls and URLs.
- Create/edit dialogs and delete confirmations work with keyboard navigation; no double modal or lost focus.
- `npm run lint`, `npx tsc --noEmit --incremental false`, and `git diff --check` pass.
- Do not add test files or open a browser. Leave visual review to the user.
