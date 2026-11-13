# UAM dashboard

The administrator overview lives at `/user-access/dashboard`; `/user-access`
redirects there. The module launcher, sidebar dashboard entry and sidebar brand
link open it. Existing create-user, user-directory and user-rights routes remain.

## Purpose and design

Confirmed brief: an administrator overview of users, access summaries and
management shortcuts, using the app's current styling. This extends the existing
CoolPoint workspace: navy primary, neutral card surfaces, semantic theme tokens,
compact sans-serif typography and matching header/content edges. The mode is
Operate. The directory is the primary task, with site access information alongside
it on wide screens and below it on narrow screens. No new visual identity or
illustration is needed.

The header and content share a centered maximum width (1600px) and responsive
side padding. The account summary uses two columns on smaller screens and four
from the large breakpoint, with thin dividers between cells. The directory and
access panels form two columns from the extra-large breakpoint; below it the
access panels follow the directory. Buttons and inputs reuse the shared UI
components; card, text, border and focus colors use the existing light/dark theme
tokens. Loading animation respects reduced-motion preferences.

## Data and scope

- `/auth/users/all`: registered accounts across the system. Totals distinguish
  administrator (`A`), limited (`U`) and other/unspecified levels. Web-enabled
  is the returned `webUser` flag; it does not mean active or currently online.
- `/auth/users/childs-list?site=…`: explicit module assignments for the signed-in
  site. Normalize known module aliases, deduplicate each user per module, and
  exclude orphan assignments and records from another site.
- Administrators have full access independently of explicit assignments. The
  assignment counts do not claim effective page permissions or login activity.
- The no-assignment count means limited accounts in the global directory with
  neither an HRMS nor CRM assignment for the selected site; it does not imply
  that the account should have access at that site.
- Both endpoints already enforce administrator authorization. The dashboard is
  inside `AdminOnlyLayout`, with queries disabled for non-administrators.

Search, access-level filtering and pagination operate on the loaded directory.
The directory shows eight accounts per page. Refresh reloads the directory and,
when a site is selected, its assignments. Initial directory failures show a retry
state; failed directory refreshes retain the last loaded accounts. Assignment
failures have their own retry state without hiding the loaded directory.
Edit links preserve the existing `userNo` flow. Creating users and changing rights
continue through their existing screens; the dashboard performs no writes.

## Validation

`npx tsc --noEmit -p tsconfig.uam-dashboard.json`

`node scripts/verify-uam-dashboard.mjs http://127.0.0.1:5174`

The browser check uses isolated Chrome and API fixtures, never live accounts.
