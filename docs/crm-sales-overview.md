# Commercial CRM sales overview

Impeccable-guided dashboard refinement using the supplied reference's card grid, the app's navy/blue data accents and a top-to-bottom tapered funnel, analytical middle row and operational lower row. The shared sidebar, authentic logos, routes and CRM tabs stay in place. No sample figures, fabricated comparisons or sparklines are shipped.

## Data map

New read-only endpoint: `GET /api/Crm/sales-overview?from=YYYY-MM-DD&to=YYYY-MM-DD&currency=PKR`. Existing `dashboard-stats` response remains unchanged. No new tables or SQL migration is needed.

| Widget | Authoritative data | Time semantics | Currency / scope |
|---|---|---|---|
| Open pipeline | `CRM_Deals.Value`, excluding Won/Lost | Current snapshot, all dates | Signed Site and selected deal currency |
| Open opportunities | Count of open deals | Current snapshot, all dates | Same scoped deals |
| Accepted value | `CRM_Deals.WonValue` for Won deals; counted once | Current snapshot, all dates | Same currency; unknown won amounts excluded with disclosure |
| Won deals | Count of Won deals | Current snapshot, all dates | Same scoped currency |
| Sales trend | Won deal `ClosedAt` / `WonValue` | Closed within selected period, bucketed by Karachi local day; UI groups real daily totals into weeks/months | Same currency; missing timestamps are disclosed, not inferred |
| Inquiry-to-deal cohort | Inquiries created in period, linked deals, recorded quotation `SentAt`, won deal `ClosedAt` | Distinct inquiry counts reaching each linked milestone by period end | Inquiry and deal currency must agree; missing historic milestones are excluded |
| Deals by status | Current deal stage counts | All-time snapshot; no historical stage inference | Selected currency applies to count cohort and legend |
| Recent inquiries | Inquiry CreatedAt and current lifecycle | Created within selected period; most recent six | Selected currency; requires inquiry View |
| Recent activity | Persisted CRM activity OccurredAt, joined to scoped inquiry | Events in selected period; most recent six | Selected inquiry currency; deal/quotation events require corresponding page View |

Dates are inclusive local calendar dates in Asia/Karachi, translated to half-open UTC query boundaries. The maximum range is 366 days. Frontend date/currency selections are kept in URL query parameters; stale requests are canceled. No FX conversion is performed. Available currencies come from actual site-scoped leads/deals, with PKR as the empty-workspace default.

Analytics access uses the existing Sales Analytics right. Aggregated counts are permitted by that right; record feeds and drilldown links additionally respect page-level access. The funnel is an inquiry cohort, not a sum of deals or quote versions: multiple deals/quotes do not multiply a single inquiry. A recorded send must precede a recorded win. The interface labels the cohort and snapshot semantics separately.

KPI and status links use existing `/crm/deals` routes with supported stage/currency/open filters. Recent rows open the existing inquiry workspace. Long internal inquiry identifiers stay hidden. No fake notification menu or unsupported global activity route is introduced.

## Validation scope

Backend checks cover Karachi day boundaries, invalid ranges, real-series zero filling and preservation of decimal totals, alongside CRM routing/access tests. Browser fixtures are isolated test data, used to verify desktop/tablet/mobile layout, currency/date changes, Value/Deals switching, drilldowns, loading, empty/error and permission states. Real SQL aggregation queries still need deployment verification against the user's CRM database; automated checks do not write to that database.
