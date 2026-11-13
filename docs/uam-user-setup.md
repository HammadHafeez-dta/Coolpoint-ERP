# UAM user setup

Limited account setup now continues from Create User to User Rights. The existing
account, module and page-rights APIs remain the source of truth. This is an
extension of the incumbent CoolPoint workspace in Operate mode: it preserves the
compact sans-serif typography, theme colors, spacing, shared buttons, inputs,
cards and dialogs. It introduces no new visual system.

## Guided flow

1. Create or edit an account, select Limited and choose the supported HRMS/CRM
   modules. Saving persists the account and selected module access, then opens
   `/user-access/user-rights` for the returned user number. Administrator saves
   keep the existing account flow.
2. User Rights shows the saved account identity and signed-in site. Module
   assignment permits entering a workspace; it does not grant page permissions.
   Opening the setup link grants no permissions. Page rights start from saved
   values, with absent rights unchecked.
3. Choose page permissions and save each module. Progress counts saved pages with
   **View**, fetched from the server for actual module assignments at the
   signed-in site and the current Karachi calendar year. Every assigned module
   needs at least one saved View permission before setup is complete. An Edit
   flag alone does not complete a module. The progress check is a setup aid, not
   proof that every intended workflow has been authorized.
4. CRM project task assignment requires both **View** and **Edit** on **Projects**.
   The setup screen states this requirement. Finish setup returns to Existing
   Users. Finish later warns that the account is saved but page access remains
   incomplete; Permissions in Existing Users resumes setup.

`userRightsLink` generates `userNo`, `setup=1`, the first selected `software`, and
the normalized comma-separated `modules` list. User Rights validates a positive
safe-integer `userNo`, supported software/module aliases, and `setup` values of
`0` or `1`; guided setup requires a user number. Invalid or deleted accounts show
an error with a path back to Existing Users. URL modules are navigation context,
not authoritative assignments: the progress summary reloads module assignments
and saved rights from the server. Page-rights reads and writes use the signed-in
site, rather than a site supplied by the URL.

## Changes, failures and directory actions

Unsaved page-right changes are protected when switching account/module, leaving
through router links or browser history, and closing or reloading the tab. Leaving
asks to discard the draft; saves and module updates block in-app departure while
busy. Finish later asks whether to leave incomplete setup before asking to discard
any unsaved changes, so cancelling the incomplete-setup warning retains the draft
and dirty state. Changing module access retains the page matrix and dirty state,
including when the module request fails; it does not prompt to discard because
the matrix is not replaced. Native browser unload prompts use the browser's own
wording. Failed saves retain selections for another Save attempt. User-list,
saved-rights and progress-summary failures expose separate retry actions; a failed
rights load cannot be saved as an empty permission set.

Existing Users retains search, filters and pagination and provides:

- **Permissions** for Limited accounts, opening the guided rights flow.
- **Edit**, reusing the existing account form and `userNo` selection.
- **Delete**, requiring a confirmation that names the account and explains that
  account, module and page access are removed permanently. Unfinished project
  tasks remain assigned until an administrator reassigns them. Recorded assignee
  names and task history remain. Failed deletion stays in the dialog for retry.

## User Rights layout and responsive behavior

User Rights uses one main content column. The selected account name, login ID
and signed-in site appear above the permissions; **Change user** opens a
searchable account popover instead of a second user sidebar. Search accepts a
name or login ID and provides an empty-result message. Account selection keeps
the existing unsaved-change confirmation.

Guided setup uses a compact progress summary with saved View counts for each
assigned module and a Finish setup or Finish later action. Compact module
buttons select the current workspace. **Manage** discloses the current module
access status, explanation and Grant/Revoke Module Access action. **Permission
guide** discloses the action meanings and per-module save behavior; the CRM
Projects View + Edit requirement remains visible beside it.

The permission matrix has four distinct actions: **View**, **Add**, **Edit** and
**Delete**. Export follows View in the existing rights system, as explained in
the guide; it has no separate toggle. Desktop uses a grouped table with column
and row headers, collapsible groups, column-wide toggles and group/all-permission
actions. Each page-action button has a descriptive accessible name and pressed
state. Native button keyboard activation and visible focus indicators are
retained.

Below 640px, each permission row places its page name above four labeled action
controls with 44px targets. These rows fit the available width without horizontal
scrolling; desktop column-wide controls are hidden on mobile, while group actions
remain available. Module buttons use short CRM/HRMS labels on narrow screens.
The header keeps Save Rights and the unsaved indicator visible while a single
main content region scrolls vertically. Page search, Reload and Discard changes
retain their existing behavior. Dark mode uses the incumbent theme, and reduced
motion removes local transitions.

On narrow screens the Existing Users directory becomes row cards with wrapping
action buttons. Both screens retain the existing shared controls and theme.

## Persistence and cache behavior

The frontend reuses `/auth/users/save`, `/auth/users/all`,
`/auth/users/edit/{userNo}`, `/auth/users/{userNo}`, `/auth/users/child/{userNo}`,
the existing child-module save/delete APIs, and `/auth/rights/form-names`,
`/auth/rights/saved` and `/auth/rights/batch-save`.

Account saves invalidate the UAM user directory query. Rights saves invalidate
UAM assignment and CRM Projects queries; saving the signed-in user's rights also
refreshes that user's permission store. Deletion invalidates the UAM directory,
UAM assignments and CRM Projects queries after removing the local directory row.

The batch-rights endpoint enforces administrator access, checks the account still
exists and rejects mixed user/site payloads. Its writes commit in one database
transaction, then invalidate that user's server permission cache. Account deletion
transactionally removes the account and associated rights/module records and
invalidates server permission caches for the affected sites after commit. It does
not delete CRM project tasks or their history.

There are no schema changes and no SQL script for this extension. Rebuild and
restart the updated API to activate the backend transaction and cache changes;
updating only the frontend does not activate them.

## Validation and evidence

Run from `frontend` with the Vite application available at the supplied origin:

```powershell
npm.cmd run typecheck:uam-dashboard
npx.cmd eslint src/modules/user-management/pages/UserRightsPage.tsx
npm.cmd run check:user-setup -- http://127.0.0.1:5174
npm.cmd run check:uam-dashboard -- http://127.0.0.1:5174
npm.cmd run check:crm -- http://127.0.0.1:5174
npm.cmd run build
```

From the workspace root:

```powershell
dotnet run --project backend/CPProject.Access.Tests
dotnet run --project backend/CPCRM.API.Tests
```

The implementation handoff records 16 passing CPProject.Access checks and 219
passing CPCRM.API checks. Live SQL checks are skipped unless
`CRM_PROJECTS_TEST_CONNECTION` is configured. Browser checks use isolated Chrome
and API fixtures; they do not verify a live SQL deployment or change live accounts.
The saved user-setup result reports that the fixture checks passed.
The browser suite also checks that cancelling Finish later and a failed module
access update both retain unsaved page-right changes. Its CRM fixture contains
six pages across multiple groups. Rights checks cover widths of 1917, 1024, 768,
390 and 320px, page overflow, vertical mobile permission scrolling, dark mode,
account-picker search and switching, and Space-key activation of a focused
permission button. These fixture checks exercise UI behavior, not a complete
accessibility audit.

Screenshots and the fixture result are under
`.impeccable/review/user-setup/`: create and guided desktop, guided mobile
(390px), scrolled mobile permissions, rights at 1917/1024/768/320px, guided dark
mode, completion, Existing Users desktop/mobile, and the deletion confirmation.
`result.txt` records the last completed fixture run; `failure.png`, when present,
is diagnostic output from a failed run and may be older than the passing result.
These artifacts document the extension within the existing styling. The current
UI refinement passed the UAM typecheck, targeted User Rights ESLint check and
production build; browser captures and the result file should be regenerated
together after subsequent UI changes.
