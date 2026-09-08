# Admin — User access edit: implementation plan

Spec: `Docs/specs/admin/user-access-edit.md`.

## Route

- `src/app/admin/users/[userId]/edit/page.tsx`:
  ```tsx
  export default async function UserAccessEdit({
    params,
  }: PageProps<'/admin/users/[userId]/edit'>) {
    const { userId } = await params;
    return <UserAccessEditPage userId={userId} />;
  }
  ```
- `src/lib/routes/app-routes.ts`: add
  `userEdit: (userId: string) => \`/admin/users/${userId}/edit\`,` under
  `admin`.

## Permissions

None needed beyond the existing `authPermissions.manageUsers` — confirmed
in `AuthDependencyInjection.cs` that the `ManageUserAreaAccess` policy
(guarding the area/course-grant routes this screen calls) is itself
backed by the `ManageUsers` claim, not a distinct one. No new permission
constant, no secondary `hasPermission` check anywhere on this page.

## Data layer

- `src/features/admin/api/get-user.ts`: `GET /api/users/{userId}`, parses
  `userSchema` (already exists from `1q`).
- `src/features/admin/api/grant-user-area-access.ts`:
  `POST /api/access/user-area` with
  `{ userId, areaId, canView: true, canManage: false }`.
- `src/features/admin/api/revoke-user-area-access.ts`:
  `DELETE /api/access/user-area/{userId}/{areaId}`.
- `src/features/admin/api/update-user.ts`: `PUT /api/users/{userId}` with
  `{ name, email, active }`.
- `src/features/admin/api/get-granted-course-access.ts`:
  `GET /api/access/requests/users/{userId}/granted`, parses an
  `accessRequestSchema` array.
- `src/features/admin/api/grant-course-access.ts`:
  `POST /api/access/requests/grant` with `{ userId, courseId }`.
- `src/features/admin/schemas/access-request.schema.ts`:
  ```ts
  const accessRequestSchema = z.object({
    id: z.string(),
    userId: z.string(),
    courseId: z.string(),
    status: z.string(),
    decidedAt: z.string().nullable(),
    decidedByUserId: z.string().nullable(),
    createdAt: z.string(),
  });
  ```
- `src/features/admin/model/access-request.ts`: `AccessRequest`.

## Query keys & hooks

- `src/lib/constants/query-keys.ts`, under `admin`:
  ```ts
  user: (userId: string) => ['admin', 'users', userId] as const,
  grantedCourseAccess: (userId: string) =>
    ['admin', 'users', userId, 'granted-courses'] as const,
  ```
  (`userAreaAccess` already exists from `1q`.)
- `src/features/admin/hooks/admin.queries.ts`:
  - `useUserQuery(userId, { enabled })` — `retry: false` (404 is a real
    not-found, not worth retrying).
  - `useUpdateUserMutation()`.
  - `useGrantUserAreaAccessMutation()`.
  - `useRevokeUserAreaAccessMutation()`.
  - `useGrantedCourseAccessQuery(userId, { enabled })`.
  - `useGrantCourseAccessMutation()`.

## Components

- `src/features/admin/components/area-access-toggle-list.tsx` —
  presentational: props `{ areas: Area[]; grantedAreaIds: Set<string>;
  pendingGrantedAreaIds: Set<string>; onToggle: (areaId: string) => void
  }`. Renders one `StatusToggle` (reused from `1p`) per area, `checked`
  from `pendingGrantedAreaIds`, `onChange` calls `onToggle(area.id)`.
  Doesn't know about the API at all — pure state-in, callback-out, easy to
  unit test.
- `src/features/admin/components/granted-courses-panel.tsx` —
  presentational: props `{ grantedCourseIds: string[]; courses: Course[];
  onGrant: () => void }`. Resolves titles the same way `courses-table.tsx`
  resolves area names; "Comprado" label per row; "+ Conceder acesso a um
  curso pago" calls `onGrant` (opens the picker modal, owned by the
  parent) — no permission branching needed (see "Permissions" above).
- `src/features/admin/components/grant-course-access-modal.tsx` — small
  `AdminModal` with a `<select>` (native, per the spec's "Open decisions")
  populated from `courses.filter(c => c.published && c.pricingModel !==
  'Free' && !grantedCourseIds.includes(c.id))`, plus a submit button;
  surfaces the 409/404 inline messages per the spec.
- `src/features/admin/components/user-access-edit-page.tsx` — the page
  component, structured like `lesson-editor-page.tsx`, minus the
  two-permission split that one needed (see "Permissions" above — this
  screen only ever checks `users.manage`):
  - `useRequirePermission(authPermissions.manageUsers)` for the page —
    the only permission check needed anywhere here.
  - Loads: `useUserQuery(userId)`, `useAreasQuery()`,
    `useUserAreaAccessQuery(userId, { enabled: ready })` (already exists
    from `1q`), `useGrantedCourseAccessQuery(userId, { enabled: ready })`,
    `useCoursesQuery()`.
  - Local pending state:
    `const [pendingAreaIds, setPendingAreaIds] = useState<Set<string> |
    null>(null)` (initialized from the loaded grant list once available;
    `null` while not yet initialized so the toggle list doesn't flash
    empty before data arrives) and
    `const [pendingActive, setPendingActive] = useState<boolean | null>(null)`
    (same pattern).
  - `handleToggleArea(areaId)` flips membership in `pendingAreaIds`.
  - `handleSave()`: diffs `pendingAreaIds` against the loaded grant set —
    areas to grant (`pending - loaded`), areas to revoke
    (`loaded - pending`) — and whether `pendingActive !== user.active`;
    fires all needed mutations (grants/revokes in parallel via
    `Promise.allSettled`, then the `PUT` if the status changed), shows the
    generic banner if any fail, and invalidates `queryKeys.admin.userAreaAccess(userId)`
    / `queryKeys.admin.user(userId)` on success.
  - `handleGrantCourse(courseId)`: immediate `useGrantCourseAccessMutation`
    call, invalidates `queryKeys.admin.grantedCourseAccess(userId)` (and
    `userAreaAccess`, since granting a course can also grant areas per
    `GrantCourseAccessUseCase`) on success.

## Wiring `users-list.md`'s rows

In `src/features/admin/components/users-table.tsx`: wrap each row in a
`Link` to `appRoutes.admin.userEdit(user.id)` instead of a plain `div`
(mirrors `courses-table.tsx`'s `Link`-per-row pattern) — the spec's
"rows are inert" non-goal from `1q` is superseded now that `1r` exists,
the same way `lesson-editor.md` superseded `course-modules.md`'s
lesson-edit-modal non-goal.

## Tests

- `area-access-toggle-list.spec.ts`: renders checked/unchecked per the
  given sets, calls `onToggle` with the right area id.
- `granted-courses-panel.spec.ts`: resolves titles, "Comprado" label,
  permission-note fallback when `canManage` is false.
- Update `users-table.spec.ts` (if it asserts rows are non-interactive —
  check first) to reflect the new `Link` wrapper.

## Sequencing

1. Route constant.
2. Schemas/model/api files.
3. Query keys + hooks.
4. `area-access-toggle-list.tsx`, `granted-courses-panel.tsx`,
   `grant-course-access-modal.tsx` (presentational, testable in
   isolation).
5. `user-access-edit-page.tsx` + route file.
6. Wire `users-table.tsx`'s rows to navigate.
7. Tests, then `npm run test`, `npm run typecheck`, `npm run lint`.
8. Update `README.md` feature list.
