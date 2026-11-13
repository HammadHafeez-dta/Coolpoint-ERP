using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SaftHR.API.Interface;
using SaftHR.API.Models;

namespace SaftHR.API.Services
{
    public class LeaveReportService
    {
        private readonly HRMSDbContext _db;
        private readonly ISiteInfoService? _siteInfoService;

        public LeaveReportService(HRMSDbContext db, ISiteInfoService? siteInfoService = null)
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

        public async Task<byte[]> GenerateLeaveApplicationReportAsync(int empCardNo, string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var emp = await _db.Employees.FirstOrDefaultAsync(u => u.EmpCardNo == empCardNo && u.Site == site);
            if (emp == null) throw new Exception("Employee not found");

            var deptName = await _db.Departments.Where(d => d.DepartmentCode == emp.DeptCode && d.Site == site).Select(d => d.DepartmentName).FirstOrDefaultAsync() ?? "";
            var desigName = await _db.Designations.Where(d => d.DesignationCode == emp.DesgCode && d.Site == site).Select(d => d.DesignationName).FirstOrDefaultAsync() ?? "";

            var applications = await _db.HrmVewLeaveApplications
                .Where(u => u.EmpCardNo == empCardNo && u.Site == site)
                .OrderByDescending(u => u.TransDate)
                .ToListAsync();

            var balances = await _db.HrmVewLeaveBalances.FirstOrDefaultAsync(u => u.EmpCardNo == empCardNo);

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial").FontColor(Colors.Grey.Darken3));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(titleCol =>
                            {
                                titleCol.Item().Text(siteFullName).Bold().FontSize(18).FontColor("#1E3A8A");
                                titleCol.Item().Text("Leave Application Report").SemiBold().FontSize(12).FontColor("#3B82F6");
                            });
                            row.ConstantItem(120).AlignRight().Text($"SITE: {site}").Bold().FontSize(10).FontColor(Colors.Grey.Medium);
                        });
                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Content
                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Spacing(15);

                        // Employee Info Card
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten5).Padding(10).Column(infoCol =>
                        {
                            infoCol.Spacing(5);
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Employee Name: ").Bold(); t.Span(emp.EmpName ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("Card No: ").Bold(); t.Span(emp.EmpCardNo.ToString()); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Department: ").Bold(); t.Span(deptName); });
                                row.RelativeItem().Text(t => { t.Span("Designation: ").Bold(); t.Span(desigName); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Joining Date: ").Bold(); t.Span(emp.JoiningDate?.ToString("dd MMM yyyy") ?? "-"); });
                                row.RelativeItem().Text(t => { t.Span("Report Date: ").Bold(); t.Span(DateTime.Now.ToString("dd MMM yyyy")); });
                            });
                        });

                        // Balances Summary Grid
                        if (balances != null)
                        {
                            col.Item().Row(row =>
                            {
                                row.Spacing(10);
                                row.RelativeItem().Border(1).BorderColor("#DBEAFE").Background("#EFF6FF").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Annual (AL)").Bold().FontSize(9).FontColor("#1E40AF");
                                    b.Item().AlignCenter().Text(balances.AlBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#1E3A8A");
                                });
                                row.RelativeItem().Border(1).BorderColor("#D1FAE5").Background("#ECFDF5").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Casual (CL)").Bold().FontSize(9).FontColor("#065F46");
                                    b.Item().AlignCenter().Text(balances.ClBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#047857");
                                });
                                row.RelativeItem().Border(1).BorderColor("#FEF3C7").Background("#FFFBEB").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Sick (SL)").Bold().FontSize(9).FontColor("#92400E");
                                    b.Item().AlignCenter().Text(balances.SlBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#B45309");
                                });
                                row.RelativeItem().Border(1).BorderColor("#F3E8FF").Background("#FDF4FF").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Compensatory (CPL)").Bold().FontSize(9).FontColor("#6B21A8");
                                    b.Item().AlignCenter().Text(balances.CplBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#7E22CE");
                                });
                            });
                        }

                        // Table of Leave Applications
                        col.Item().Column(tableCol =>
                        {
                            tableCol.Spacing(5);
                            tableCol.Item().Text("Leave Application Records").Bold().FontSize(11).FontColor("#1E3A8A");
                            
                            tableCol.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(50); // App No
                                    columns.ConstantColumn(80); // Date
                                    columns.ConstantColumn(85); // Leave Type
                                    columns.RelativeColumn();   // From-To Date
                                    columns.ConstantColumn(50); // Days
                                    columns.RelativeColumn();   // Reason
                                });

                                // Header
                                table.Header(header =>
                                {
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("App #").Bold().FontColor(Colors.White);
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("App Date").Bold().FontColor(Colors.White);
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("Type").Bold().FontColor(Colors.White);
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("Duration").Bold().FontColor(Colors.White);
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("Days").Bold().FontColor(Colors.White).AlignCenter();
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("Reason").Bold().FontColor(Colors.White);
                                });

                                // Rows
                                int i = 0;
                                foreach (var appRecord in applications)
                                {
                                    var bg = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten5;
                                    table.Cell().Background(bg).Padding(5).Text(appRecord.TransNo.ToString()).FontFamily("Courier New");
                                    table.Cell().Background(bg).Padding(5).Text(appRecord.TransDate?.ToString("dd/MM/yyyy") ?? "");
                                    table.Cell().Background(bg).Padding(5).Text(appRecord.LeaveType ?? "");
                                    table.Cell().Background(bg).Padding(5).Text($"{appRecord.FromDate?.ToString("dd/MM/yyyy")} - {appRecord.ToDate?.ToString("dd/MM/yyyy")}");
                                    table.Cell().Background(bg).Padding(5).Text(appRecord.LeaveRequired?.ToString("0.#") ?? "0").AlignCenter().Bold();
                                    table.Cell().Background(bg).Padding(5).Text(appRecord.Reason ?? "");
                                    i++;
                                }
                                
                                if (applications.Count == 0)
                                {
                                    table.Cell().ColumnSpan(6).Padding(15).AlignCenter().Text("No leave applications found for this employee.").Italic().FontColor(Colors.Grey.Medium);
                                }
                            });
                        });
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.RelativeItem().Text("Generated by SAFT HRMS System").FontSize(8).FontColor(Colors.Grey.Medium);
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                                x.Span(" of ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                    });
                });
            }).GeneratePdf();

            return pdf;
        }

        public async Task<byte[]> GenerateLeaveLedgerReportAsync(int empCardNo, string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var emp = await _db.Employees.FirstOrDefaultAsync(u => u.EmpCardNo == empCardNo && u.Site == site);
            if (emp == null) throw new Exception("Employee not found");

            var deptName = await _db.Departments.Where(d => d.DepartmentCode == emp.DeptCode && d.Site == site).Select(d => d.DepartmentName).FirstOrDefaultAsync() ?? "";
            var desigName = await _db.Designations.Where(d => d.DesignationCode == emp.DesgCode && d.Site == site).Select(d => d.DesignationName).FirstOrDefaultAsync() ?? "";

            var ledgerRows = await _db.HrmVewLeaveRegisters
                .Where(u => u.EmpCardNo == empCardNo && u.Site == site)
                .OrderBy(u => u.LeaveYear)
                .ThenBy(u => u.LeaveMonth)
                .ThenBy(u => u.LeaveDate)
                .ToListAsync();

            var balances = await _db.HrmVewLeaveBalances.FirstOrDefaultAsync(u => u.EmpCardNo == empCardNo);

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial").FontColor(Colors.Grey.Darken3));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(titleCol =>
                            {
                                titleCol.Item().Text(siteFullName).Bold().FontSize(18).FontColor("#1E3A8A");
                                titleCol.Item().Text("Employee Leave History Ledger").SemiBold().FontSize(12).FontColor("#3B82F6");
                            });
                            row.ConstantItem(120).AlignRight().Text($"SITE: {site}").Bold().FontSize(10).FontColor(Colors.Grey.Medium);
                        });
                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Content
                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Spacing(15);

                        // Employee Info
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten5).Padding(10).Column(infoCol =>
                        {
                            infoCol.Spacing(5);
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Employee Name: ").Bold(); t.Span(emp.EmpName ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("Card No: ").Bold(); t.Span(emp.EmpCardNo.ToString()); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Department: ").Bold(); t.Span(deptName); });
                                row.RelativeItem().Text(t => { t.Span("Designation: ").Bold(); t.Span(desigName); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Joining Date: ").Bold(); t.Span(emp.JoiningDate?.ToString("dd MMM yyyy") ?? "-"); });
                                row.RelativeItem().Text(t => { t.Span("Report Date: ").Bold(); t.Span(DateTime.Now.ToString("dd MMM yyyy")); });
                            });
                        });

                        // Balances Summary Grid
                        if (balances != null)
                        {
                            col.Item().Row(row =>
                            {
                                row.Spacing(10);
                                row.RelativeItem().Border(1).BorderColor("#DBEAFE").Background("#EFF6FF").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Annual (AL)").Bold().FontSize(9).FontColor("#1E40AF");
                                    b.Item().AlignCenter().Text(balances.AlBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#1E3A8A");
                                });
                                row.RelativeItem().Border(1).BorderColor("#D1FAE5").Background("#ECFDF5").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Casual (CL)").Bold().FontSize(9).FontColor("#065F46");
                                    b.Item().AlignCenter().Text(balances.ClBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#047857");
                                });
                                row.RelativeItem().Border(1).BorderColor("#FEF3C7").Background("#FFFBEB").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Sick (SL)").Bold().FontSize(9).FontColor("#92400E");
                                    b.Item().AlignCenter().Text(balances.SlBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#B45309");
                                });
                                row.RelativeItem().Border(1).BorderColor("#F3E8FF").Background("#FDF4FF").Padding(8).Column(b =>
                                {
                                    b.Item().AlignCenter().Text("Compensatory (CPL)").Bold().FontSize(9).FontColor("#6B21A8");
                                    b.Item().AlignCenter().Text(balances.CplBalance?.ToString("0.#") ?? "0").Bold().FontSize(14).FontColor("#7E22CE");
                                });
                            });
                        }

                        // Table of Leave Ledger
                        col.Item().Column(tableCol =>
                        {
                            tableCol.Spacing(5);
                            tableCol.Item().Text("Leave Transactions Ledger").Bold().FontSize(11).FontColor("#1E3A8A");
                            
                            tableCol.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(80);  // Date
                                    columns.ConstantColumn(40);  // Month/Year
                                    columns.RelativeColumn();  // AL: Open, Add, Use
                                    columns.RelativeColumn();  // CL: Open, Add, Use
                                    columns.RelativeColumn();  // SL: Open, Add, Use
                                    columns.RelativeColumn();  // CPL: Open, Add, Use
                                });

                                // Header
                                table.Header(header =>
                                {
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("Date").Bold().FontColor(Colors.White);
                                    header.Cell().Background("#1E3A8A").Padding(5).Text("M/Y").Bold().FontColor(Colors.White).AlignCenter();
                                    header.Cell().Background("#1E40AF").Padding(5).Text("Annual (AL)\nOp / Ad / Us").Bold().FontColor(Colors.White).AlignCenter();
                                    header.Cell().Background("#047857").Padding(5).Text("Casual (CL)\nOp / Ad / Us").Bold().FontColor(Colors.White).AlignCenter();
                                    header.Cell().Background("#B45309").Padding(5).Text("Sick (SL)\nOp / Ad / Us").Bold().FontColor(Colors.White).AlignCenter();
                                    header.Cell().Background("#7E22CE").Padding(5).Text("Comp (CPL)\nOp / Ad / Us").Bold().FontColor(Colors.White).AlignCenter();
                                });

                                // Rows
                                int i = 0;
                                foreach (var rowItem in ledgerRows)
                                {
                                    var bg = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten5;
                                    table.Cell().Background(bg).Padding(5).Text(rowItem.LeaveDate?.ToString("dd/MM/yyyy") ?? "");
                                    table.Cell().Background(bg).Padding(5).Text($"{rowItem.LeaveMonth}/{rowItem.LeaveYear}").AlignCenter();
                                    
                                    table.Cell().Background(bg).Padding(5).AlignCenter().Text($"{rowItem.AlOpen?.ToString("0.#")} / {rowItem.AlAdd?.ToString("0.#")} / {rowItem.AlUse?.ToString("0.#")}");
                                    table.Cell().Background(bg).Padding(5).AlignCenter().Text($"{rowItem.ClOpen?.ToString("0.#")} / {rowItem.ClAdd?.ToString("0.#")} / {rowItem.ClUse?.ToString("0.#")}");
                                    table.Cell().Background(bg).Padding(5).AlignCenter().Text($"{rowItem.SlOpen?.ToString("0.#")} / {rowItem.SlAdd?.ToString("0.#")} / {rowItem.SlUse?.ToString("0.#")}");
                                    table.Cell().Background(bg).Padding(5).AlignCenter().Text($"{rowItem.CplOpen?.ToString("0.#")} / {rowItem.CplAdd?.ToString("0.#")} / {rowItem.CplUse?.ToString("0.#")}");
                                    i++;
                                }
                                
                                if (ledgerRows.Count == 0)
                                {
                                    table.Cell().ColumnSpan(6).Padding(15).AlignCenter().Text("No leave ledger transactions found for this employee.").Italic().FontColor(Colors.Grey.Medium);
                                }
                            });
                        });
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.RelativeItem().Text("Generated by SAFT HRMS System").FontSize(8).FontColor(Colors.Grey.Medium);
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                                x.Span(" of ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                    });
                });
            }).GeneratePdf();

            return pdf;
        }

        public async Task<byte[]> GenerateLeaveRegisterReportAsync(string site, DateTime fromDate, DateTime toDate, int? empCardNo, int? deptCode, int? desigCode)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var query = _db.HrmVewLeaves.AsNoTracking().Where(u => u.Site == site);

            if (empCardNo.HasValue)
            {
                query = query.Where(u => u.EmpCardNo == empCardNo.Value);
            }
            if (deptCode.HasValue)
            {
                query = query.Where(u => u.DeptCode == deptCode.Value);
            }
            if (desigCode.HasValue)
            {
                var empIdsWithDesig = await _db.Employees
                    .Where(e => e.DesgCode == desigCode.Value && e.Site == site)
                    .Select(e => e.EmpCardNo)
                    .ToListAsync();
                
                query = query.Where(u => u.EmpCardNo != null && empIdsWithDesig.Contains(u.EmpCardNo.Value));
            }

            query = query.Where(u => u.FromDate >= fromDate && u.ToDate <= toDate);

            var leaves = await query.OrderBy(u => u.EmpCardNo).ThenBy(u => u.FromDate).ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");
            var leaveTypes = await _db.HrmLeaveTypes.ToDictionaryAsync(t => t.LeaveType, t => t.LeaveName ?? "");

            var empCardNos = leaves.Select(l => l.EmpCardNo ?? 0).Distinct().ToList();
            var empDesigDict = await _db.Employees
                .Where(e => empCardNos.Contains(e.EmpCardNo) && e.Site == site)
                .ToDictionaryAsync(e => e.EmpCardNo, e => e.DesgCode ?? 0);

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial").FontColor(Colors.Grey.Darken3));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(titleCol =>
                            {
                                titleCol.Item().Text(siteFullName).Bold().FontSize(18).FontColor("#1E3A8A");
                                titleCol.Item().Text($"Leave Register Report ({fromDate:dd/MM/yyyy} to {toDate:dd/MM/yyyy})").SemiBold().FontSize(12).FontColor("#3B82F6");
                            });
                            row.ConstantItem(120).AlignRight().Column(siteCol =>
                            {
                                siteCol.Item().Text($"SITE: {site}").Bold().FontSize(10).FontColor(Colors.Grey.Medium);
                                siteCol.Item().Text($"Date: {DateTime.Now:dd MMM yyyy}").FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Content
                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(40);    // Sr No
                                columns.ConstantColumn(50);    // Card No
                                columns.RelativeColumn(2);     // Employee Name
                                columns.RelativeColumn(2);     // Department
                                columns.RelativeColumn(2);     // Designation
                                columns.ConstantColumn(50);    // Leave Type
                                columns.ConstantColumn(120);   // Duration
                                columns.ConstantColumn(40);    // Days
                                columns.RelativeColumn(2);     // Remarks/Reason
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Type").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Duration").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Days").Bold().FontColor(Colors.White).AlignCenter();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Remarks").Bold().FontColor(Colors.White);
                            });

                            // Rows
                            int srNo = 1;
                            foreach (var leave in leaves)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                
                                var dName = (leave.DeptCode.HasValue && deptDict.ContainsKey(leave.DeptCode.Value)) ? deptDict[leave.DeptCode.Value] : "";
                                
                                var desgCode = 0;
                                if (leave.EmpCardNo.HasValue && empDesigDict.ContainsKey(leave.EmpCardNo.Value))
                                {
                                    desgCode = empDesigDict[leave.EmpCardNo.Value];
                                }
                                var desgName = (desgCode > 0 && desigDict.ContainsKey(desgCode)) ? desigDict[desgCode] : "";
                                
                                var lName = (leave.LeaveType != null && leaveTypes.ContainsKey(leave.LeaveType)) ? leaveTypes[leave.LeaveType] : (leave.LeaveType ?? "");

                                table.Cell().Background(bg).Padding(5).Text(srNo.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(5).Text(leave.EmpCardNo?.ToString() ?? "").FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(5).Text(leave.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(5).Text(dName);
                                table.Cell().Background(bg).Padding(5).Text(desgName);
                                table.Cell().Background(bg).Padding(5).Text(lName);
                                table.Cell().Background(bg).Padding(5).Text($"{leave.FromDate?.ToString("dd/MM/yyyy")} - {leave.ToDate?.ToString("dd/MM/yyyy")}");
                                table.Cell().Background(bg).Padding(5).Text(leave.TotalLeaves?.ToString("0.#") ?? "0").AlignCenter().Bold();
                                table.Cell().Background(bg).Padding(5).Text(leave.Remarks ?? "");
                                
                                srNo++;
                            }
                            
                            if (leaves.Count == 0)
                            {
                                table.Cell().ColumnSpan(9).Padding(20).AlignCenter().Text("No leave records matched the specified filters.").Italic().FontColor(Colors.Grey.Medium);
                            }
                        });
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.RelativeItem().Text("Generated by SAFT HRMS System").FontSize(8).FontColor(Colors.Grey.Medium);
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                                x.Span(" of ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                    });
                });
            }).GeneratePdf();

            return pdf;
        }
    }
}
