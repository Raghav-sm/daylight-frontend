# Daylight users and authorization: implementation plan

This document records the user/auth implementation and the remaining setup steps. It covers a `users` database table, email/password authentication, persistent login, and authorization for existing projects and tasks. It does not add team sharing, roles, invitations, password reset, email verification, or an admin users screen.

## What exists today

- The FastAPI app registers `/projects` and `/tasks` routers in `backend/app/main.py`. Protected routes require a current user, and services scope queries to projects owned by that user.
- SQLAlchemy models are in `backend/app/models/`; Alembic migrations are in `backend/migrations/versions/`. The application database URL in `backend/app/database.py` is PostgreSQL. The backend tests instead use an in-memory SQLite engine.
- The Next.js App Router workspace is under `frontend/src/app/(workspace)/`. Its `AppShell` loads project summaries and sometimes a task before rendering the sidebar and breadcrumbs. HTTP calls go through `frontend/src/lib/api-client.ts`; server state uses TanStack Query under `frontend/src/features/`.
- The frontend currently defaults its API URL to `http://127.0.0.1:8000`. With cookie login, use one host consistently for both apps during development: for example `http://localhost:3000` and `http://localhost:8000`. A mix of `localhost` and `127.0.0.1` can prevent a same-site cookie flow from working as intended.

## One clear permission rule

Every user has private projects. The owner of a project may view, edit, or delete that project, its stages, its tasks, and those tasks' subtasks. A task has no separate owner: its `project_id` determines ownership. There is no shared workspace or `admin` shortcut in this phase.

| Record | Ownership source | Required check |
| --- | --- | --- |
| User | `users.id` | `/auth/me` returns only the signed-in user. Never return a password hash. |
| Project | `projects.owner_id` | Filter all lists by owner; resolve individual projects by both ID and owner. |
| Stage | `project_stages.project_id` | Resolve its parent project under the current user before reading or assigning it. |
| Task | `tasks.project_id` | Join/filter via the owning project for lists and individual task IDs. |
| Subtask | `subtasks.task_id` | Resolve its parent task under the current user before editing or accepting an existing subtask ID. |

Return **401** when there is no valid login. Return **404** for a record that is missing *or belongs to another user*; do not expose another user's record existence. Return **422** for an invalid stage or destination *within the user's own accessible scope*. The frontend hiding a button is only presentation; the backend makes every permission decision.

## Database design

`users`:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | UUID | Primary key, same UUID style as existing models. |
| `name` | string | Required display name; shown beside the avatar in the sidebar. |
| `email` | bounded string | Required, normalized (trim and case-fold), unique in the database. Use this normalized form consistently for login. |
| `password_hash` | string | Required; salted scrypt hash, never plaintext or reversible encryption. |
| `created_at` | timezone-aware datetime | Required, UTC. |

Registration asks for name, email, and password. The password is stored only as a salted scrypt hash. The Account page shows the name and email; it never displays the password. A user can update their display name there.

`auth_sessions` (a small companion table, necessary for server-side login):

| Column | Type | Rule |
| --- | --- | --- |
| `id` | UUID | Primary key. |
| `user_id` | UUID FK to `users.id` | Required, indexed; cascade/delete sessions when a user is removed. |
| `token_hash` | fixed-length string | Unique SHA-256 digest of a randomly generated session token; never store the raw token. |
| `csrf_token` | random string | Independent session-bound CSRF value. Storing this value does not authenticate a request; the HttpOnly session token is still required. |
| `created_at`, `expires_at` | timezone-aware datetimes | UTC; reject expired sessions on every request. |

Add `projects.owner_id` as a UUID FK to `users.id`, indexed. New projects always receive a non-null owner from the authenticated backend dependency. It is temporarily nullable in the first migration so existing data is preserved until an owner is chosen; after the legacy projects are assigned, a follow-up migration can make it non-null. Keep `tasks.project_id`, `project_stages.project_id`, and `subtasks.task_id` as their existing ownership chain; do not duplicate `user_id` on each table. A project owner must never be client-writable through create/PATCH payloads. There is no public users listing or arbitrary user ID input.

**Existing data migration needs an explicit decision.** The current `projects` table has no owner. The first Alembic revision creates `users` and `auth_sessions` and adds a nullable `projects.owner_id`, preserving all old rows. Unowned legacy projects remain inaccessible through the application until they are assigned. Do not silently assign old projects to the first registrant or delete them. Before backfilling a database containing projects, choose the destination account and use a controlled one-time script or follow-up migration; then make `owner_id` non-null in a later revision. Keep migration logic independent of HTTP routes.

## Authentication and browser flow

Choose **opaque server-side sessions in an HttpOnly cookie**. A login generates a cryptographically random token; the browser receives it in `Set-Cookie`, and the database stores only its digest. The server checks digest, expiry, and user on each protected request. Logout deletes the current session row and clears the cookie. This makes revocation straightforward and avoids storing a bearer token in browser storage.

- Hash passwords using Python's standard-library scrypt with a random salt and fixed, explicit work parameters. This keeps the setup installable without another package while using a deliberately slow, memory-hard password hash. Enforce a 12-character minimum and 128-character maximum; normalize and validate email; enforce uniqueness in the database and map duplicate registration to **409**. Return the same generic **401** message for an unknown email or wrong password. Do not log credentials or tokens.
- Set the cookie `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure=True` under HTTPS. For local HTTP development alone, configure `Secure=False`. Configure a bounded lifetime (for example seven days), check `expires_at`, and create a fresh session on each login. The cookie should be host-only (no broad `Domain`).
- Cookie authentication requires CSRF defense. After login, return an independent, random session-bound CSRF token in the login response and from `GET /auth/me`; keep it only in memory in the frontend. Send it as `X-CSRF-Token` for authenticated `POST`, `PATCH`, and `DELETE`; the backend compares it with the token for that server-side session. Also validate `Origin` against configured frontend origins on unsafe browser requests, including login and registration. Reject missing or disallowed origins on these browser endpoints; handle preflight through CORS. Do not treat CORS alone as authorization or CSRF protection.
- Set `fetch(..., { credentials: 'include' })` in the shared API client. Configure FastAPI CORS with explicit allowed frontend origins, credentials enabled, and the CSRF header allowed. With separate `localhost` ports the origins differ but the site host matches; use consistent hosts. In production, use HTTPS and an intentional frontend/API domain and cookie arrangement.
- Public endpoints: `GET /health`, `GET /`, `POST /auth/register`, `POST /auth/login`. `GET /auth/me` and `POST /auth/logout` require a valid session; all project/task endpoints require one too. `OPTIONS` preflight is handled by CORS. API docs can remain enabled for local learning, but an open `/docs` is not access to protected data.
- Use `Cache-Control: no-store` for authentication responses. Clear TanStack Query's user-specific cache on logout and login as another account. On a 401 from a protected endpoint, clear session state/cache and send the user to login; never retry the request indefinitely.

### API contract

| Method and path | Request | Response / effect |
| --- | --- | --- |
| `POST /auth/register` | `{ name, email, password }` | `201` `{ user, csrfToken }`; **also create a session** and set its cookie. |
| `POST /auth/login` | `{ email, password }` | `200` `{ user, csrfToken }` and session cookie; invalid credentials `401`. |
| `GET /auth/me` | Session cookie | `200` `{ user, csrfToken }`; otherwise `401`. Called on app startup/reload. |
| `PATCH /auth/me` | `{ name }` + cookie and CSRF header | Update the signed-in user's display name; return the updated user. |
| `POST /auth/logout` | Cookie + CSRF header | `204`, revoke this session and clear cookie. |

Keep a consistent response shape across register, login, and me: `{ user: { id, name, email, createdAt }, csrfToken }`. Use one explicit Pydantic alias convention for `createdAt` and keep `password_hash`, session token, and session IDs out of response schemas. Password change/reset and multiple-device session management can come later.

### Example access decisions

1. Alice signs in and creates Project A. The backend sets `Project.owner_id = Alice.id`; the client cannot set it.
2. Bob signs in. `GET /projects/summary` lists only Bob's projects. `GET /projects/{A}` and `GET /tasks/{task-in-A}` return 404.
3. Bob sends `PATCH /tasks/{his-task}` with `projectId` set to Project A, or `stageId` from Project A. Both are rejected. Existing subtask IDs from Alice's tasks are likewise rejected.
4. Alice logs out. Her old cookie no longer resolves a session. A page refresh or direct API request cannot read her projects.

## Target file structure and responsibilities

Paths below are relative to the Daylight workspace root. Entries marked **edit** existed before the auth work; entries marked **new** were added for this implementation.

```text
backend/
  pyproject.toml                         # no added dependency: password hashing uses stdlib scrypt
  app/
    main.py                              # edit: register auth router; CORS/config
    database.py                          # edit only if moving DB URL to environment config
    config.py                            # new: frontend origins, cookie flags/lifetime, DB URL
    models/
      __init__.py                        # edit: register User and AuthSession for Alembic
      user.py                             # new: users model
      auth_session.py                     # new: auth_sessions model
      project.py                          # edit: owner_id FK and relationship
    schemas/
      auth.py                             # new: register/login input, public user, auth response
      project.py                          # inspect: ensure owner_id stays out of writable schemas
      task.py                             # inspect: validate existing transfer/stage inputs
    api/
      auth.py                             # new: register, login, me, logout routes
      projects.py                         # edit: require current user; pass user to services
      tasks.py                            # edit: require current user; pass user to services
    services/
      auth_service.py                     # new: user lookup, hash/verify, sessions/revocation
      project_service.py                  # edit: owner-filtered queries and writes
      task_service.py                     # edit: task/subtask access via owned project
    security/
      dependencies.py                     # new: current user/session, Origin and CSRF checks
  migrations/versions/
    1c2b8d5a7f41_add_users_sessions_and_project_owner.py
                                         # new: additive schema; legacy owner backfill deferred
    b0f7a91c6d42_add_name_to_users.py    # new: adds/backfills the display name column
  tests/
    conftest.py                           # edit: authenticated client/user fixtures
    test_auth.py                          # planned: registration, login, cookie, CSRF, logout
    test_authorization.py                 # planned: Alice/Bob isolation, transfer, subtask cases
    test_project_queries.py               # edit: authenticated calls
    test_task_workflows.py                # edit: authenticated calls

frontend/
  src/
    app/
      (auth)/
        login/page.tsx                    # new: small route wrapper
        login/_components/login-form.tsx  # new: sign-in form, pending/error states
        register/page.tsx                 # new: small route wrapper
        register/_components/register-form.tsx
                                         # new: registration form, pending/error states
      (workspace)/layout.tsx              # edit: gate workspace before AppShell fetches data
      (workspace)/account/page.tsx        # new: view/edit profile name and view email
      (workspace)/page.tsx                # edit: keep / redirect to dashboard after gate
      layout.tsx                          # edit: mount the shared query provider above auth/workspace routes
    components/auth/
      workspace-auth-gate.tsx             # new: restore session before mounting AppShell
    components/layout/
      app-shell.tsx                       # edit: sign-out action/user display in shell/sidebar
      app-sidebar.tsx                     # edit: avatar/name menu with Account, Appearance, Sign out
    features/auth/
      types.ts                            # new: public user/session response contracts
      api.ts                              # new: register/login/me/logout HTTP calls
      data.ts                             # new: useCurrentUser and auth mutations/cache handling
    lib/api-client.ts                     # edit: credentials, CSRF header, 401 behavior
    providers/query-provider.tsx         # existing: shared query client for auth transitions
```

The route group `(auth)` does not change the visible URLs: `/login` and `/register`. Keep forms next to their routes, transport in `features/auth/`, and product logic out of `components/ui/`. There is **no need for a global provider that fetches all projects and tasks**.

## How the pieces connect

1. On `/register`, the form collects name, email, and password. FastAPI validates input, hashes the password, inserts a user, creates a session, sets the cookie, and returns the public user and CSRF token. Handle email uniqueness failures safely even when two requests race.
2. On `/login`, the form calls `POST /auth/login`; on success, save the CSRF token in memory, clear any previous user's query cache, and navigate to `/dashboard`.
3. The workspace layout checks `GET /auth/me` before mounting `AppShell`, since the shell immediately fetches project and task data. While checking, show a small loading state. For a 401, redirect to `/login`; for a network/server error, show retry instead of treating it as a logout.
4. `lib/api-client.ts` sends the cookie for every API request and the CSRF header for authenticated mutations. Registration and login have no CSRF token yet and use the strict Origin check. Direct navigation and reload work because the browser retains the HttpOnly cookie and `/auth/me` restores user state and the session's CSRF token.
5. The backend dependency resolves the authenticated user. Each service scopes reads, updates, deletes, counts, and nested writes to that user's projects. Authenticated frontend route gating improves navigation but cannot replace those service checks.
6. Logout calls the backend, clears the cookie/session, clears the Query cache and CSRF token, and redirects to `/login`. If the network request fails, show an error and do not claim the server session was revoked.

**Next.js boundary:** this plan uses a client-side workspace gate because the current app's data fetches are client-side and the session cookie belongs to the API host. If server-rendered protected pages are added later, establish a deliberate same-origin proxy or server-side session lookup; do not assume a Next server request automatically receives a cookie scoped to a different API host.

## Build order for a FastAPI learner

1. Define `User`, `AuthSession`, and `Project.owner_id`; register models in `app/models/__init__.py`. Write and inspect the additive Alembic migration before applying it. Keep legacy owners nullable until the account for the backfill has been chosen.
2. Add password hashing, random session generation, expiry checks, cookie flags, and `get_current_user`. Verify register/login/me/logout in `/docs` or an HTTP client (cookies and CSRF included).
3. Add CSRF and allowed-Origin checks to browser mutations. Confirm ordinary login and project creation work from the actual frontend origin.
4. Apply `current_user` to every project/task route and thread `user.id` into the services. Audit list queries, summary counts, task-by-ID access, stage creation, project transfers, and existing-subtask IDs.
5. Add frontend auth API/hooks, forms, workspace gate, cookie/CSRF transport, and sign out. Keep protected screen routes unchanged.
6. In the sidebar, the account trigger shows an avatar and name. Its menu contains Account, Appearance (Light/Dark/System), and Sign out. Account opens `/account`; update the display name there through `PATCH /auth/me`.
7. Add backend tests with two users and run the frontend build; manually verify sign up, reload, direct deep links, logout, 401 recovery, and cross-user ID attempts.

The distinction to learn is: **authentication** establishes who sent the request; **authorization** decides whether that person may access a particular project or task. `Depends(get_current_user)` establishes identity; owner-filtered service queries enforce permissions.

## Acceptance checks

- New users can register, log in, refresh a protected page, and log out; password hashes and session secrets never appear in API responses.
- Every existing project/task endpoint returns 401 without a session; an authenticated user sees only their own projects, tasks, stages, and subtasks, including through list and summary endpoints.
- Guessing another user's UUID, assigning a foreign stage, moving a task to a foreign project, and reusing a foreign subtask ID never succeed.
- Mutating cookie-authenticated requests without a valid CSRF token or with a disallowed Origin fail. CORS allows only configured frontend origins.
- The first migration preserves existing records and leaves unowned legacy projects inaccessible until the owner backfill is chosen and completed.

## References for the security choices

- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) (password hashing guidance; the implementation uses scrypt from Python's standard library).
- [FastAPI: CORS](https://fastapi.tiangolo.com/tutorial/cors/).
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP: CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## Implementation status

The implementation adds the user and session models, auth routes, owner-scoped project/task services, Next.js registration and login forms, a workspace gate, cookie/CSRF transport, an account menu/page, and additive Alembic revisions. The first migration keeps `projects.owner_id` nullable so existing projects are preserved without guessing who owns them. New projects always get the signed-in user's ID. Unowned legacy projects remain hidden until their owner is chosen and backfilled. The name migration gives existing accounts a temporary `Daylight User` name so they remain valid; each account can update it on `/account`.

The implementation uses standard-library scrypt, so it adds no Python dependency. The name migration has been applied to the currently configured database. Automated auth and two-user authorization tests, plus the legacy-project ownership backfill, remain follow-up steps. Existing projects are intentionally left unowned until you choose which account should receive them.

### Local setup

Use `localhost` for both apps so the browser sends the session cookie as a same-site cookie. Start the backend with its environment configured:

```sh
cd backend
export FRONTEND_ORIGINS=http://localhost:3000
export APP_ENV=development
export SESSION_COOKIE_SECURE=false
uv run alembic upgrade head
uv run fastapi dev app/main.py
```

The migration is additive and leaves old projects unowned; they remain hidden until a backfill account is selected. The configured database is already at the latest migration. If you point `DATABASE_URL` at a different database, run `uv run alembic upgrade head` after confirming that it is the intended database. Then, in another terminal:

```sh
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Open `/register` to create the first account. The frontend API defaults to `http://localhost:8000`, so the `NEXT_PUBLIC_API_URL` assignment can be omitted when using that local setup.
