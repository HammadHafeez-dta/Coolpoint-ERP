using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SaftHR.API.DTO;
using SaftHR.API.Models;

namespace SaftHR.API.Services;

// Read-only selectors; never invokes attendance processing or payroll calculations.
public class HrDashboardService(HRMSDbContext db, ILogger<HrDashboardService> logger)
{
    public Task<byte[]?> EmployeePhoto(string site, int employeeId, CancellationToken ct) => db.Employees.AsNoTracking()
        .Where(e => e.Site == site && e.EmpCardNo == employeeId).Select(e => e.EmpPicture).FirstOrDefaultAsync(ct);
    public static string? PhotoContentType(byte[] bytes)
    {
        if (bytes.Length >= 3 && bytes[0] == 0xff && bytes[1] == 0xd8 && bytes[2] == 0xff) return "image/jpeg";
        if (bytes.Length >= 8 && bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return "image/png";
        if (bytes.Length >= 6 && (bytes.AsSpan(0, 6).SequenceEqual("GIF87a"u8) || bytes.AsSpan(0, 6).SequenceEqual("GIF89a"u8))) return "image/gif";
        if (bytes.Length >= 12 && bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) && bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8)) return "image/webp";
        if (bytes.Length >= 2 && bytes[0] == 'B' && bytes[1] == 'M') return "image/bmp";
        return null;
    }
    public static DateTime PakistanToday(DateTimeOffset now) => now.ToOffset(TimeSpan.FromHours(5)).Date;
    public static void ValidatePeriod(DateTime from, DateTime to, DateTime today)
    {
        if (from != from.Date || to != to.Date || from > to || (to - from).Days > 365 || to > today)
            throw new ArgumentException("Choose a date range of up to 366 days ending today or earlier.");
    }
    public static List<JoinerMonth> FillMonths(DateTime from, DateTime to, IEnumerable<JoinerMonth> values)
    {
        var lookup = values.ToDictionary(x => x.Month, x => x.Count);
        var result = new List<JoinerMonth>();
        for (var month = new DateTime(from.Year, from.Month, 1); month <= to; month = month.AddMonths(1))
        {
            var key = month.ToString("yyyy-MM");
            result.Add(new(key, lookup.GetValueOrDefault(key)));
        }
        return result;
    }
    public static AttendanceOverview AttendanceBuckets(IEnumerable<int> active, IEnumerable<(int Employee, string? Type)> records, ISet<int> approvedLeave)
    {
        var latest = records.GroupBy(x => x.Employee).ToDictionary(g => g.Key, g => g.Last().Type?.Trim().ToUpperInvariant());
        var counts = new Dictionary<string, int> { ["Present"] = 0, ["On leave"] = 0, ["Absent"] = 0, ["Rest / holiday"] = 0, ["Other / not marked"] = 0 };
        foreach (var id in active.Distinct())
        {
            var type = latest.GetValueOrDefault(id);
            // Preserve processed register classifications. Only approved leave can
            // replace an absent/unmarked row; pending/rejected leave never qualifies.
            var bucket = type == "P" ? "Present" : type is "R" or "GL" ? "Rest / holiday" : approvedLeave.Contains(id) ? "On leave" : type == "A" ? "Absent" : "Other / not marked";
            counts[bucket]++;
        }
        return new(counts.Values.Sum(), counts.Select(x => new DashboardCount(x.Key, x.Value)).ToList());
    }
    public IQueryable<Employee> ActiveEmployees(string site, DateTime today) => db.Employees.AsNoTracking()
        .Where(e => e.Site == site && e.Status == true && (e.JoiningDate == null || e.JoiningDate < today.AddDays(1)));

    private async Task<DashboardSection<T>> Read<T>(bool allowed, string source, Func<Task<T>> read) where T : class
    {
        if (!allowed) return new("restricted", null, "You do not have access to this information.");
        try { return new("ready", await read()); }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            logger.LogError(e, "HR dashboard source {Source} unavailable", source);
            return new("unavailable", null, "This information could not be loaded. Refresh to retry.");
        }
    }
    public async Task<HrDashboardDto> Get(string site, DateTime from, DateTime to, HrDashboardRights rights, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var today = PakistanToday(now); var tomorrow = today.AddDays(1); var end = to.AddDays(1); var horizon = today.AddDays(30);
        ValidatePeriod(from, to, today);
        var active = ActiveEmployees(site, today);
        var approved = db.HrmLeaveChildren.AsNoTracking().Where(l => l.Site == site && l.LeaveApprovalStatus == "Approved");
        var todayLeave = approved.Where(l => l.FromDate < tomorrow && l.ToDate >= today && l.EmpCardNo != null && active.Any(e => e.EmpCardNo == l.EmpCardNo));
        var workforce = await Read(rights.Employees, "workforce", async () => {
            var count = await active.CountAsync(ct);
            var missing = await db.Employees.CountAsync(e => e.Site == site && e.JoiningDate == null, ct);
            var months = await db.Employees.AsNoTracking().Where(e => e.Site == site && e.JoiningDate >= from && e.JoiningDate < end)
                .GroupBy(e => new { e.JoiningDate!.Value.Year, e.JoiningDate.Value.Month }).Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() }).ToListAsync(ct);
            var departmentCounts = await active.GroupBy(e => e.DeptCode).Select(g => new { Code = g.Key, Count = g.Count() }).ToListAsync(ct);
            var names = await db.Departments.AsNoTracking().Where(d => d.Site == site).Select(d => new { d.DepartmentCode, d.DepartmentName }).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName, ct);
            var groups = departmentCounts.Select(g => new DashboardCount(g.Code.HasValue && names.TryGetValue(g.Code.Value, out var name) && !string.IsNullOrWhiteSpace(name) ? name : "Unassigned", g.Count))
                .GroupBy(d => d.Label).Select(g => new DashboardCount(g.Key, g.Sum(x => x.Count))).OrderByDescending(d => d.Count).ThenBy(d => d.Label).ToList();
            if (groups.Count > 6) groups = groups.Take(5).Append(new DashboardCount("Other departments", groups.Skip(5).Sum(x => x.Count))).ToList();
            return new WorkforceOverview(count, missing, FillMonths(from, to, months.Select(m => new JoinerMonth($"{m.Year:D4}-{m.Month:D2}", m.Count))), groups);
        });
        var attendance = await Read(rights.Employees && rights.Attendance && rights.Leaves, "attendance", async () => {
            var ids = await active.Select(e => e.EmpCardNo).ToListAsync(ct);
            var rows = await db.AttendanceRegisters.AsNoTracking().Where(a => a.Site == site && a.AttendanceDate >= today && a.AttendanceDate < tomorrow && active.Any(e => e.EmpCardNo == a.EmpCardNo))
                .OrderBy(a => a.RecordNo).Select(a => new { a.EmpCardNo, a.AttnedanceType }).ToListAsync(ct);
            var leaveIds = (await todayLeave.Select(l => l.EmpCardNo!.Value).Distinct().ToListAsync(ct)).ToHashSet();
            return AttendanceBuckets(ids, rows.Select(a => (a.EmpCardNo!.Value, a.AttnedanceType)), leaveIds);
        });
        var leaves = await Read(rights.Leaves, "leave approvals", async () => new LeaveOverview(
            await todayLeave.Select(l => l.EmpCardNo).Distinct().CountAsync(ct),
            await LeaveApprovalQueries.Filter(db.HrmVewLeaves.AsNoTracking().Where(l => l.Site == site), "Pending", today.AddMonths(-1), today)
                .Select(l => new { l.ApplicationNo, l.EmpCardNo }).Distinct().CountAsync(ct), today.AddMonths(-1).ToString("yyyy-MM-dd"), today.ToString("yyyy-MM-dd")));
        var employeeActivity = await Read(rights.Employees, "employee activity", async () => {
            var rows = await db.Employees.AsNoTracking().Where(e => e.Site == site && e.EnteryTime >= from && e.EnteryTime < end)
                .OrderByDescending(e => e.EnteryTime).ThenBy(e => e.EmpCardNo).Take(12).Select(e => new { e.EmpCardNo, e.EmpName, e.EnteryTime, e.Status }).ToListAsync(ct);
            return rows.Select(e => new HrActivity($"employee-{e.EmpCardNo}", e.EmpName ?? "Employee", "Employee record created", e.EnteryTime!.Value, e.Status == true ? "Active" : "Inactive", "/hr/employees", e.EmpCardNo)).ToList();
        });
        var leaveActivity = await Read(rights.Leaves, "leave activity", async () => {
            var rows = await db.HrmVewLeaves.AsNoTracking().Where(l => l.Site == site && l.ApplicationDate >= from && l.ApplicationDate < end)
                .GroupBy(l => new { l.ApplicationNo, l.EmpCardNo, l.EmpName, l.ApplicationDate })
                .Select(g => new { g.Key.ApplicationNo, g.Key.EmpCardNo, g.Key.EmpName, g.Key.ApplicationDate,
                    Total = g.Count(), Pending = g.Count(l => l.LeaveApprovalStatus == null || l.LeaveApprovalStatus.Trim() == ""),
                    Approved = g.Count(l => l.LeaveApprovalStatus == "Approved"), Rejected = g.Count(l => l.LeaveApprovalStatus == "Rejected") })
                .OrderByDescending(l => l.ApplicationDate).ThenByDescending(l => l.ApplicationNo).Take(12).ToListAsync(ct);
            return rows.Select(l => new HrActivity($"leave-{l.ApplicationNo}-{l.EmpCardNo}", l.EmpName ?? "Employee", "Leave application submitted", l.ApplicationDate!.Value,
                l.Pending > 0 ? "Pending" : l.Approved == l.Total ? "Approved" : l.Rejected == l.Total ? "Rejected" : "Mixed", "/hr/leave-approval", rights.Employees ? l.EmpCardNo : null)).ToList();
        });
        var holidays = await Read(rights.Holidays, "gazetted holidays", async () => {
            var rows = await db.GazettedLeaves.AsNoTracking().Where(h => h.Site == site && h.LeaveDate >= today && h.LeaveDate < horizon)
                .OrderBy(h => h.LeaveDate).ThenBy(h => h.LeaveId).Select(h => new { h.LeaveId, h.LeaveName, h.LeaveDate }).Take(50).ToListAsync(ct);
            return rows.DistinctBy(h => (h.LeaveName, h.LeaveDate?.Date)).Select(h => new HrEvent($"holiday-{h.LeaveId}", h.LeaveName ?? "Gazetted holiday", "Gazetted holiday", h.LeaveDate!.Value.Date, "holiday", "/hr/gazetted-leaves")).ToList();
        });
        var scheduled = await Read(rights.Leaves, "scheduled leave", async () => {
            var rows = await db.HrmVewLeaves.AsNoTracking().Where(l => l.Site == site && l.LeaveApprovalStatus == "Approved" && l.FromDate >= today && l.FromDate < horizon && active.Any(e => e.EmpCardNo == l.EmpCardNo))
                .OrderBy(l => l.FromDate).ThenBy(l => l.SerialNo).Select(l => new { l.ApplicationNo, l.EmpCardNo, l.EmpName, l.FromDate }).Take(50).ToListAsync(ct);
            return rows.DistinctBy(l => (l.EmpCardNo, l.FromDate?.Date)).Select(l => new HrEvent($"leave-{l.ApplicationNo}-{l.EmpCardNo}-{l.FromDate:yyyyMMdd}", "Approved leave begins", l.EmpName ?? "Employee", l.FromDate!.Value.Date, "leave", "/hr/leave-approval")).ToList();
        });
        return new(today.ToString("yyyy-MM-dd"), from.ToString("yyyy-MM-dd"), to.ToString("yyyy-MM-dd"), "Asia/Karachi", now,
            workforce, attendance, leaves, employeeActivity, leaveActivity, holidays, scheduled);
    }
}
