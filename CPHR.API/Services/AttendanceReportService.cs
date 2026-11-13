using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SaftHR.API.Interface;
using SaftHR.API.Models;
using SaftHR.API.Services.AttendanceReports;
using SaftHR.API.Utilities;

namespace SaftHR.API.Services
{
    public class AttendanceReportService
    {
        private readonly HRMSDbContext _db;
        private readonly ISiteInfoService? _siteInfoService;

        public AttendanceReportService(HRMSDbContext db, ISiteInfoService? siteInfoService = null)
        {
            _db = db;
            _siteInfoService = siteInfoService;
        }

        private async Task<string> ResolveSiteFullNameAsync(string site)
        {
            if (_siteInfoService != null)
            {
                return await _siteInfoService.GetSiteFullNameAsync(site);
            }
            return "CoolPoint";
        }

        #region Helper Methods

        /// <summary>
        /// Determines the display status for an attendance record (Absent, Late, Early Gone, Present, custom type, or -).
        /// </summary>
        private static string GetDisplayStatus(VewDailyAttendance item, string? filterStatus = null)
        {
            if (item.Absent == true || item.AttendanceType == "A")
                return "Absent";

            bool isLate = item.LateArrival == 1 || (item.LateMinutes ?? 0) > 0;
            bool isEarly = item.EarlyGoing == 1 || (item.EarlyMinutes ?? 0) > 0;

            if (!string.IsNullOrEmpty(filterStatus))
            {
                var f = filterStatus.Trim().ToLowerInvariant();
                if (f == "early going" || f == "early")
                {
                    if (isEarly && isLate) return "Late / Early";
                    if (isEarly) return "Early Gone";
                }
                else if (f == "late arrival" || f == "late")
                {
                    if (isLate && isEarly) return "Late / Early";
                    if (isLate) return "Late";
                }
            }

            if (isLate && isEarly)
                return "Late / Early";
            if (isEarly)
                return "Early Gone";
            if (isLate)
                return "Late";
            if (item.AttendanceType == "P" || !string.IsNullOrWhiteSpace(item.InTime))
                return "Present";
            if (!string.IsNullOrWhiteSpace(item.AttendanceType) &&
                !string.Equals(item.AttendanceType, "Machine", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(item.AttendanceType, "Manual", StringComparison.OrdinalIgnoreCase))
                return item.AttendanceType;

            return "-";
        }

        /// <summary>
        /// Loads active employees for a given site and optional category.
        /// </summary>
        private async Task<List<Employee>> GetActiveEmployeesAsync(string site, string? category)
        {
            var empQuery = _db.Employees.AsNoTracking().Where(e => e.Site == site && e.Status == true && (e.StuckOff == false || e.StuckOff == null));
            if (!string.IsNullOrEmpty(category) && !string.Equals(category, "all", StringComparison.OrdinalIgnoreCase))
            {
                empQuery = empQuery.Where(e => e.Category == category);
            }
            return await empQuery.OrderBy(e => e.EmpCardNo).ToListAsync();
        }

        /// <summary>
        /// Loads department dictionary (code -> name) for a given site.
        /// </summary>
        private async Task<Dictionary<int, string>> GetDepartmentDictionaryAsync(string site)
        {
            return await _db.Departments.AsNoTracking()
                .Where(d => d.Site == site)
                .ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
        }

        /// <summary>
        /// Reusable rendering engine for monthly detail reports (Report 6 & Report 7).
        /// </summary>
        private static Document BuildMonthlyDetailReport(
            string reportTitle,
            DateTime fromDate,
            DateTime toDate,
            List<Employee> employees,
            Dictionary<int, string> deptDict,
            List<DateTime> monthsList,
            string subHeader1,
            string subHeader2,
            Func<int, DateTime, (string col1, string col2, double val1, double val2)> getMonthlyValues,
            Func<double, double, (string total1, string total2)> formatTotals,
            string? siteFullName = null)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Landscape(), defaultFontSize: 7.5f, defaultFontColor: Colors.Black);
                    page.Header().RenderSchoolSimpleHeader($"{reportTitle} From {fromDate:dd-MM-yyyy} To {toDate:dd-MM-yyyy}", schoolName: siteFullName ?? "CoolPoint");

                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);  // Sr
                                columns.ConstantColumn(40);  // Card No
                                columns.RelativeColumn(1.8f); // Name
                                columns.RelativeColumn(1.8f); // Department
                                foreach (var _ in monthsList)
                                {
                                    columns.RelativeColumn(0.6f);
                                    columns.RelativeColumn(0.6f);
                                }
                                columns.RelativeColumn(0.7f); // Total Col 1
                                columns.RelativeColumn(0.7f); // Total Col 2
                            });

                            table.Header(header =>
                            {
                                header.Cell().RowSpan(2).BorderedCell().AlignCenter().AlignMiddle().Text("Sr.").Bold();
                                header.Cell().RowSpan(2).BorderedCell().AlignCenter().AlignMiddle().Text("Card No").Bold();
                                header.Cell().RowSpan(2).BorderedCell().AlignLeft().AlignMiddle().Text("Name").Bold();
                                header.Cell().RowSpan(2).BorderedCell().AlignLeft().AlignMiddle().Text("Department").Bold();

                                foreach (var month in monthsList)
                                {
                                    header.Cell().ColumnSpan(2).BorderedCell().AlignCenter().Text(month.ToString("MMM-yy")).Bold();
                                }
                                header.Cell().ColumnSpan(2).BorderedCell().AlignCenter().Text("Total").Bold();

                                foreach (var _ in monthsList)
                                {
                                    header.Cell().BorderedCell(padding: 2f).AlignCenter().Text(subHeader1).Bold();
                                    header.Cell().BorderedCell(padding: 2f).AlignCenter().Text(subHeader2).Bold();
                                }
                                header.Cell().BorderedCell(padding: 2f).AlignCenter().Text(subHeader1).Bold();
                                header.Cell().BorderedCell(padding: 2f).AlignCenter().Text(subHeader2).Bold();
                            });

                            int srNo = 1;
                            foreach (var emp in employees)
                            {
                                string dName = deptDict.TryGetValue(emp.DeptCode ?? 0, out var d) ? d : "";
                                table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(srNo.ToString());
                                table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(emp.EmpCardNo.ToString());
                                table.Cell().BorderedCell(padding: 2f).Text(emp.EmpName ?? "");
                                table.Cell().BorderedCell(padding: 2f).Text(dName);

                                double grandVal1 = 0;
                                double grandVal2 = 0;

                                foreach (var month in monthsList)
                                {
                                    var (col1, col2, v1, v2) = getMonthlyValues(emp.EmpCardNo, month);
                                    table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(col1);
                                    table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(col2);

                                    grandVal1 += v1;
                                    grandVal2 += v2;
                                }

                                var (tot1, tot2) = formatTotals(grandVal1, grandVal2);
                                table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(tot1).Bold();
                                table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(tot2).Bold();

                                srNo++;
                            }
                        });
                    });
                });
            });
        }

        #endregion

        #region 1. Daily Attendance Report

        public async Task<byte[]> GenerateDailyAttendanceReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            string? status,
            string? deptCode,
            int? desigCode,
            bool? isManual,
            int? empCardNo)
        {
            var start = fromDate.Date;
            var endExclusive = toDate.Date.AddDays(1); // Covers entire toDate day: Attendance_Date >= start AND Attendance_Date < endExclusive

            // 1. Query Attendance_Register as primary source (matching user's query: AttnedanceType = 'A' on Attendance_Register)
            var regQuery = _db.AttendanceRegisters.AsNoTracking()
                .Where(r => r.AttendanceDate >= start && r.AttendanceDate < endExclusive);

            if (empCardNo.HasValue)
            {
                regQuery = regQuery.Where(r => r.EmpCardNo == empCardNo.Value);
            }
            else if (!string.IsNullOrWhiteSpace(site) && !string.Equals(site, "all", StringComparison.OrdinalIgnoreCase))
            {
                regQuery = regQuery.Where(r => r.Site == null || r.Site == "" || r.Site.ToLower() == site.ToLower());
            }

            // Apply Status Filter directly on Attendance_Register
            if (!string.IsNullOrEmpty(status) && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
            {
                var s = status.Trim().ToLowerInvariant();
                if (s == "absent" || s == "a")
                    regQuery = regQuery.Where(r => r.AttnedanceType == "A");
                else if (s == "present" || s == "p")
                    regQuery = regQuery.Where(r => r.AttnedanceType == "P");
                else if (s == "late arrival" || s == "late")
                    regQuery = regQuery.Where(r => r.LateArrival == 1 || (r.TotalLate ?? 0) > 0);
                else if (s == "early going" || s == "early")
                    regQuery = regQuery.Where(r => r.EarlyGone == 1);
            }

            var regList = await regQuery.OrderBy(r => r.AttendanceDate).ThenBy(r => r.EmpCardNo).ToListAsync();

            int? filterDeptCodeInt = int.TryParse(deptCode, out int parsedDCode) ? parsedDCode : null;
            string? filterDeptName = null;
            if (filterDeptCodeInt.HasValue)
            {
                filterDeptName = await _db.Departments.AsNoTracking()
                    .Where(d => d.DepartmentCode == filterDeptCodeInt.Value && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || d.Site == site))
                    .Select(d => d.DepartmentName)
                    .FirstOrDefaultAsync();
            }

            List<VewDailyAttendance> data;

            if (regList.Count > 0)
            {
                // Fetch Employee details for card numbers in regList
                var empCards = regList.Where(r => r.EmpCardNo.HasValue).Select(r => r.EmpCardNo!.Value).Distinct().ToList();

                var empList = await _db.VewEmployees.AsNoTracking()
                    .Where(e => empCards.Contains(e.EmpCardNo))
                    .ToListAsync();

                var empDict = empList
                    .GroupBy(e => e.EmpCardNo)
                    .ToDictionary(g => g.Key, g => g.First());

                // Fetch punch in/out times from DailyAttendance or MachineAttendance if available
                var dailyPunches = await _db.DailyAttendances.AsNoTracking()
                    .Where(d => d.AttendanceDate >= start && d.AttendanceDate < endExclusive && d.EmpCardNo.HasValue && empCards.Contains(d.EmpCardNo.Value))
                    .ToListAsync();

                var punchDict = dailyPunches
                    .Where(d => d.AttendanceDate.HasValue && d.EmpCardNo.HasValue)
                    .GroupBy(d => (d.EmpCardNo!.Value, d.AttendanceDate!.Value.Date))
                    .ToDictionary(g => g.Key, g => g.First());

                var nowPkt = EveningShiftPolicy.GetNowPakistan();
                data = new List<VewDailyAttendance>();

                foreach (var reg in regList)
                {
                    if (!reg.EmpCardNo.HasValue) continue;
                    int cardNo = reg.EmpCardNo.Value;
                    DateTime attDate = reg.AttendanceDate?.Date ?? start;

                    empDict.TryGetValue(cardNo, out var emp);

                    punchDict.TryGetValue((cardNo, attDate), out var punch);

                    // Evening shift employees before 3:00 PM on today with no real punch are not listed
                    bool hasRealPunch = punch != null && (punch.InDate.HasValue || punch.OutDate.HasValue);
                    if (!hasRealPunch
                        && (reg.AttnedanceType == "A" || (reg.TotalDays ?? 0) == 0)
                        && EveningShiftPolicy.IsEveningShift(emp?.Shift)
                        && EveningShiftPolicy.ShouldHideUnpunchedEvening(attDate, nowPkt))
                    {
                        continue;
                    }

                    // Apply Department filter if specified (matching numeric deptCode or DepartmentName)
                    if (!string.IsNullOrEmpty(deptCode) && !string.Equals(deptCode, "all", StringComparison.OrdinalIgnoreCase))
                    {
                        if (emp == null) continue;

                        bool matchesDept = false;
                        if (filterDeptCodeInt.HasValue && emp.DeptCode == filterDeptCodeInt.Value)
                            matchesDept = true;
                        else if (!string.IsNullOrEmpty(filterDeptName) && string.Equals(emp.DepartmentName, filterDeptName, StringComparison.OrdinalIgnoreCase))
                            matchesDept = true;
                        else if (string.Equals(emp.DepartmentName, deptCode, StringComparison.OrdinalIgnoreCase))
                            matchesDept = true;

                        if (!matchesDept)
                            continue;
                    }

                    // Apply Designation filter if specified
                    if (desigCode.HasValue)
                    {
                        if (emp != null && emp.DesgCode != desigCode.Value)
                            continue;
                    }

                    // Apply isManual filter if specified
                    if (isManual == true)
                    {
                        bool isRecordManual = string.Equals(reg.AttnedanceType, "manual", StringComparison.OrdinalIgnoreCase)
                                           || string.Equals(punch?.Remarks, "manual", StringComparison.OrdinalIgnoreCase);
                        if (!isRecordManual) continue;
                    }

                    string inTimeStr = "-";
                    string outTimeStr = "-";

                    if (punch != null)
                    {
                        if (punch.InDate.HasValue && punch.InDate.Value.Year > 1900) inTimeStr = punch.InDate.Value.ToString("HH:mm");
                        if (punch.OutDate.HasValue && punch.OutDate.Value.Year > 1900) outTimeStr = punch.OutDate.Value.ToString("HH:mm");
                    }

                    bool isAbsent = reg.AttnedanceType == "A";
                    string remarks = isAbsent ? "Absent" : (punch?.Remarks ?? (reg.AttnedanceType == "P" ? "Present" : reg.AttnedanceType ?? ""));

                    data.Add(new VewDailyAttendance
                    {
                        EmpCardNo = cardNo,
                        EmpName = emp?.EmpName ?? $"Emp #{cardNo}",
                        DepartmentName = emp?.DepartmentName ?? "-",
                        DesignationName = emp?.DesignationName ?? "-",
                        AttendanceDate = attDate,
                        InTime = inTimeStr,
                        OutTime = outTimeStr,
                        AttendanceType = reg.AttnedanceType,
                        Absent = isAbsent,
                        LateArrival = reg.LateArrival,
                        EarlyGoing = reg.EarlyGone,
                        Remarks = remarks
                    });
                }
            }
            else
            {
                // Fallback if Attendance_Register has not been updated yet for this date
                var fallbackQuery = _db.VewDailyAttendances.AsNoTracking()
                    .Where(a => a.AttendanceDate >= start && a.AttendanceDate < endExclusive);

                if (empCardNo.HasValue) fallbackQuery = fallbackQuery.Where(a => a.EmpCardNo == empCardNo.Value);
                if (!string.IsNullOrEmpty(deptCode) && !string.Equals(deptCode, "all", StringComparison.OrdinalIgnoreCase))
                {
                    if (!string.IsNullOrEmpty(filterDeptName))
                    {
                        fallbackQuery = fallbackQuery.Where(a => a.DepartmentName == filterDeptName || a.DepartmentName == deptCode);
                    }
                    else
                    {
                        fallbackQuery = fallbackQuery.Where(a => a.DepartmentName == deptCode);
                    }
                }

                if (isManual == true)
                {
                    fallbackQuery = fallbackQuery.Where(a => a.Remarks == "Manual" || a.AttendanceType == "Manual");
                }

                if (!string.IsNullOrEmpty(status) && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
                {
                    var s = status.Trim().ToLowerInvariant();
                    if (s == "present" || s == "p") fallbackQuery = fallbackQuery.Where(a => a.AttendanceType == "P" || (a.Absent != true && a.AttendanceType != "A" && a.InTime != null));
                    else if (s == "absent" || s == "a") fallbackQuery = fallbackQuery.Where(a => a.AttendanceType == "A" || a.Absent == true);
                    else if (s == "late arrival" || s == "late") fallbackQuery = fallbackQuery.Where(a => a.LateArrival == 1 || (a.LateMinutes ?? 0) > 0);
                    else if (s == "early going" || s == "early") fallbackQuery = fallbackQuery.Where(a => a.EarlyGoing == 1 || (a.EarlyMinutes ?? 0) > 0);
                }

                data = await fallbackQuery.OrderBy(a => a.AttendanceDate).ThenBy(a => a.EmpCardNo).ToListAsync();

                var nowPkt = EveningShiftPolicy.GetNowPakistan();
                data = data.Where(a =>
                {
                    var attDate = a.AttendanceDate?.Date ?? start;
                    if (EveningShiftPolicy.IsEveningShift(a.Shift) && EveningShiftPolicy.ShouldHideUnpunchedEvening(attDate, nowPkt))
                    {
                        bool hasPunch = a.InDate.HasValue || a.OutDate.HasValue || (!string.IsNullOrWhiteSpace(a.InTime) && a.InTime != "-") || (!string.IsNullOrWhiteSpace(a.OutTime) && a.OutTime != "-");
                        if (!hasPunch || a.Absent == true || a.AttendanceType == "A")
                        {
                            return false;
                        }
                    }
                    return true;
                }).ToList();
            }

            var groupedData = data
                .GroupBy(d => {
                    var name = d.DepartmentName?.Trim();
                    if (string.IsNullOrEmpty(name) || name == "-")
                        return "Unassigned Department";
                    return name;
                })
                .OrderBy(g => g.Key == "Unassigned Department" ? "ZZZZ" : g.Key)
                .ToList();

            var siteFullName = await ResolveSiteFullNameAsync(site);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Portrait());
                    page.Header().RenderStandardHeader("Daily Attendance Report", site, $"{fromDate:dd MMM yyyy} to {toDate:dd MMM yyyy}", siteFullName);

                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);  // Sr
                                columns.ConstantColumn(40);  // Card
                                columns.RelativeColumn(2.5f);// Name
                                columns.RelativeColumn(2f);  // Designation
                                columns.ConstantColumn(65);  // Date
                                columns.ConstantColumn(45);  // In Time
                                columns.ConstantColumn(45);  // Out Time
                                columns.ConstantColumn(55);  // Status
                                columns.RelativeColumn(1.5f);// Remarks
                            });

                            table.Header(header =>
                            {
                                header.Cell().HeaderCell().AlignCenter().Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Card").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Name").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Date").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("In").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Out").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().AlignCenter().Text("Status").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Remarks").Bold().FontColor(Colors.White);
                            });

                            if (data.Count == 0)
                            {
                                table.RenderEmptyState(9, "No daily attendance records found.");
                            }
                            else
                            {
                                foreach (var group in groupedData)
                                {
                                    var deptName = group.Key;
                                    int deptCount = group.Count();
                                    int presentCount = group.Count(x => {
                                        var st = GetDisplayStatus(x, status);
                                        return st == "Present" || st == "Late" || st == "Early Gone" || st == "Late / Early";
                                    });
                                    int absentCount = group.Count(x => GetDisplayStatus(x, status) == "Absent");

                                    table.Cell().ColumnSpan(9)
                                        .Background("#EFF6FF")
                                        .BorderTop(1).BorderBottom(1).BorderColor("#BFDBFE")
                                        .PaddingVertical(4)
                                        .PaddingHorizontal(6)
                                        .Row(deptRow =>
                                        {
                                            deptRow.RelativeItem().Text(t =>
                                            {
                                                t.Span("Department: ").Bold().FontSize(9).FontColor("#1E3A8A");
                                                t.Span(deptName).Bold().FontSize(9.5f).FontColor("#1E40AF");
                                            });
                                            deptRow.AutoItem().AlignRight().Text(t =>
                                            {
                                                t.Span($"Total: {deptCount}  |  Present: {presentCount}  |  Absent: {absentCount}")
                                                    .SemiBold().FontSize(8f).FontColor("#1E3A8A");
                                            });
                                        });

                                    int srNo = 1;
                                    foreach (var item in group.OrderBy(a => a.AttendanceDate).ThenBy(a => a.EmpCardNo))
                                    {
                                        table.Cell().RowCell(srNo).Text(srNo.ToString()).AlignCenter();
                                        table.Cell().RowCell(srNo).Text(item.EmpCardNo.ToString()).FontFamily("Courier New");
                                        table.Cell().RowCell(srNo).Text(item.EmpName ?? "").Bold();
                                        table.Cell().RowCell(srNo).Text(item.DesignationName ?? "-");
                                        table.Cell().RowCell(srNo).Text(item.AttendanceDate?.ToString("dd-MMM-yyyy") ?? "");
                                        table.Cell().RowCell(srNo).Text(item.InTime ?? "-");
                                        table.Cell().RowCell(srNo).Text(item.OutTime ?? "-");
                                        table.Cell().RowCell(srNo).Text(GetDisplayStatus(item, status)).AlignCenter();
                                        table.Cell().RowCell(srNo).Text(item.Remarks ?? "");
                                        srNo++;
                                    }
                                }

                                int grandPresent = data.Count(x => {
                                    var st = GetDisplayStatus(x, status);
                                    return st == "Present" || st == "Late" || st == "Early Gone" || st == "Late / Early";
                                });
                                int grandAbsent = data.Count(x => GetDisplayStatus(x, status) == "Absent");

                                table.Cell().ColumnSpan(9)
                                    .Background(Colors.Grey.Lighten3)
                                    .BorderTop(1).BorderColor(Colors.Grey.Medium)
                                    .PaddingVertical(5)
                                    .PaddingHorizontal(6)
                                    .Row(summaryRow =>
                                    {
                                        summaryRow.RelativeItem().Text(t =>
                                        {
                                            t.Span("Grand Total: ").Bold().FontSize(8.5f);
                                            t.Span($"{data.Count} Record{(data.Count == 1 ? "" : "s")}").Bold().FontSize(8.5f);
                                        });
                                        summaryRow.AutoItem().AlignRight().Text(t =>
                                        {
                                            t.Span($"Total Present: {grandPresent}   |   Total Absent: {grandAbsent}").Bold().FontSize(8.5f);
                                        });
                                    });
                            }
                        });
                    });

                    page.Footer().RenderStandardFooter();
                });
            }).GeneratePdf();
        }

        #endregion

        #region 2. Machine Attendance Report

        public async Task<byte[]> GenerateMachineAttendanceReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            int? empCardNo)
        {
            var query = _db.MachineAttendances.AsNoTracking().Where(a => a.AttendanceDate >= fromDate && a.AttendanceDate <= toDate);
            if (empCardNo.HasValue) query = query.Where(a => a.EmpCardNo == empCardNo.Value);

            var data = await query.OrderBy(a => a.AttendanceDate).ThenBy(a => a.EmpCardNo).ToListAsync();

            var siteFullName = await ResolveSiteFullNameAsync(site);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Portrait());
                    page.Header().RenderStandardHeader("Machine Attendance Report", site, $"{fromDate:dd MMM yyyy} to {toDate:dd MMM yyyy}", siteFullName);

                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);  // Sr
                                columns.ConstantColumn(50);  // Card
                                columns.ConstantColumn(80);  // Date
                                columns.ConstantColumn(60);  // In Time
                                columns.ConstantColumn(60);  // Out Time
                                columns.ConstantColumn(50);  // Hours
                                columns.RelativeColumn(1);   // Remarks
                            });

                            table.Header(header =>
                            {
                                header.Cell().HeaderCell().Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Date").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("In").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Out").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Late Min").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().HeaderCell().Text("Remarks").Bold().FontColor(Colors.White);
                            });

                            int srNo = 1;
                            foreach (var item in data)
                            {
                                table.Cell().RowCell(srNo).Text(srNo.ToString()).AlignCenter();
                                table.Cell().RowCell(srNo).Text(item.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().RowCell(srNo).Text(item.AttendanceDate?.ToString("dd-MMM-yyyy") ?? "");
                                table.Cell().RowCell(srNo).Text(item.InDate?.ToString("HH:mm") ?? "-");
                                table.Cell().RowCell(srNo).Text(item.OutDate?.ToString("HH:mm") ?? "-");
                                table.Cell().RowCell(srNo).Text((item.LateMinutes ?? 0).ToString("0")).AlignRight();
                                table.Cell().RowCell(srNo).Text(item.Remarks ?? "");
                                srNo++;
                            }

                            if (data.Count == 0) table.RenderEmptyState(7, "No machine attendance records found.");
                        });
                    });

                    page.Footer().RenderStandardFooter();
                });
            }).GeneratePdf();
        }

        #endregion

        #region 3. Attendance Register Report

        public async Task<byte[]> GenerateAttendanceRegisterReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            int? empCardNo)
        {
            var from = fromDate.Date;
            var to = toDate.Date;

            // Generate list of days in the period
            var daysList = new List<DateTime>();
            for (var d = from; d <= to; d = d.AddDays(1))
            {
                daysList.Add(d);
            }

            // Query active employees for this site
            var empQuery = _db.Employees.AsNoTracking()
                .Where(e => (e.Site == site || string.IsNullOrEmpty(site) || site.ToLower() == "all") 
                         && e.Status == true 
                         && (e.StuckOff == false || e.StuckOff == null));
            if (empCardNo.HasValue)
            {
                empQuery = empQuery.Where(e => e.EmpCardNo == empCardNo.Value);
            }
            var employees = await empQuery.OrderBy(e => e.EmpCardNo).ToListAsync();

            // Query attendance register records
            var attQuery = _db.AttendanceRegisters.AsNoTracking()
                .Where(a => a.AttendanceDate >= from && a.AttendanceDate <= to);
            if (!string.IsNullOrEmpty(site) && !string.Equals(site, "all", StringComparison.OrdinalIgnoreCase))
            {
                attQuery = attQuery.Where(a => a.Site == site || a.Site == null || a.Site == "");
            }
            if (empCardNo.HasValue)
            {
                attQuery = attQuery.Where(a => a.EmpCardNo == empCardNo.Value);
            }
            var attendanceRecords = await attQuery.ToListAsync();

            // Also check VewAttendanceRegisters as fallback if needed
            var vewRecords = await _db.VewAttendanceRegisters.AsNoTracking()
                .Where(a => a.AttendanceDate >= from && a.AttendanceDate <= to && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || a.Site == site))
                .ToListAsync();

            var oneOffRestDays = await _db.HrmRestDayChildren.AsNoTracking()
                .Where(r => r.RestDate >= from && r.RestDate <= to
                    && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || r.Site == site))
                .Select(r => new { r.Site, r.EmpCardNo, RestDate = r.RestDate.Date })
                .ToListAsync();
            var oneOffRestDayLookup = oneOffRestDays
                .Select(r => (r.Site, r.EmpCardNo, r.RestDate))
                .ToHashSet();

            // Build attendance lookup dictionary: (empCardNo, date) -> AttnedanceType
            var attDict = new Dictionary<(int, DateTime), string>();
            foreach (var r in attendanceRecords)
            {
                if (r.EmpCardNo.HasValue && r.EmpCardNo.Value > 0 && r.AttendanceDate.HasValue)
                {
                    var key = (r.EmpCardNo.Value, r.AttendanceDate.Value.Date);
                    if (!attDict.ContainsKey(key))
                    {
                        attDict[key] = (r.AttnedanceType ?? "").Trim().ToUpper();
                    }
                }
            }
            foreach (var r in vewRecords)
            {
                if (r.EmpCardNo.HasValue && r.AttendanceDate.HasValue)
                {
                    var key = (r.EmpCardNo.Value, r.AttendanceDate.Value.Date);
                    if (!attDict.ContainsKey(key) || string.IsNullOrEmpty(attDict[key]))
                    {
                        attDict[key] = (r.AttnedanceType ?? "").Trim().ToUpper();
                    }
                }
            }

            // Department dictionary
            var deptDict = await _db.Departments.AsNoTracking()
                .Where(d => string.IsNullOrEmpty(site) || site.ToLower() == "all" || d.Site == site)
                .ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");

            var siteFullName = await ResolveSiteFullNameAsync(site);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Landscape(), marginCm: 0.8f, defaultFontSize: 6.5f, defaultFontColor: Colors.Black);

                    page.Header().Column(headerCol =>
                    {
                        headerCol.Item().Row(r =>
                        {
                            r.RelativeItem().Text(siteFullName ?? "CoolPoint").Bold().FontSize(12).FontColor(Colors.Black);
                            r.ConstantItem(250).AlignRight().Text($"Attendance Register: {from:dd MMM yyyy} to {to:dd MMM yyyy}").Bold().FontSize(8.5f).FontColor(Colors.Black);
                        });
                        headerCol.Item().PaddingBottom(4).LineHorizontal(0.5f).LineColor(Colors.Black);
                    });

                    page.Content().PaddingVertical(4).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(28);  // Emp ID
                                columns.RelativeColumn(1.6f); // Name
                                columns.RelativeColumn(1.6f); // Department
                                columns.RelativeColumn(1.8f); // Salary Category
                                foreach (var _ in daysList)
                                {
                                    columns.RelativeColumn(0.45f); // Day columns
                                }
                                columns.ConstantColumn(24);  // Days Total
                            });

                            table.Header(header =>
                            {
                                header.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text("Emp.\nID").Bold().FontSize(6.5f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text("Name").Bold().FontSize(6.5f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text("Department").Bold().FontSize(6.5f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text("Salary Category").Bold().FontSize(6.5f);

                                foreach (var day in daysList)
                                {
                                    header.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(1f).AlignCenter().AlignMiddle().Text(day.Day.ToString()).Bold().FontSize(6.5f);
                                }

                                header.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text("Days").Bold().FontSize(6.5f);
                            });

                            foreach (var emp in employees)
                            {
                                string dName = deptDict.TryGetValue(emp.DeptCode ?? 0, out var d) ? d : "";
                                string catName = emp.Category ?? "";

                                table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text(emp.EmpCardNo.ToString()).FontSize(6.5f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignLeft().AlignMiddle().Text(emp.EmpName ?? "").FontSize(6f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignLeft().AlignMiddle().Text(dName).FontSize(6f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignLeft().AlignMiddle().Text(catName).FontSize(6f);

                                int presentCount = 0;
                                foreach (var day in daysList)
                                {
                                    attDict.TryGetValue((emp.EmpCardNo, day.Date), out var attType);
                                    string code = string.IsNullOrWhiteSpace(attType) ? "-" : attType.Trim().ToUpper();

                                    // Keep the attendance register report consistent with attendance
                                    // generation: employee weekly schedules and one-off rest-day
                                    // transactions both take precedence for rest-day cells.
                                    bool isConfiguredRestDay = emp.JoiningDate <= day &&
                                        (RestDaySchedule.IsExplicitSchedule(emp.RestDay)
                                            ? RestDaySchedule.Includes(emp.RestDay, day.DayOfWeek)
                                            : RestDaySchedule.Includes(emp.RestDay, day.DayOfWeek)
                                                || day.DayOfWeek == DayOfWeek.Sunday
                                                || emp.DesgCode == 1 && day.DayOfWeek == DayOfWeek.Saturday);
                                    if (oneOffRestDayLookup.Contains((emp.Site, emp.EmpCardNo, day.Date)) || isConfiguredRestDay)
                                    {
                                        code = "R";
                                    }
                                    else if (code == "P" || code == "PRESENT")
                                    {
                                        code = "P";
                                        presentCount++;
                                    }
                                    else if (code == "A" || code == "ABSENT")
                                    {
                                        code = "A";
                                    }
                                    else if (code == "R" || code == "REST" || code == "OFF" || code == "SUNDAY")
                                    {
                                        code = "R";
                                    }
                                    else if (code.Length > 2)
                                    {
                                        code = code.Substring(0, 1);
                                    }

                                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(1f).AlignCenter().AlignMiddle().Text(code).FontSize(6f);
                                }

                                table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2f).AlignCenter().AlignMiddle().Text(presentCount.ToString()).FontSize(6.5f);
                            }

                            if (employees.Count == 0)
                            {
                                table.Cell().ColumnSpan((uint)(5 + daysList.Count)).Border(0.5f).BorderColor(Colors.Black).Padding(15).AlignCenter().Text("No attendance register records found.").Italic();
                            }
                        });

                        col.Item().PaddingTop(6).Row(row =>
                        {
                            row.RelativeItem().Text(t =>
                            {
                                t.Span("Total Employees ===>>  ").Bold().FontSize(8f);
                                t.Span(employees.Count.ToString()).Bold().FontSize(8.5f);
                            });
                        });
                    });

                    page.Footer().RenderStandardFooter();
                });
            }).GeneratePdf();
        }

        #endregion

        #region 4. Overtime Report

        public async Task<byte[]> GenerateOvertimeReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            int? empCardNo)
        {
            var query = _db.VewOverTimes.AsNoTracking().Where(a => a.OverTimeDate >= fromDate && a.OverTimeDate <= toDate && a.Site == site);
            if (empCardNo.HasValue) query = query.Where(a => a.EmpCardNo == empCardNo.Value);

            var data = await query.OrderBy(a => a.EmpCardNo).ThenBy(a => a.OverTimeDate).ToListAsync();

            var siteFullName = await ResolveSiteFullNameAsync(site);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Portrait());
                    page.Header().RenderStandardHeader("Overtime Summary", site, $"{fromDate:dd MMM yyyy} to {toDate:dd MMM yyyy}", siteFullName);

                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);  // Sr
                                columns.ConstantColumn(40);  // Card
                                columns.RelativeColumn(2);   // Name
                                columns.RelativeColumn(2);   // Department
                                columns.ConstantColumn(70);  // Date
                                columns.ConstantColumn(50);  // OT Hours
                                columns.ConstantColumn(60);  // OT Amount
                            });

                            table.Header(header =>
                            {
                                header.Cell().HeaderCell().Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Card").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Name").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Date").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Hours").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().HeaderCell().Text("Amount").Bold().FontColor(Colors.White).AlignRight();
                            });

                            int srNo = 1;
                            decimal totalHours = 0;
                            decimal totalAmount = 0;

                            foreach (var item in data)
                            {
                                table.Cell().RowCell(srNo).Text(srNo.ToString()).AlignCenter();
                                table.Cell().RowCell(srNo).Text(item.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().RowCell(srNo).Text(item.EmpName ?? "").Bold();
                                table.Cell().RowCell(srNo).Text(item.DepartmentName ?? "");
                                table.Cell().RowCell(srNo).Text(item.OverTimeDate?.ToString("dd-MMM-yyyy") ?? "");
                                table.Cell().RowCell(srNo).Text((item.OverTime ?? 0).ToString("F1")).AlignRight();
                                table.Cell().RowCell(srNo).Text((item.OverTimeAmount ?? 0).ToString("N0")).AlignRight();

                                totalHours += item.OverTime ?? 0;
                                totalAmount += item.OverTimeAmount ?? 0;
                                srNo++;
                            }

                            table.Cell().ColumnSpan(5).Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Grand Total").Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(totalHours.ToString("F1")).Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(totalAmount.ToString("N0")).Bold();

                            if (data.Count == 0) table.RenderEmptyState(7, "No overtime records found.");
                        });
                    });

                    page.Footer().RenderStandardFooter();
                });
            }).GeneratePdf();
        }

        #endregion

        #region 5. Employee Time Card Report

        public async Task<byte[]> GenerateEmployeeTimeCardReportAsync(
            string site,
            int empCardNo,
            DateTime fromDate,
            DateTime toDate)
        {
            var emp = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmpCardNo == empCardNo && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || e.Site == site));
            if (emp == null) throw new Exception($"Employee with Card No {empCardNo} not found.");

            var deptName = await _db.Departments.AsNoTracking().Where(d => d.DepartmentCode == emp.DeptCode && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || d.Site == site)).Select(d => d.DepartmentName).FirstOrDefaultAsync() ?? "";

            var dailyAttList = await _db.DailyAttendances.AsNoTracking()
                .Where(d => d.EmpCardNo == empCardNo && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || d.Site == site) && d.AttendanceDate >= fromDate && d.AttendanceDate <= toDate)
                .ToListAsync();

            var machineAttList = await _db.MachineAttendances.AsNoTracking()
                .Where(m => m.EmpCardNo == empCardNo && m.AttendanceDate >= fromDate && m.AttendanceDate <= toDate)
                .ToListAsync();

            var vewAttList = await _db.VewDailyAttendances.AsNoTracking()
                .Where(a => a.EmpCardNo == empCardNo && a.AttendanceDate >= fromDate && a.AttendanceDate <= toDate)
                .ToListAsync();

            var regList = await _db.AttendanceRegisters.AsNoTracking()
                .Where(r => r.EmpCardNo == empCardNo && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || r.Site == site) && r.AttendanceDate >= fromDate && r.AttendanceDate <= toDate)
                .ToListAsync();

            var overtimes = await _db.VewOverTimes.AsNoTracking()
                .Where(a => a.EmpCardNo == empCardNo && a.OverTimeDate >= fromDate && a.OverTimeDate <= toDate && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || a.Site == site))
                .ToDictionaryAsync(o => o.OverTimeDate?.Date ?? DateTime.MinValue, o => o.OverTime ?? 0m);

            var leaves = await _db.HrmLeaveRegisters.AsNoTracking()
                .Where(l => l.EmpCardNo == empCardNo && (string.IsNullOrEmpty(site) || site.ToLower() == "all" || l.Site == site) && l.LeaveDate >= fromDate && l.LeaveDate <= toDate)
                .ToListAsync();

            var gazettedLeaves = await _db.GazettedLeaves.AsNoTracking()
                .Where(g => (string.IsNullOrEmpty(site) || site.ToLower() == "all" || g.Site == site) && g.LeaveDate >= fromDate && g.LeaveDate <= toDate)
                .ToListAsync();

            var dailyDict = dailyAttList
                .Where(d => d.AttendanceDate.HasValue)
                .GroupBy(d => d.AttendanceDate!.Value.Date)
                .ToDictionary(g => g.Key, g => g.First());

            var machineDict = machineAttList
                .Where(m => m.AttendanceDate.HasValue)
                .GroupBy(m => m.AttendanceDate!.Value.Date)
                .ToDictionary(g => g.Key, g => g.First());

            var vewDict = vewAttList
                .Where(v => v.AttendanceDate.HasValue)
                .GroupBy(v => v.AttendanceDate!.Value.Date)
                .ToDictionary(g => g.Key, g => g.First());

            var regDict = regList
                .Where(r => r.AttendanceDate.HasValue)
                .GroupBy(r => r.AttendanceDate!.Value.Date)
                .ToDictionary(g => g.Key, g => g.First());

            var leaveDict = leaves
                .Where(l => l.LeaveDate.HasValue)
                .GroupBy(l => l.LeaveDate!.Value.Date)
                .ToDictionary(g => g.Key, g => g.First());

            var gazettedDict = gazettedLeaves
                .Where(g => g.LeaveDate.HasValue)
                .GroupBy(g => g.LeaveDate!.Value.Date)
                .ToDictionary(g => g.Key, g => g.First());

            var tableRows = new List<(DateTime Date, string InTime, string OutTime, DateTime? InDateTime, decimal WorkHours, decimal OverTime, string AttendanceType, string Remarks, decimal LateMinutes)>();

            for (var curDate = fromDate.Date; curDate <= toDate.Date; curDate = curDate.AddDays(1))
            {
                dailyDict.TryGetValue(curDate, out var daily);
                machineDict.TryGetValue(curDate, out var machine);
                vewDict.TryGetValue(curDate, out var vew);
                regDict.TryGetValue(curDate, out var reg);
                leaveDict.TryGetValue(curDate, out var l);
                gazettedDict.TryGetValue(curDate, out var gl);
                overtimes.TryGetValue(curDate, out var ot);

                DateTime? inPunch = null;
                DateTime? outPunch = null;

                if (daily != null)
                {
                    if (daily.InDate.HasValue && daily.InDate.Value.Year > 1900) inPunch = daily.InDate;
                    if (daily.OutDate.HasValue && daily.OutDate.Value.Year > 1900) outPunch = daily.OutDate;
                }
                if (!inPunch.HasValue && machine != null && machine.InDate.HasValue && machine.InDate.Value.Year > 1900)
                {
                    inPunch = machine.InDate;
                }
                if (!outPunch.HasValue && machine != null && machine.OutDate.HasValue && machine.OutDate.Value.Year > 1900)
                {
                    outPunch = machine.OutDate;
                }
                if (!inPunch.HasValue && vew != null && vew.InDate.HasValue && vew.InDate.Value.Year > 1900)
                {
                    inPunch = vew.InDate;
                }
                if (!outPunch.HasValue && vew != null && vew.OutDate.HasValue && vew.OutDate.Value.Year > 1900)
                {
                    outPunch = vew.OutDate;
                }

                string inTimeStr = inPunch.HasValue ? inPunch.Value.ToString("HH:mm") : "-";
                string outTimeStr = outPunch.HasValue ? outPunch.Value.ToString("HH:mm") : "-";

                decimal workHours = 0;
                var (calcHours, _) = WorkHoursCalculator.Calculate(inPunch, outPunch);
                if (calcHours > 0)
                {
                    workHours = calcHours;
                }
                else if (daily?.TotalHours.HasValue == true)
                {
                    workHours = WorkHoursCalculator.SanitizeHours(daily.TotalHours);
                }
                else if (vew?.WorkingHours > 0)
                {
                    workHours = WorkHoursCalculator.SanitizeHours(vew.WorkingHours);
                }

                string attType;
                string remarks = daily?.Remarks ?? machine?.Remarks ?? vew?.Remarks ?? "";

                if (l != null && (l.AlUse > 0 || l.ClUse > 0 || l.SlUse > 0 || l.CplUse > 0))
                {
                    if (l.AlUse > 0) attType = "Annual Leave";
                    else if (l.ClUse > 0) attType = "Casual Leave";
                    else if (l.SlUse > 0) attType = "Sick Leave";
                    else if (l.CplUse > 0) attType = "CPL";
                    else attType = "Leave";
                }
                else if (gl != null && emp.JoiningDate <= curDate)
                {
                    attType = "Gazetted Leave";
                    remarks = !string.IsNullOrEmpty(gl.LeaveName) ? gl.LeaveName : "Gazetted Holiday";
                }
                else if (emp.JoiningDate <= curDate &&
                         (RestDaySchedule.IsExplicitSchedule(emp.RestDay)
                             ? RestDaySchedule.Includes(emp.RestDay, curDate.DayOfWeek)
                             : RestDaySchedule.Includes(emp.RestDay, curDate.DayOfWeek) || curDate.DayOfWeek == DayOfWeek.Sunday))
                {
                    attType = curDate.DayOfWeek.ToString();
                }
                else if (!RestDaySchedule.IsExplicitSchedule(emp.RestDay) &&
                         curDate.DayOfWeek == DayOfWeek.Saturday && emp.DesgCode == 1 && emp.JoiningDate <= curDate)
                {
                    attType = "Saturday";
                }
                else if (reg != null && reg.AttnedanceType == "A")
                {
                    attType = "Absent";
                }
                else if (daily?.Absent == true || machine?.Absent == true || vew?.Absent == true)
                {
                    attType = "Absent";
                }
                else if (inPunch.HasValue || outPunch.HasValue || (reg != null && reg.AttnedanceType == "P") || (vew != null && vew.AttendanceType == "P"))
                {
                    attType = "Present";
                }
                else
                {
                    attType = "Absent";
                }

                decimal lateM = daily?.TotalLate ?? vew?.LateMinutes ?? 0;

                tableRows.Add((curDate, inTimeStr, outTimeStr, inPunch, workHours, ot, attType, remarks, lateM));
            }

            int daysOfPeriod = (toDate.Date - fromDate.Date).Days + 1;
            int presentDays = tableRows.Count(r => r.AttendanceType == "Present" || r.AttendanceType == "Sunday" || r.AttendanceType == "Saturday" || r.AttendanceType == "Gazetted Leave" || r.AttendanceType.Contains("Leave"));
            int absentDays = tableRows.Count(r => r.AttendanceType == "Absent");
            int after12PmCount = tableRows.Count(r => r.InDateTime.HasValue && r.InDateTime.Value.Hour >= 12);

            decimal leavesAvailed = leaves.Sum(l => l.AlUse + l.ClUse + l.SlUse + l.CplUse);
            decimal alAvailed = leaves.Sum(l => l.AlUse);
            int gazettedLeavesCount = gazettedLeaves.Count;
            decimal totalLateMinutes = tableRows.Sum(r => r.LateMinutes);
            decimal totalRequiredHours = dailyAttList.Sum(d => d.HoursToWork ?? 0);
            decimal totalWorkingHours = tableRows.Sum(r => r.WorkHours);

            var siteFullName = await ResolveSiteFullNameAsync(site);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Portrait(), marginCm: 1.2f);
                    page.Header().RenderSchoolBoxedHeader($"Individual Time Card From {fromDate:dd-MM-yyyy} To {toDate:dd-MM-yyyy}", schoolName: siteFullName);

                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Item().BorderedCell(borderWidth: 0.5f, padding: 6f).Column(empCol =>
                        {
                            empCol.Item().Row(row =>
                            {
                                row.RelativeItem(1.2f).Text(t => { t.Span("Emp ID: ").Bold(); t.Span(emp.EmpCardNo.ToString()); });
                                row.RelativeItem(1.5f).Text(t => { t.Span("Joining : ").Bold(); t.Span(emp.JoiningDate?.ToString("dd-MM-yyyy") ?? ""); });
                                row.RelativeItem(1.2f).Text(t => { t.Span("Shift In: ").Bold(); t.Span(emp.InTime ?? ""); });
                                row.RelativeItem(2.5f).Text(t => { t.Span("Department : ").Bold(); t.Span(deptName); });
                            });
                            empCol.Item().PaddingTop(4).Row(row =>
                            {
                                row.RelativeItem(2.7f).Text(t => { t.Span("Name : ").Bold(); t.Span(emp.EmpName ?? ""); });
                                row.RelativeItem(3.7f).Text(t => { t.Span("Salary Category : ").Bold(); t.Span(emp.Category ?? ""); });
                            });
                        });

                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);  // Sr.No.
                                columns.RelativeColumn(1.2f); // Date
                                columns.RelativeColumn(1);   // In Time (Machine)
                                columns.RelativeColumn(1);   // Out Time (Machine)
                                columns.RelativeColumn(1);   // Work Hours
                                columns.RelativeColumn(1);   // Over Time
                                columns.RelativeColumn(1.2f); // Attendance Type
                                columns.RelativeColumn(2);   // Remarks
                            });

                            table.Header(header =>
                            {
                                header.Cell().BorderedCell().AlignCenter().Text("Sr.No.").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("Date").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("In Time").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("Out Time").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("Work Hours").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("Over Time").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("Attendance Type").Bold().FontSize(8);
                                header.Cell().BorderedCell().AlignCenter().Text("Remarks").Bold().FontSize(8);
                            });

                            int srNo = 1;
                            foreach (var item in tableRows)
                            {
                                table.Cell().BorderedCell().AlignCenter().Text(srNo.ToString()).FontSize(7.5f);
                                table.Cell().BorderedCell().AlignCenter().Text(item.Date.ToString("dd-MM-yyyy")).FontSize(7.5f);
                                table.Cell().BorderedCell().AlignCenter().Text(item.InTime).FontSize(7.5f);
                                table.Cell().BorderedCell().AlignCenter().Text(item.OutTime).FontSize(7.5f);
                                table.Cell().BorderedCell().AlignCenter().Text(item.WorkHours > 0 ? item.WorkHours.ToString("F2") : "").FontSize(7.5f);
                                table.Cell().BorderedCell().AlignCenter().Text(item.OverTime > 0 ? item.OverTime.ToString("F2") : "").FontSize(7.5f);
                                table.Cell().BorderedCell().AlignCenter().Text(item.AttendanceType).FontSize(7.5f);
                                table.Cell().BorderedCell().Text(item.Remarks).FontSize(7.5f);
                                srNo++;
                            }

                            if (tableRows.Count == 0) table.Cell().ColumnSpan(8).BorderedCell(padding: 10f).AlignCenter().Text("No records found in this period.").Italic();
                        });

                        col.Item().BorderedCell(borderWidth: 0.5f, padding: 4f).Row(row =>
                        {
                            row.RelativeItem().Text(t => { t.Span("Total Required Hours: ").Bold().FontSize(8); t.Span(totalRequiredHours.ToString("F2")).FontSize(8); });
                            row.RelativeItem().AlignRight().Text(t => { t.Span("Total Working Hours: ").Bold().FontSize(8); t.Span(totalWorkingHours.ToString("F2")).FontSize(8); });
                        });

                        col.Item().PaddingTop(10).BorderedCell(borderWidth: 0.5f, padding: 6f).Column(sumCol =>
                        {
                            sumCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Days of Month    ").Bold().FontSize(8); t.Span(daysOfPeriod.ToString()).FontSize(8); });
                                row.RelativeItem().Text(t => { t.Span("Present Days    ").Bold().FontSize(8); t.Span(presentDays.ToString()).FontSize(8); });
                                row.RelativeItem().Text(t => { t.Span("Absent Days    ").Bold().FontSize(8); t.Span(absentDays.ToString()).FontSize(8); });
                                row.RelativeItem().Text(t => { t.Span("After 12PM    ").Bold().FontSize(8); t.Span(after12PmCount.ToString()).FontSize(8); });
                            });
                            sumCol.Item().PaddingTop(5).Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Leaves Availed    ").Bold().FontSize(8); t.Span(leavesAvailed.ToString("F1")).FontSize(8); });
                                row.RelativeItem().Text(t => { t.Span("AL Availed    ").Bold().FontSize(8); t.Span(alAvailed.ToString("F1")).FontSize(8); });
                                row.RelativeItem().Text(t => { t.Span("Gazetted Leaves    ").Bold().FontSize(8); t.Span(gazettedLeavesCount.ToString()).FontSize(8); });
                                row.RelativeItem().Text(t => { t.Span("Total Late    ").Bold().FontSize(8); t.Span(totalLateMinutes.ToString("F1")).FontSize(8); });
                            });
                        });
                    });

                    page.Footer().RenderStandardFooter();
                });
            }).GeneratePdf();
        }

        #endregion

        #region 6. Attendance Short Leave / Late Detail Report

        public async Task<byte[]> GenerateAttendanceShortLeaveLateDetailReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            string? category)
        {
            var employees = await GetActiveEmployeesAsync(site, category);
            var empCardNos = employees.Select(e => e.EmpCardNo).ToList();
            var deptDict = await GetDepartmentDictionaryAsync(site);

            var shortLeaves = await _db.HrmShortLeaves.AsNoTracking()
                .Where(l => l.Site == site && l.EmpCardNo != null && empCardNos.Contains(l.EmpCardNo.Value) && l.LeaveDate >= fromDate && l.LeaveDate <= toDate)
                .ToListAsync();

            var attendance = await _db.VewDailyAttendances.AsNoTracking()
                .Where(a => empCardNos.Contains(a.EmpCardNo) && a.AttendanceDate >= fromDate && a.AttendanceDate <= toDate)
                .ToListAsync();

            var monthsList = PdfReportExtensions.GetMonthRangeList(fromDate, toDate);

            var shortLeaveMap = shortLeaves
                .Where(l => l.LeaveDate.HasValue)
                .GroupBy(l => new { EmpCardNo = l.EmpCardNo!.Value, YearMonth = new DateTime(l.LeaveDate!.Value.Year, l.LeaveDate.Value.Month, 1) })
                .ToDictionary(g => g.Key, g => g.Count());

            var lateMap = attendance
                .Where(a => a.AttendanceDate.HasValue && (a.LateArrival == 1 || (a.LateMinutes ?? 0) > 0))
                .GroupBy(a => new { a.EmpCardNo, YearMonth = new DateTime(a.AttendanceDate!.Value.Year, a.AttendanceDate.Value.Month, 1) })
                .ToDictionary(g => g.Key, g => g.Count());

            var siteFullName = await ResolveSiteFullNameAsync(site);

            var doc = BuildMonthlyDetailReport(
                "Short Leaves / Late Detail",
                fromDate,
                toDate,
                employees,
                deptDict,
                monthsList,
                "S.L",
                "Late",
                (empCardNo, month) =>
                {
                    shortLeaveMap.TryGetValue(new { EmpCardNo = empCardNo, YearMonth = month }, out var slCount);
                    lateMap.TryGetValue(new { EmpCardNo = empCardNo, YearMonth = month }, out var lateCount);
                    return (slCount > 0 ? slCount.ToString() : "-", lateCount > 0 ? lateCount.ToString() : "-", slCount, lateCount);
                },
                (tot1, tot2) => (tot1 > 0 ? tot1.ToString("0") : "-", tot2 > 0 ? tot2.ToString("0") : "-"),
                siteFullName);

            return doc.GeneratePdf();
        }

        #endregion

        #region 7. Attendance Leave & Absent Detail Report

        public async Task<byte[]> GenerateAttendanceLeaveAbsentDetailReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            string? category)
        {
            var employees = await GetActiveEmployeesAsync(site, category);
            var empCardNos = employees.Select(e => e.EmpCardNo).ToList();
            var deptDict = await GetDepartmentDictionaryAsync(site);

            var attendance = await _db.VewDailyAttendances.AsNoTracking()
                .Where(a => empCardNos.Contains(a.EmpCardNo) && a.AttendanceDate >= fromDate && a.AttendanceDate <= toDate)
                .ToListAsync();

            var leaves = await _db.HrmLeaveRegisters.AsNoTracking()
                .Where(l => l.Site == site && empCardNos.Contains(l.EmpCardNo) && l.LeaveDate >= fromDate && l.LeaveDate <= toDate)
                .ToListAsync();

            var monthsList = PdfReportExtensions.GetMonthRangeList(fromDate, toDate);

            var leaveMap = leaves
                .Where(l => l.LeaveDate.HasValue)
                .GroupBy(l => new { l.EmpCardNo, YearMonth = new DateTime(l.LeaveDate!.Value.Year, l.LeaveDate.Value.Month, 1) })
                .ToDictionary(g => g.Key, g => (double)g.Sum(l => l.AlUse + l.ClUse + l.SlUse + l.CplUse));

            var absentMap = attendance
                .Where(a => a.AttendanceDate.HasValue && (a.Absent == true || a.AttendanceType == "A"))
                .GroupBy(a => new { a.EmpCardNo, YearMonth = new DateTime(a.AttendanceDate!.Value.Year, a.AttendanceDate.Value.Month, 1) })
                .ToDictionary(g => g.Key, g => g.Count());

            var siteFullName = await ResolveSiteFullNameAsync(site);

            var doc = BuildMonthlyDetailReport(
                "Leave and Absent Detail",
                fromDate,
                toDate,
                employees,
                deptDict,
                monthsList,
                "Leave",
                "Absent",
                (empCardNo, month) =>
                {
                    leaveMap.TryGetValue(new { EmpCardNo = empCardNo, YearMonth = month }, out var lCount);
                    absentMap.TryGetValue(new { EmpCardNo = empCardNo, YearMonth = month }, out var aCount);
                    return (lCount > 0 ? lCount.ToString("F1") : "-", aCount > 0 ? aCount.ToString() : "-", lCount, aCount);
                },
                (tot1, tot2) => (tot1 > 0 ? tot1.ToString("F1") : "-", tot2 > 0 ? tot2.ToString("0") : "-"),
                siteFullName);

            return doc.GeneratePdf();
        }

        #endregion

        #region 8. Attendance Summary with Options Report

        public async Task<byte[]> GenerateAttendanceSummaryWithOptionsReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            string? category,
            string displayType)
        {
            var employees = await GetActiveEmployeesAsync(site, category);
            var empCardNos = employees.Select(e => e.EmpCardNo).ToList();
            var deptDict = await GetDepartmentDictionaryAsync(site);

            var attendance = await _db.VewDailyAttendances.AsNoTracking()
                .Where(a => empCardNos.Contains(a.EmpCardNo) && a.AttendanceDate >= fromDate && a.AttendanceDate <= toDate)
                .ToListAsync();

            var overtimes = await _db.VewOverTimes.AsNoTracking()
                .Where(a => empCardNos.Contains(a.EmpCardNo) && a.OverTimeDate >= fromDate && a.OverTimeDate <= toDate && a.Site == site)
                .ToListAsync();

            var leaves = await _db.HrmLeaveRegisters.AsNoTracking()
                .Where(l => l.Site == site && empCardNos.Contains(l.EmpCardNo) && l.LeaveDate >= fromDate && l.LeaveDate <= toDate)
                .ToListAsync();

            var dailyAtt = await _db.DailyAttendances.AsNoTracking()
                .Where(d => d.Site == site && d.EmpCardNo != null && empCardNos.Contains(d.EmpCardNo.Value) && d.AttendanceDate >= fromDate && d.AttendanceDate <= toDate)
                .ToListAsync();

            var siteFullName = await ResolveSiteFullNameAsync(site);
            bool isSummaryWithoutDays = displayType.Equals("Without Days", StringComparison.OrdinalIgnoreCase) || displayType.Equals("Without Days / All Totals", StringComparison.OrdinalIgnoreCase);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Landscape(), defaultFontSize: 8f, defaultFontColor: Colors.Black);
                    page.Header().RenderSchoolSimpleHeader($"Attendance Summary ({displayType}) From {fromDate:dd-MM-yyyy} To {toDate:dd-MM-yyyy}", schoolName: siteFullName);

                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            if (isSummaryWithoutDays)
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(25);  // Sr
                                    columns.ConstantColumn(45);  // Card No
                                    columns.RelativeColumn(2);   // Name
                                    columns.RelativeColumn(2);   // Department
                                    columns.ConstantColumn(50);  // Present
                                    columns.ConstantColumn(50);  // Absent
                                    columns.ConstantColumn(50);  // Late
                                    columns.ConstantColumn(55);  // Leaves
                                    columns.ConstantColumn(55);  // Overtime Days
                                    columns.ConstantColumn(55);  // Req. Hours
                                    columns.ConstantColumn(55);  // Work Hours
                                });

                                table.Header(header =>
                                {
                                    header.Cell().BorderedCell().AlignCenter().Text("Sr.").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Card No").Bold();
                                    header.Cell().BorderedCell().Text("Name").Bold();
                                    header.Cell().BorderedCell().Text("Department").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Present").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Absent").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Late").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Leaves").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("OT Days").Bold();
                                    header.Cell().BorderedCell().AlignRight().Text("Req. Hours").Bold();
                                    header.Cell().BorderedCell().AlignRight().Text("Work Hours").Bold();
                                });

                                int srNo = 1;
                                foreach (var emp in employees)
                                {
                                    string dName = deptDict.TryGetValue(emp.DeptCode ?? 0, out var d) ? d : "";
                                    var empAtt = attendance.Where(a => a.EmpCardNo == emp.EmpCardNo).ToList();
                                    var empOts = overtimes.Where(o => o.EmpCardNo == emp.EmpCardNo).ToList();
                                    var empLeaves = leaves.Where(l => l.EmpCardNo == emp.EmpCardNo).ToList();
                                    var empDails = dailyAtt.Where(da => da.EmpCardNo == emp.EmpCardNo).ToList();

                                    int present = empAtt.Count(a => a.AttendanceType == "P" || (a.Absent == false && a.AttendanceType != "A"));
                                    int absent = empAtt.Count(a => a.AttendanceType == "A" || a.Absent == true);
                                    int late = empAtt.Count(a => a.LateArrival == 1 || (a.LateMinutes ?? 0) > 0);
                                    decimal leaveDays = empLeaves.Sum(l => l.AlUse + l.ClUse + l.SlUse + l.CplUse);
                                    int otDays = empOts.Count(o => o.OverTime > 0);
                                    decimal reqHours = empDails.Sum(da => da.HoursToWork ?? 0);
                                    decimal workHours = empAtt.Sum(a => a.WorkingHours ?? 0);

                                    table.Cell().BorderedCell().AlignCenter().Text(srNo.ToString());
                                    table.Cell().BorderedCell().AlignCenter().Text(emp.EmpCardNo.ToString());
                                    table.Cell().BorderedCell().Text(emp.EmpName ?? "");
                                    table.Cell().BorderedCell().Text(dName);
                                    table.Cell().BorderedCell().AlignCenter().Text(present.ToString());
                                    table.Cell().BorderedCell().AlignCenter().Text(absent.ToString());
                                    table.Cell().BorderedCell().AlignCenter().Text(late.ToString());
                                    table.Cell().BorderedCell().AlignCenter().Text(leaveDays.ToString("F1"));
                                    table.Cell().BorderedCell().AlignCenter().Text(otDays.ToString());
                                    table.Cell().BorderedCell().AlignRight().Text(reqHours.ToString("F1"));
                                    table.Cell().BorderedCell().AlignRight().Text(workHours.ToString("F1"));

                                    srNo++;
                                }
                            }
                            else
                            {
                                // Detail breakdown per status
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(25);  // Sr
                                    columns.ConstantColumn(45);  // Card No
                                    columns.RelativeColumn(2);   // Name
                                    columns.RelativeColumn(2);   // Department
                                    columns.ConstantColumn(90);  // Date
                                    columns.RelativeColumn(1.5f); // Info Column
                                });

                                table.Header(header =>
                                {
                                    header.Cell().BorderedCell().AlignCenter().Text("Sr.").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Card No").Bold();
                                    header.Cell().BorderedCell().Text("Name").Bold();
                                    header.Cell().BorderedCell().Text("Department").Bold();
                                    header.Cell().BorderedCell().AlignCenter().Text("Date").Bold();
                                    header.Cell().BorderedCell().Text("Detail Information").Bold();
                                });

                                int srNo = 1;
                                foreach (var emp in employees)
                                {
                                    string dName = deptDict.TryGetValue(emp.DeptCode ?? 0, out var d) ? d : "";

                                    void RenderRows<T>(IEnumerable<T> rows, Func<T, DateTime?> dateSelector, Func<T, string> infoSelector)
                                    {
                                        foreach (var row in rows)
                                        {
                                            table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(srNo.ToString());
                                            table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(emp.EmpCardNo.ToString());
                                            table.Cell().BorderedCell(padding: 2f).Text(emp.EmpName ?? "");
                                            table.Cell().BorderedCell(padding: 2f).Text(dName);
                                            table.Cell().BorderedCell(padding: 2f).AlignCenter().Text(dateSelector(row)?.ToString("dd-MM-yyyy") ?? "");
                                            table.Cell().BorderedCell(padding: 2f).Text(infoSelector(row));
                                            srNo++;
                                        }
                                    }

                                    if (displayType.Equals("Present Days", StringComparison.OrdinalIgnoreCase))
                                    {
                                        var rows = attendance.Where(a => a.EmpCardNo == emp.EmpCardNo && (a.AttendanceType == "P" || (a.Absent == false && a.AttendanceType != "A"))).OrderBy(a => a.AttendanceDate);
                                        RenderRows(rows, r => r.AttendanceDate, r => $"In: {r.InTime ?? "-"}, Out: {r.OutTime ?? "-"}, Work Hours: {(r.WorkingHours ?? 0):F1}");
                                    }
                                    else if (displayType.Equals("Absent Days", StringComparison.OrdinalIgnoreCase))
                                    {
                                        var rows = attendance.Where(a => a.EmpCardNo == emp.EmpCardNo && (a.AttendanceType == "A" || a.Absent == true)).OrderBy(a => a.AttendanceDate);
                                        RenderRows(rows, r => r.AttendanceDate, _ => "Absent / Unmarked");
                                    }
                                    else if (displayType.Equals("Late Days", StringComparison.OrdinalIgnoreCase))
                                    {
                                        var rows = attendance.Where(a => a.EmpCardNo == emp.EmpCardNo && (a.LateArrival == 1 || (a.LateMinutes ?? 0) > 0)).OrderBy(a => a.AttendanceDate);
                                        RenderRows(rows, r => r.AttendanceDate, r => $"In Time: {r.InTime ?? "-"}, Late Minutes: {(r.LateMinutes ?? 0):F0}");
                                    }
                                    else if (displayType.Equals("Overtime Days", StringComparison.OrdinalIgnoreCase))
                                    {
                                        var rows = overtimes.Where(o => o.EmpCardNo == emp.EmpCardNo && o.OverTime > 0).OrderBy(o => o.OverTimeDate);
                                        RenderRows(rows, r => r.OverTimeDate, r => $"Overtime Hours: {(r.OverTime ?? 0):F1}");
                                    }
                                }

                                if (srNo == 1)
                                {
                                    table.Cell().ColumnSpan(6).BorderedCell(padding: 10f).AlignCenter().Text("No detail records found for this status.");
                                }
                            }
                        });
                    });
                });
            }).GeneratePdf();
        }

        private static string FormatDutyTime(string? timeStr)
        {
            if (string.IsNullOrWhiteSpace(timeStr)) return "-";
            var trimmed = timeStr.Trim();
            if (TimeSpan.TryParse(trimmed, out var ts))
            {
                return DateTime.Today.Add(ts).ToString("hh:mm tt");
            }
            if (DateTime.TryParse(trimmed, out var dt))
            {
                return dt.ToString("hh:mm tt");
            }
            return trimmed;
        }

        /// <summary>
        /// Generates Employee Duty Timing Report.
        /// Supports report types: all, employee, department.
        /// Reuses PdfReportExtensions standard page, header, department group banner, and footer.
        /// Shows the configured duty timing (From Time / To Time) set in Duty Timings.
        /// </summary>
        public async Task<byte[]> GenerateDutyTimingReportAsync(
            string site,
            string reportType,
            int? employeeCardNo = null,
            int? departmentCode = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);

            // Normalize/swap inverted dates so backend never crashes
            if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
            {
                (fromDate, toDate) = (toDate, fromDate);
            }

            var query = _db.HrmDutyTimingChildren
                .AsNoTracking()
                .Where(c => c.Site == site);

            string subtitle = "All Configured Duty Timings";

            if (reportType.Equals("employee", StringComparison.OrdinalIgnoreCase))
            {
                if (!employeeCardNo.HasValue || employeeCardNo.Value <= 0)
                {
                    throw new ArgumentException("Employee Card No is required for Employee Wise report.");
                }
                query = query.Where(c => c.EmpCardNo == employeeCardNo.Value);
            }
            else if (reportType.Equals("department", StringComparison.OrdinalIgnoreCase))
            {
                if (!departmentCode.HasValue || departmentCode.Value <= 0)
                {
                    throw new ArgumentException("Department Code is required for Department Wise report.");
                }
                query = query.Where(c => c.DepartmentCode == departmentCode.Value);
            }

            if (fromDate.HasValue)
            {
                var fDate = fromDate.Value.Date;
                query = query.Where(c => c.ToDate >= fDate);
            }

            if (toDate.HasValue)
            {
                var tDate = toDate.Value.Date;
                query = query.Where(c => c.FromDate <= tDate);
            }

            var records = await query
                .OrderBy(c => c.DepartmentCode)
                .ThenBy(c => c.EmpCardNo)
                .ThenByDescending(c => c.FromDate)
                .ToListAsync();

            // Load department dictionary for names
            var deptDict = await _db.Departments
                .AsNoTracking()
                .Where(d => d.Site == site)
                .ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");

            // Build dynamic subtitle text based on applied filter
            if (reportType.Equals("employee", StringComparison.OrdinalIgnoreCase))
            {
                var firstEmp = records.FirstOrDefault();
                if (firstEmp != null && !string.IsNullOrWhiteSpace(firstEmp.EmpName))
                {
                    subtitle = $"Employee: {firstEmp.EmpName} (Card #{firstEmp.EmpCardNo})";
                }
                else
                {
                    // Fallback to employee table if no duty timing records found
                    var emp = await _db.Employees
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Site == site && e.EmpCardNo == employeeCardNo!.Value);
                    subtitle = emp != null
                        ? $"Employee: {emp.EmpName} (Card #{employeeCardNo!.Value})"
                        : $"Employee Card #{employeeCardNo!.Value}";
                }
            }
            else if (reportType.Equals("department", StringComparison.OrdinalIgnoreCase))
            {
                var dName = deptDict.TryGetValue(departmentCode!.Value, out var dn) ? dn : $"Code {departmentCode.Value}";
                subtitle = $"Department: {dName}";
            }

            // Append date range info to subtitle if specified
            if (fromDate.HasValue && toDate.HasValue)
            {
                subtitle += $" ({fromDate.Value:dd MMM yyyy} to {toDate.Value:dd MMM yyyy})";
            }
            else if (fromDate.HasValue)
            {
                subtitle += $" (From {fromDate.Value:dd MMM yyyy})";
            }
            else if (toDate.HasValue)
            {
                subtitle += $" (Up to {toDate.Value:dd MMM yyyy})";
            }


            // Group by department
            var groupedData = records
                .GroupBy(r => r.DepartmentCode)
                .ToList();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.ApplyStandardPage(PageSizes.A4.Portrait(), marginCm: 0.8f, defaultFontSize: 7.5f, defaultFontColor: "#374151");
                    page.Header().RenderStandardHeader("Employee Duty Timing Report", site, subtitle, siteFullName);

                    page.Content().PaddingVertical(6).Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(24);  // Sr
                                columns.ConstantColumn(46);  // Card No
                                columns.RelativeColumn(2.5f);// Employee Name
                                columns.RelativeColumn(2.0f);// Designation
                                columns.ConstantColumn(52);  // From Time (Duty Start)
                                columns.ConstantColumn(52);  // To Time (Duty End)
                                columns.ConstantColumn(62);  // From Date
                                columns.ConstantColumn(62);  // To Date
                            });

                            table.Header(header =>
                            {
                                header.Cell().HeaderCell().AlignCenter().Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().AlignCenter().Text("Card No").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().AlignCenter().Text("From Time").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().AlignCenter().Text("To Time").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().AlignCenter().Text("From Date").Bold().FontColor(Colors.White);
                                header.Cell().HeaderCell().AlignCenter().Text("To Date").Bold().FontColor(Colors.White);
                            });

                            if (records.Count == 0)
                            {
                                table.RenderEmptyState(8, "No duty timings found.");
                            }
                            else
                            {
                                int srNo = 0;
                                foreach (var deptGroup in groupedData)
                                {
                                    var dCode = deptGroup.Key;
                                    var deptName = deptDict.TryGetValue(dCode ?? 0, out var name) && !string.IsNullOrWhiteSpace(name)
                                        ? name
                                        : (dCode.HasValue ? $"Department Code: {dCode.Value}" : "General");
                                    int empCount = deptGroup.Select(x => x.EmpCardNo).Distinct().Count();

                                    // Department Group Banner
                                    table.Cell().ColumnSpan(8)
                                        .Background("#EFF6FF")
                                        .BorderTop(1).BorderBottom(1).BorderColor("#BFDBFE")
                                        .PaddingVertical(3)
                                        .PaddingHorizontal(6)
                                        .Row(deptRow =>
                                        {
                                            deptRow.RelativeItem().Text(t =>
                                            {
                                                t.Span("Department: ").Bold().FontSize(8.5f).FontColor("#1E3A8A");
                                                t.Span(deptName).Bold().FontSize(9f).FontColor("#1E40AF");
                                            });
                                            deptRow.AutoItem().AlignRight().Text(t =>
                                            {
                                                t.Span($"Total Employees: {empCount}").FontSize(8f).SemiBold().FontColor("#1E40AF");
                                            });
                                        });

                                    int rowIdx = 0;
                                    foreach (var item in deptGroup)
                                    {
                                        int currentSr = ++srNo;
                                        table.Cell().RowCell(rowIdx).AlignCenter().Text(currentSr.ToString());
                                        table.Cell().RowCell(rowIdx).AlignCenter().Text(item.EmpCardNo.ToString());
                                        table.Cell().RowCell(rowIdx).Text(item.EmpName ?? "");
                                        table.Cell().RowCell(rowIdx).Text(item.DesignationName ?? "");
                                        table.Cell().RowCell(rowIdx).AlignCenter().Text(FormatDutyTime(item.FromTime));
                                        table.Cell().RowCell(rowIdx).AlignCenter().Text(FormatDutyTime(item.ToTime));
                                        table.Cell().RowCell(rowIdx).AlignCenter().Text(item.FromDate.ToString("dd/MM/yyyy"));
                                        table.Cell().RowCell(rowIdx).AlignCenter().Text(item.ToDate.ToString("dd/MM/yyyy"));
                                        rowIdx++;
                                    }
                                }
                            }
                        });
                    });

                    page.Footer().RenderStandardFooter();
                });
            });

            return document.GeneratePdf();
        }

        #endregion
    }
}
