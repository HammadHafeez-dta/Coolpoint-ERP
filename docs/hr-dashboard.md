# HRMS dashboard

Implemented at `/hr/dashboard` inside the existing MainLayout. The HRMS launch tile, sidebar Dashboard entry, sidebar workspace heading and legacy `/dashboard` redirect lead here. Existing operational routes remain unchanged.

## Data and permission contract

`GET /api/hr/dashboard?from=yyyy-MM-dd&to=yyyy-MM-dd` is a read-only aggregate in the API host. It delegates HRMS reads to `SaftHR.API.Services.HrDashboardService` using the existing `HRMSDbContext` / `HRMSConnection`. Common's existing `IPermissionService` evaluates the signed user, Site and UserLevel. No database migration, new permission grants or SQL scripts are required.

The endpoint requires authentication and signed Site/user claims. It rejects mismatched site query parameters or Site/X-Site-Code headers. Every data query and linked employee subquery uses the signed Site. No fallback tenant is used. Every source is independently permission checked on the server; frontend hiding is supplementary. Existing `HRMS` page View permissions are reused:

| Source | Required View permission | Data exposed |
|---|---|---|
| Workforce, joiners, department distribution, employee creation activity | Employee | Counts, department labels, permitted employee names and record dates |
| Attendance distribution / present count | Employee + Daily Attendance Report + Leave Approval | Aggregated processed register classifications, reconciled with approved leave |
| Approved leave today, pending applications, submission activity, scheduled leave | Leave Approval | Counts, employee names and application/leave dates |
| Upcoming gazetted holidays | Gazetted Leaves | Saved holiday labels and dates |
| Department directory link | Department | Navigation link only; Employee access already permits employee department names |

No salary, bank account, CNIC, contact details, embedded picture bytes, dates of birth, or birth years are returned by the summary. The endpoint does not retrieve full employee profiles. Each source returns `{status, data, message}` with `ready`, `restricted`, or `unavailable`. A failed source is logged server-side and does not convert to a zero or fail unrelated widgets. Restricted sources are not queried. Request cancellation is propagated.

## Exact metric definitions

- **Total employees:** current `Employee.Status == true`, scoped to the Site, with joining date null or before tomorrow. This follows HRMS's existing active-status convention. It is a current snapshot, not historical headcount.
- **Present today:** latest `AttendanceRegister.RecordNo` per active employee and business date, with processed type `P`. Multiple rows cannot multiply an employee. `R` and `GL` remain rest/holiday. An approved leave overlapping today replaces an absent/unrecognized/missing classification; existing P/R/GL classifications take precedence. Remaining `A` rows are absent. Missing or unknown types stay **Other / not marked**, never inferred absent. This reads the processed register; it does not trigger attendance processing, interpret raw punches or alter shift/rest-day calculations.
- **Attendance percentages:** each mutually exclusive bucket divided by all current active employees, including rest/holiday. These are workforce shares, not a scheduled-worker attendance rate. All buckets sum to the active population. Missing processing remains visible. On-leave KPI separately counts approved overlapping leave even if an employee worked during it, so that KPI can differ from the attendance bucket.
- **On leave today:** distinct active employee IDs with `HrmLeaveChild.LeaveApprovalStatus == Approved`, `FromDate < tomorrow`, and `ToDate >= today`. Pending/rejected leave is excluded.
- **Pending leave approvals:** distinct `(ApplicationNo, EmpCardNo)` from the same site-scoped `HrmVewLeaves` selector as the Leave Approval screen. Status must be null/empty, FromDate must be on/after today minus one calendar month, and ToDate on/before today, exactly matching that screen's default queue. Multiple leave types within an employee's application count once. Historical blank-status rows and orphan child records excluded by the view are not included. The card displays the actual queue dates and opens Leave Approval with those exact dates; approve/reject/delete and leave saves invalidate the dashboard cache. This queue is independent of the activity-period filter.
- **Recorded joiners:** all retained employee records with actual JoiningDate in the selected range, including inactive/leaver records. Monthly counts do not claim to reconstruct historical headcount. Missing joining dates are excluded and disclosed. Deleted records and backdated corrections cannot be reconstructed. Edge months can be partial; selected dates remain visible.
- **Department headcount:** the same active-employee population as the first KPI, grouped by department code/name. Missing/unresolved departments are Unassigned. Up to six groups: if there are more than six, show the top five and combine the remainder as Other departments. Totals reconcile to active headcount.
- **Recent HR activity:** newest employee `EnteryTime` record-creation dates and leave `ApplicationDate` submission dates in the selected period, up to 12 per source, merged to eight entries. Leave rows are grouped by application and employee before limiting. A partly pending application is Pending; otherwise unanimous approval/rejection is shown, or Mixed. These are record/submission events with **current** status, not a fabricated approval audit trail. Employee statuses and leave decisions have no historical decision timestamp in this feed. Date-only fields are shown as business dates without shifting midnight across timezones.
- **Upcoming events:** saved gazetted holidays and approved leave starts in `[today, today+30 days)`, scoped by source permissions. Each source reads its next 50 rows. Duplicate holiday name/date and employee leave-start dates are removed, then both lists are sorted nearest-first. Leave event IDs include the start date to retain separate starts. Five entries appear initially; Show all expands the loaded entries inline. Links use existing holiday or leave-approval pages. No unsupported detail filters are invented.

## Truthful substitutions

The repository contains frontend Job Posts/Applicants screens and services but no matching backend recruitment routes/models. Open Positions is therefore replaced with Pending Leave Approvals; Recruitment Pipeline is replaced with Department Headcount. No recruiting module was built.

There is no reliable historical headcount ledger, so the workforce chart explicitly shows Recorded Joiners. No percentage gains or sample sparklines are fabricated. No configured payroll cutoff, training deadlines or probation review schedules were found. ConfirmationDate is not treated as a future review deadline, and contract dates are not invented from tenure. Birthdays are omitted to avoid introducing a new personal-data visibility rule. Upcoming events use the two supported date sources instead. System Health and all prior mock staff, totals, avatars, notifications and nonfunctional search controls have been removed from the old dashboard; real sidebar/profile/workspace controls remain intact.

## Date behavior, design and verification

Snapshots and upcoming events use the current Asia/Karachi business day. Activity/trend default to the first day five months before the current month through today (six calendar months including the current partial month). The old mock dashboard had no real filter semantics. Presets 3/6/12 months and custom dates persist in `from`/`to` URL parameters. The API validates real yyyy-MM-dd dates, chronological order, no future endpoint, and at most 366 inclusive days. Snapshot and event cards explicitly retain today's context when the activity period changes.

UI uses the existing navy sidebar/header, primary blue, semantic theme tokens, shared Card/Button/Input, Recharts and Lucide. It supports light/dark themes and the existing shell motion preferences. KPI related-module links and header employee-directory links require the same page rights. Mobile includes a working sidebar toggle. No new dependencies, global theme overrides, fonts or image assets were added.

Verification commands:

```text
dotnet run --project backend/CPHR.API.Tests/CPHR.API.Tests.csproj
dotnet build backend/CPProject/CPProject.csproj --no-restore -o D:/CoolPoint/.checks/hr-dashboard-build
npm.cmd run typecheck:hr-dashboard
npm.cmd run check:hr-dashboard
npm.cmd run build
```

The standalone backend checks cover date boundaries, range validation, missing-month fill, duplicate/unknown/overlapping attendance classifications, zero populations, actual SQL Server query translation/site filters, suppressed private fields, denied-source reads, and HTTP authentication/site/date/permission rejection. They do not connect to a database.

The isolated Chrome check uses API fixtures and tests actual UI period controls, invalid dates, inline event expansion, navigation entry, six viewport widths (1440/1280/1024/768/390/320), light/dark, loading, empty, partial-source failure, endpoint failure and restricted data. It also checks timezone rollover and event sorting/deduplication. Screenshots/results are under `.taste-skill/hr-dashboard-check/` at the repository root. Fixture numbers are not used in production code.

Deployment: restart the updated API, then open `/hr/dashboard`. Live SQL response/reconciliation against the deployed HRMS database remains a deployment verification step. The production frontend build reports the existing bundle-size/Browserslist warnings. Full-app TypeScript errors in unrelated salary/overtime/user-management pages are tracked separately; the dashboard has its own focused typecheck.

## Activity scrolling and employee photos

Recent activity has a keyboard-focusable internal scroll region capped at 20rem. The card heading stays outside it. Existing Employee.EmpPicture bytes are fetched separately through `GET /api/hr/dashboard/employees/{employeeId}/photo`, with authentication, Employee View authorization, signed Site filtering and cross-site header/query rejection. This endpoint selects only the requested employee picture and returns supported raster MIME types, with a private/no-store response. The summary supplies employee IDs only for records whose photos the user may view.

Avatars use the shared Avatar component and the authenticated Axios client, not an unauthenticated image URL. Query caching is scoped by site, user, employee and permission state. Blob URLs are revoked on replacement/unmount. Missing, unsupported, inaccessible and undecodable images retain initials. Photos are not requested or displayed without Employee View access. No SQL migration is needed. Backend checks now include photo MIME recognition, scoped photo projection and denied/cross-site photo routes; browser fixtures verify loaded photos, fallback and internal scrolling.
