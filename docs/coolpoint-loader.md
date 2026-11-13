# Coolpoint branded loading

The loader uses `/public/coolpoint-logo-navy.png`, the exact existing login logo, without editing or redrawing its artwork. Its native 286 × 60 size caps the responsive width to keep this raster asset crisp.

## Files and integration

- `src/shared/components/CoolpointLoader.tsx` and `.css`: reusable full-screen and content-area status, focus/scroll cleanup, delayed display, exit transition, completion state, and reduced-motion alternative.
- `src/modules/auth/pages/Login.tsx`: immediate full-screen status, duplicate-submit guard, cancellable animation timing, failure recovery, and navigation after successful authentication and the sequence finish.
- `src/modules/auth/services/authService.ts`: optional cancellation signal and a 30-second login timeout. Existing storage, permissions clearing, events, and redirect destination are preserved.
- `src/modules/hr/pages/EmployeesPage.tsx`: initial React Query employee loading covers the table area; header, filters, sidebar, and background refetch behavior remain available.
- `src/modules/crm/pages/CrmDashboard.tsx`: initial grouped stats/leads/quotations fetch covers the main content, leaving the header and sidebar visible. Later refreshes do not replay the brand sequence. Request generation and mount checks prevent stale loads from dismissing a newer load.
- `src/modules/user-management/pages/UserRightsPage.tsx`: initial users/software requests must both settle before the content loader leaves. Subsequent user/module selection retains its existing local feedback.
- The HR employee, CRM, and user-rights services bound these initial reads with 30-second timeouts so their existing error/fallback paths can recover from stalled requests.
- `scripts/verify-coolpoint-loader.mjs`: dependency-free Chrome browser verification using isolated storage and mocked API responses.

## Behavior

Two copies of the exact PNG form the grayscale base and blue reveal. CSS reveals the blue layer from 1–3.5 seconds, with a narrow diagonal reflection clipped by the PNG's actual alpha. A final glisten runs during the blue hold; subsequent glistens are separated by quiet intervals if authentication remains pending. The logo never moves or changes proportions. Exit takes 180 ms.

Login requests start alongside the animation. Success normally waits until five seconds have elapsed, then exits and navigates to `/modules`. Failure exits promptly. Reduced motion shows the original blue logo without sweeps or the artificial five-second wait.

Module loaders have a 150 ms display threshold and no minimum duration. The content remains mounted beneath the overlay so requests are not restarted. `CoolpointLoadingBoundary` makes pending content inert, exposes `aria-busy`, and preserves its dimensions. Keep the boundary mounted and change its `loading` prop to allow the exit transition.

```tsx
<CoolpointLoadingBoundary loading={isLoading} label="Loading employee workspace">
  <EmployeeTable />
</CoolpointLoadingBoundary>
```

These integrations cover the three module entry screens. Other HR screens retain their existing loading states and can adopt the same boundary independently. No dependency was added and the surrounding application was not redesigned.

## Verification

From `frontend`, start `npm.cmd run dev -- --host 127.0.0.1 --port 5173`, then run `node scripts/verify-coolpoint-loader.mjs`. Set `CHROME_PATH` if Chrome is installed elsewhere. Screenshots and the browser result are written to `../.taste-skill/loader-check/`.

Browser coverage: fast successful login, duplicate submission, failure and focus restoration, slow authentication, reduced motion, initial loading and dismissal for all three module entries, fast-module flicker prevention, mobile aspect ratio, and browser runtime errors. API responses are mocked; live account authentication is not part of this check.

Production build passes. The new loader and auth service pass targeted ESLint, and Impeccable's detector reports no findings. Project TypeScript checking is blocked by existing errors in `OvertimePage.tsx`, `SalarySlipPage.tsx`, `SalarySummaryReportPage.tsx`, and `CreateUserPage.tsx`. Broader targeted lint reports existing `any` types and effect-dependency warnings in CRM and User Rights. Vite reports the existing bundle-size and outdated Browserslist warnings. The taste skill's page gate identifies the source HTML as a framework shell; its marketing-page structure checks do not verify a transient in-app loader, which is covered by the browser script instead.
