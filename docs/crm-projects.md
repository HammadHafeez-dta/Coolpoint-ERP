# CRM Projects and task board

Projects extend the existing CRM workspace at `/crm/projects` and
`/crm/projects/:id`. They inherit its navy palette, Plus Jakarta Sans interface
type, theme tokens, responsive content edges, and shared controls. This is an
operational screen: project context first, then To do / In progress / Done.
Columns stack below the `xl` breakpoint and become three equal columns at `xl`.
Every card includes a keyboard/touch status menu as an alternative to dragging.

## Interface continuity

The screen uses the existing CRM shell and shared Button, Input, Textarea and
Dialog controls. Card surfaces, muted column backgrounds, borders, focus rings
and light/dark colors resolve through `src/shared/styles/globals.css` and the
existing Tailwind theme; this extension adds no visual identity or global tokens.
The shell retains its 1600px content limit and responsive page padding. Project
cards use one column, expanding to two at `lg`. Task editing uses a scrollable
dialog on shorter screens. Loading, empty, failure/retry, read-only and save
conflict states have explicit copy; status saves announce their result to
assistive technology. Loading/refresh animation respects reduced motion.

Projects appears in CRM navigation and the sidebar's Sales Workflow group.
The CRM header includes the existing sidebar toggle below `md`, keeping the
navigation drawer reachable on mobile. The Projects navigation entry follows
Projects View permission.

## Conversion and scope

Administrators can also use **Create project** to enter a project name and optional
client name, without an inquiry. The new project opens on its task board with no
tasks and Not started status. `POST /api/crm/projects` requires administrator
access and returns its new ID. Project name is required (maximum 250 characters);
client name is optional (maximum 200 characters). Failed creation keeps the
entered values in the dialog for retry. Standalone projects have a nullable LeadId;
a filtered unique index keeps non-null inquiry links unique.

For an existing installation, run `sql/11_crm_manual_projects.sql` before deploying
the manual-creation API. It preserves linked inquiries and tasks. Fresh script09
already includes the nullable link and filtered index; script11 is safe to repeat.

A Qualified inquiry creates exactly one linked project in the inquiry command's
transaction. This includes inquiries initially created Qualified and later
qualification changes. A unique LeadId index prevents competing projects.
Historical Qualified inquiries are backfilled by SQL script 09. No tasks are
seeded. Project titles and client names are captured at conversion; inquiry,
deal, and quotation history remains separate. Reclassification never deletes work.

Administrators can create/edit/reassign tasks. Eligible assignees are limited
web users with site access and CRM Projects View and Edit rights. Limited users
with a legacy unset `Web_User` flag are included; an explicit false flag still
excludes an account. New accounts created through UAM set `Web_User` to true.
Limited users
only receive their own tasks and projects containing those tasks. The API does
not return other task counts, inquiry IDs, or commercial values to them. Their
displayed progress is explicitly labelled **My progress**. Admin project progress
uses all tasks: empty/all To do = Not started; all Done = Completed; otherwise
In progress. Counts and progress are derived when read, preventing stale stored
totals when tasks are added or reopened.

Task status requests include rowVersion. The board moves a card optimistically,
restores it on failure, and reloads current data after conflicts. Status changes,
creation, edits, and assignment changes have actor/time audit rows in
`CRM_ProjectTaskEvents`. There is no delete endpoint. Queries refresh on focus and
every 30 seconds while visible. UAM Add/Edit grants never make a limited account
an administrator.

## Rollout

1. Back up the CRM and Common databases.
2. Run `sql/09_crm_projects.sql` in SSMS. It creates three additive tables and
   backfills valid Qualified inquiries once. Blank-site Qualified inquiries must
   be reconciled first. Repeated execution preserves existing work.
3. Run `sql/10_common_project_permissions.sql` to register Projects in UAM.
   No user privileges are granted automatically.
4. For an installation with the original Projects schema, run
   `sql/11_crm_manual_projects.sql` to enable standalone projects. Re-running
   script 09 alone does not upgrade the original non-null inquiry link.
5. Run `sql/06_crm_model_contract_check.sql`, deploy/restart the API and frontend.
6. In UAM assign limited users CRM **Projects View and Edit**, and enable their
   web accounts. Refresh permissions/re-login, then create tasks as administrator.

Deploy schema before API code: inquiry qualification now uses the Projects table.
Do not drop the new tables to roll back application code; preserve task history.

## API

- `GET /api/crm/projects?search=&page=1&pageSize=25`: scoped project list.
- `GET /api/crm/projects/{id}`: scoped context and visible tasks.
- `GET /api/crm/projects/assignees`: administrator-only eligible users.
- `POST /api/crm/projects`: administrator-only standalone creation with `title`
  and optional `customerName`; returns `{ id }`.
- `POST /api/crm/projects/{id}/tasks`: administrator task creation.
- `PATCH /api/crm/projects/{id}/tasks/{taskId}`: administrator editing/reassignment.
- `POST /api/crm/projects/{id}/tasks/{taskId}/status`: administrator/assigned-worker
  movement with Projects View and Edit; statuses Todo, InProgress, Done.

## Verification

- `dotnet run --project backend/CPProject.Access.Tests`: project assignee candidate,
  legacy web-flag, role normalization, site-query and permission checks; no database
  connection or data changes.

The implementation handoff recorded 219 passing backend checks, frontend CRM
typecheck and lint, and passing Projects and CRM browser suites. Live SQL checks
were skipped because no test connection was supplied. The rollout scripts have
not been run against the application databases; deployment remains outstanding.

- `dotnet run --project backend/CPCRM.API.Tests`: model/DDL, domain, HTTP and access
  checks. Live SQL checks are explicitly skipped without a test connection.
- Optional `CRM_PROJECTS_TEST_CONNECTION`: SQL Server test login with database
  creation permission. The suite creates/drops only its uniquely named disposable
  database; it does not use application connections. Covers conversion,
  transaction rollback, concurrent writes, historical backfill, reassignment,
  invalid assignees and site/ownership isolation.
- Frontend: `npm run typecheck:crm`, `npm run check:projects -- <vite-origin>`,
  and `npm run check:crm -- <vite-origin>`.
- Browser tests use isolated Chrome and API fixtures, never live accounts.
