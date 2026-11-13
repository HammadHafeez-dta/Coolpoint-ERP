using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SaftHR.API.DTO;
using SaftHR.API.Models;
using SaftHR.API.Services;

var checks = 0;
void Check(bool ok, string description) { if (!ok) throw new Exception(description); checks++; }
var today = new DateTime(2026, 11, 11);
var queueFrom = today.AddMonths(-1);
var queueRows = new[] {
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 1, EmpCardNo = 1, FromDate = today.AddMonths(-4), ToDate = today.AddMonths(-4) },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 2, EmpCardNo = 1, FromDate = today, ToDate = today, LeaveApprovalStatus = "Approved" },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 3, EmpCardNo = 1, FromDate = today, ToDate = today, LeaveApprovalStatus = "Rejected" },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 4, EmpCardNo = 1, FromDate = null, ToDate = today },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 5, EmpCardNo = 1, FromDate = today, ToDate = null },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 6, EmpCardNo = 1, FromDate = today.AddDays(-2), ToDate = today },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 6, EmpCardNo = 1, FromDate = today.AddDays(-2), ToDate = today, LeaveApprovalStatus = "" },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 7, EmpCardNo = 2, FromDate = queueFrom, ToDate = today },
    new HrmVewLeaf { Site = "SITE-A", ApplicationNo = 8, EmpCardNo = 3, FromDate = today, ToDate = today.AddDays(1) },
    new HrmVewLeaf { Site = "SITE-B", ApplicationNo = 9, EmpCardNo = 1, FromDate = today, ToDate = today },
}.AsQueryable();
var pending = LeaveApprovalQueries.Filter(queueRows.Where(l => l.Site == "SITE-A"), "Pending", queueFrom, today).Select(l => new { l.ApplicationNo, l.EmpCardNo }).Distinct().ToList();
Check(pending.Count == 2 && pending.All(l => l.ApplicationNo is 6 or 7), "Approval queue excludes history, decided rows, incomplete dates, future endings and other sites, deduplicating leave types");
Check(!LeaveApprovalQueries.Filter(queueRows.Take(5), "Pending", queueFrom, today).Any(), "No current pending requests reports zero despite historical blank statuses");
Check(HrDashboardService.PakistanToday(new DateTimeOffset(2026, 11, 10, 19, 1, 0, TimeSpan.Zero)) == today, "Karachi midnight starts at 19:00 UTC");
foreach (var (first, last) in new[] { (today.AddDays(1), today), (today.AddDays(-366), today), (today, today.AddDays(1)), (today.AddHours(1), today) })
{
    try { HrDashboardService.ValidatePeriod(first, last, today); throw new Exception("Accepted invalid range"); }
    catch (ArgumentException) { checks++; }
}
HrDashboardService.ValidatePeriod(today.AddDays(-365), today, today); checks++;
var months = HrDashboardService.FillMonths(new(2026, 9, 20), today, new[] { new JoinerMonth("2026-10", 3) });
Check(months.Count == 3 && months[0].Count == 0 && months[1].Count == 3 && months[2].Count == 0, "Fill missing months, including partial edge months");
var result = HrDashboardService.AttendanceBuckets(new[] { 1, 2, 3, 4, 5, 6, 7, 7 }, new (int, string?)[] { (1, "A"), (1, "P"), (2, "A"), (3, "R"), (4, "GL"), (5, "A"), (6, "unknown"), (900, "P") }, new HashSet<int> { 1, 2, 3, 900 });
Check(result.Total == 7 && result.Buckets.Sum(x => x.Count) == 7, "One bucket per active employee, excluding foreign or inactive records");
Check(result.Buckets.Single(x => x.Label == "Present").Count == 1, "Latest register row wins and present is not double counted as leave");
Check(result.Buckets.Single(x => x.Label == "On leave").Count == 1, "Approved leave replaces absent; rest and present stay classified by register");
Check(result.Buckets.Single(x => x.Label == "Absent").Count == 1, "Explicit absence only");
Check(result.Buckets.Single(x => x.Label == "Other / not marked").Count == 2, "Missing/unknown attendance is not inferred absent");
Check(HrDashboardService.AttendanceBuckets(Array.Empty<int>(), Array.Empty<(int, string?)>(), new HashSet<int>()).Total == 0, "Empty population handled");
using var db = new HRMSDbContext(new DbContextOptionsBuilder<HRMSDbContext>().UseSqlServer("Server=unused;Database=unused;Integrated Security=true").Options);
var service = new HrDashboardService(db, NullLogger<HrDashboardService>.Instance);
var pendingSql = LeaveApprovalQueries.Filter(db.HrmVewLeaves.Where(l => l.Site == "SITE-A"), "Pending", queueFrom, today).Select(l => new { l.ApplicationNo, l.EmpCardNo }).Distinct().ToQueryString();
Check(pendingSql.Contains("DISTINCT") && pendingSql.Contains("2026-10-11") && pendingSql.Contains("2026-11-11") && pendingSql.Contains("SITE-A"), "Shared queue selector translates with exact date/site filters");
Check(HrDashboardService.PhotoContentType(new byte[] { 255, 216, 255, 224 }) == "image/jpeg", "JPEG photo format detected");
Check(HrDashboardService.PhotoContentType(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) == "image/png", "PNG photo format detected");
Check(HrDashboardService.PhotoContentType("GIF89a"u8.ToArray()) == "image/gif", "GIF photo format detected");
Check(HrDashboardService.PhotoContentType("<svg/>"u8.ToArray()) == null && HrDashboardService.PhotoContentType(Array.Empty<byte>()) == null, "Invalid or active photo formats are not served");
var photoSql = db.Employees.Where(e => e.Site == "SITE-A" && e.EmpCardNo == 1).Select(e => e.EmpPicture).ToQueryString();
Check(photoSql.Contains("SITE-A") && photoSql.Contains("[Emp_Picture]") && !photoSql.Contains("[Cnic]"), "Photo query is scoped and selects only the picture");
var active = service.ActiveEmployees("SITE-A", today);
var sql = active.Select(e => e.EmpCardNo).ToQueryString();
Check(sql.Contains("SITE-A") && sql.Contains("[site]", StringComparison.OrdinalIgnoreCase) && sql.Contains("[Status]"), "Active query is site/status scoped");
Check(!sql.Contains("[EmpPicture]") && !sql.Contains("[Cnic]"), "Snapshot queries do not select private profile fields");
var leaveSql = db.HrmLeaveChildren.Where(l => l.Site == "SITE-A" && l.LeaveApprovalStatus == "Approved" && l.FromDate < today.AddDays(1) && l.ToDate >= today && active.Any(e => e.EmpCardNo == l.EmpCardNo)).Select(l => l.EmpCardNo).Distinct().ToQueryString();
Check(leaveSql.Contains("EXISTS") && leaveSql.Contains("Approved") && leaveSql.Contains("DISTINCT"), "Approved-overlap scoped leave query translates to SQL");
var groupedSql = db.Employees.Where(e => e.Site == "SITE-A" && e.JoiningDate >= today.AddMonths(-5) && e.JoiningDate < today.AddDays(1)).GroupBy(e => new { e.JoiningDate!.Value.Year, e.JoiningDate.Value.Month }).Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() }).ToQueryString();
Check(groupedSql.Contains("GROUP BY") && groupedSql.Contains("DATEPART"), "Actual joiner grouping translates on SQL Server");
var restricted = await service.Get("SITE-A", today.AddMonths(-5), today, new(false, false, false, false), default);
Check(restricted.Workforce.Status == "restricted" && restricted.Workforce.Data == null && restricted.Attendance.Data == null && restricted.ScheduledLeave.Data == null, "Restricted sections do not query the database or return data");
checks += await RouteChecks.Run();
Console.WriteLine($"PASS {checks} HR dashboard checks. No database connection made.");
