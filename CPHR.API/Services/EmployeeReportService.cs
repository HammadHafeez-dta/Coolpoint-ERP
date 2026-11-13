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
    public class EmployeeReportService
    {
        private readonly HRMSDbContext _db;
        private readonly ISiteInfoService? _siteInfoService;

        public EmployeeReportService(HRMSDbContext db, ISiteInfoService? siteInfoService = null)
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

        public async Task<byte[]> GenerateEmployeeListReportAsync(string site, bool? status, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var query = _db.Employees.AsNoTracking().Where(e => e.Site == site);
            if (status.HasValue)
            {
                query = query.Where(e => e.Status == status.Value);
            }
            var employees = await query.OrderBy(e => e.EmpCardNo).ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

            var titleStr = status.HasValue ? (status.Value ? "Active Employee List" : "Deactive Employee List") : "All Employee List";

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
                                titleCol.Item().Text(titleStr).SemiBold().FontSize(12).FontColor("#3B82F6");
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
                                columns.ConstantColumn(25);  // Sr No
                                if (withImage)
                                {
                                    columns.ConstantColumn(35); // Image col
                                }
                                columns.ConstantColumn(45);  // Card No
                                columns.RelativeColumn(2.5f); // Employee Name
                                columns.RelativeColumn(2);    // Department
                                columns.RelativeColumn(2);    // Designation
                                columns.ConstantColumn(40);  // Gender/Shift
                                columns.ConstantColumn(65);  // DOB
                                columns.ConstantColumn(65);  // Joining Date
                                columns.ConstantColumn(45);  // Status
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                if (withImage)
                                {
                                    header.Cell().Background("#1E3A8A").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                }
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Gen/Shf").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Status").Bold().FontColor(Colors.White);
                            });

                            // Rows
                            int srNo = 1;
                            foreach (var emp in employees)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                table.Cell().Background(bg).Padding(4).Text(srNo.ToString()).AlignCenter();
                                
                                if (withImage)
                                {
                                    if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                    {
                                        table.Cell().Background(bg).Padding(2).Height(28).Width(28).Image(emp.EmpPicture);
                                    }
                                    else
                                    {
                                        table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                    }
                                }

                                table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(4).Text(dName);
                                table.Cell().Background(bg).Padding(4).Text(desgName);
                                table.Cell().Background(bg).Padding(4).Text($"{emp.Sex ?? ""}/{emp.Shift ?? ""}");
                                table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(4).Text(emp.Status == true ? "Active" : "Inactive").FontColor(emp.Status == true ? Colors.Green.Darken2 : Colors.Red.Darken2).Bold();
                                
                                srNo++;
                            }

                            if (employees.Count == 0)
                            {
                                int span = withImage ? 10 : 9;
                                table.Cell().ColumnSpan((uint)span).Padding(20).AlignCenter().Text("No employees found matching the filters.").Italic().FontColor(Colors.Grey.Medium);
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

        public async Task<byte[]> GenerateEmployeesByDepartmentReportAsync(string site, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var employees = await _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true)
                .OrderBy(e => e.DeptCode)
                .ThenBy(e => e.EmpCardNo)
                .ToListAsync();

            var departments = await _db.Departments.Where(d => d.Site == site).ToListAsync();
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

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
                                titleCol.Item().Text("Department-wise Active Employee List").SemiBold().FontSize(12).FontColor("#3B82F6");
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
                        col.Spacing(15);

                        var grouped = employees.GroupBy(e => e.DeptCode ?? 0).ToList();

                        foreach (var group in grouped)
                        {
                            var deptName = departments.FirstOrDefault(d => d.DepartmentCode == group.Key)?.DepartmentName ?? "Unassigned Department";
                            
                            col.Item().Column(deptCol =>
                            {
                                deptCol.Spacing(5);
                                deptCol.Item().Background("#EFF6FF").Padding(5).Text($"{deptName} ({group.Count()} Employees)").Bold().FontSize(11).FontColor("#1E40AF");

                                deptCol.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(25);  // Sr No
                                        if (withImage)
                                        {
                                            columns.ConstantColumn(35); // Image
                                        }
                                        columns.ConstantColumn(45);  // Card No
                                        columns.RelativeColumn(3);   // Employee Name
                                        columns.RelativeColumn(2.5f);// Designation
                                        columns.ConstantColumn(45);  // Gender/Shift
                                        columns.ConstantColumn(65);  // DOB
                                        columns.ConstantColumn(70);  // Joining Date
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#3B82F6").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                        if (withImage)
                                        {
                                            header.Cell().Background("#3B82F6").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                        }
                                        header.Cell().Background("#3B82F6").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#3B82F6").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#3B82F6").Padding(4).Text("Designation").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#3B82F6").Padding(4).Text("Gen/Shf").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#3B82F6").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#3B82F6").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                    });

                                    // Rows
                                    int sr = 1;
                                    foreach (var emp in group)
                                    {
                                        var bg = sr % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                        var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                        table.Cell().Background(bg).Padding(4).Text(sr.ToString()).AlignCenter();
                                        
                                        if (withImage)
                                        {
                                            if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                            {
                                                table.Cell().Background(bg).Padding(2).Height(25).Width(25).Image(emp.EmpPicture);
                                            }
                                            else
                                            {
                                                table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                            }
                                        }

                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                        table.Cell().Background(bg).Padding(4).Text(desgName);
                                        table.Cell().Background(bg).Padding(4).Text($"{emp.Sex ?? ""}/{emp.Shift ?? ""}");
                                        table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                        table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                        sr++;
                                    }
                                });
                            });
                        }

                        if (employees.Count == 0)
                        {
                            col.Item().AlignCenter().Text("No active employees found to group by department.").Italic().FontColor(Colors.Grey.Medium);
                        }
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

        public async Task<byte[]> GenerateEmployeesByDesignationReportAsync(string site, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var employees = await _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true)
                .OrderBy(e => e.DesgCode)
                .ThenBy(e => e.EmpCardNo)
                .ToListAsync();

            var designations = await _db.Designations.Where(d => d.Site == site).ToListAsync();
            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");

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
                                titleCol.Item().Text("Designation-wise Active Employee List").SemiBold().FontSize(12).FontColor("#3B82F6");
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
                        col.Spacing(15);

                        var grouped = employees.GroupBy(e => e.DesgCode ?? 0).ToList();

                        foreach (var group in grouped)
                        {
                            var desigName = designations.FirstOrDefault(d => d.DesignationCode == group.Key)?.DesignationName ?? "Unassigned Designation";

                            col.Item().Column(desigCol =>
                            {
                                desigCol.Spacing(5);
                                desigCol.Item().Background("#F0FDF4").Padding(5).Text($"{desigName} ({group.Count()} Employees)").Bold().FontSize(11).FontColor("#166534");

                                desigCol.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(25);  // Sr No
                                        if (withImage)
                                        {
                                            columns.ConstantColumn(35); // Image
                                        }
                                        columns.ConstantColumn(45);  // Card No
                                        columns.RelativeColumn(3);   // Employee Name
                                        columns.RelativeColumn(2.5f);// Department
                                        columns.ConstantColumn(45);  // Gender/Shift
                                        columns.ConstantColumn(65);  // DOB
                                        columns.ConstantColumn(70);  // Joining Date
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#10B981").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                        if (withImage)
                                        {
                                            header.Cell().Background("#10B981").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                        }
                                        header.Cell().Background("#10B981").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#10B981").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#10B981").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#10B981").Padding(4).Text("Gen/Shf").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#10B981").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#10B981").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                    });

                                    // Rows
                                    int sr = 1;
                                    foreach (var emp in group)
                                    {
                                        var bg = sr % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                        var deptName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";

                                        table.Cell().Background(bg).Padding(4).Text(sr.ToString()).AlignCenter();
                                        
                                        if (withImage)
                                        {
                                            if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                            {
                                                table.Cell().Background(bg).Padding(2).Height(25).Width(25).Image(emp.EmpPicture);
                                            }
                                            else
                                            {
                                                table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                            }
                                        }

                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                        table.Cell().Background(bg).Padding(4).Text(deptName);
                                        table.Cell().Background(bg).Padding(4).Text($"{emp.Sex ?? ""}/{emp.Shift ?? ""}");
                                        table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                        table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                        sr++;
                                    }
                                });
                            });
                        }

                        if (employees.Count == 0)
                        {
                            col.Item().AlignCenter().Text("No active employees found to group by designation.").Italic().FontColor(Colors.Grey.Medium);
                        }
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

        public async Task<byte[]> GenerateNewAppointmentsReportAsync(string site, DateTime fromDate, DateTime toDate, int? deptCode, int? desigCode, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var query = _db.Employees.AsNoTracking().Where(e => e.Site == site);
            
            // Joining Date Filter
            query = query.Where(e => e.JoiningDate >= fromDate && e.JoiningDate <= toDate);

            if (deptCode.HasValue)
            {
                query = query.Where(e => e.DeptCode == deptCode.Value);
            }
            if (desigCode.HasValue)
            {
                query = query.Where(e => e.DesgCode == desigCode.Value);
            }

            var employees = await query.OrderBy(e => e.JoiningDate).ThenBy(e => e.EmpCardNo).ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

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
                                titleCol.Item().Text($"New Appointments Report ({fromDate:dd/MM/yyyy} to {toDate:dd/MM/yyyy})").SemiBold().FontSize(12).FontColor("#3B82F6");
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
                                columns.ConstantColumn(25);  // Sr No
                                if (withImage)
                                {
                                    columns.ConstantColumn(35); // Photo
                                }
                                columns.ConstantColumn(45);  // Card No
                                columns.RelativeColumn(2.5f);// Employee Name
                                columns.RelativeColumn(2);   // Department
                                columns.RelativeColumn(2);   // Designation
                                columns.ConstantColumn(65);  // DOB
                                columns.ConstantColumn(65);  // Joining Date
                                columns.RelativeColumn(1.8f);// Qualification
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                if (withImage)
                                {
                                    header.Cell().Background("#1E3A8A").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                }
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Qualification").Bold().FontColor(Colors.White);
                            });

                            // Rows
                            int srNo = 1;
                            foreach (var emp in employees)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                table.Cell().Background(bg).Padding(4).Text(srNo.ToString()).AlignCenter();
                                
                                if (withImage)
                                {
                                    if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                    {
                                        table.Cell().Background(bg).Padding(2).Height(28).Width(28).Image(emp.EmpPicture);
                                    }
                                    else
                                    {
                                        table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                    }
                                }

                                table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(4).Text(dName);
                                table.Cell().Background(bg).Padding(4).Text(desgName);
                                table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(4).Text(emp.Qualification ?? "");
                                
                                srNo++;
                            }

                            if (employees.Count == 0)
                            {
                                int span = withImage ? 9 : 8;
                                table.Cell().ColumnSpan((uint)span).Padding(20).AlignCenter().Text("No new appointments found for the specified period and filters.").Italic().FontColor(Colors.Grey.Medium);
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

        public async Task<byte[]> GenerateAdvanceApplicationReportAsync(int empCardNo, string site, string userName)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var emp = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmpCardNo == empCardNo && e.Site == site);
            if (emp == null) throw new Exception("Employee not found.");

            var dept = await _db.Departments.AsNoTracking().FirstOrDefaultAsync(d => d.DepartmentCode == emp.DeptCode && d.Site == site);
            var desig = await _db.Designations.AsNoTracking().FirstOrDefaultAsync(d => d.DesignationCode == emp.DesgCode && d.Site == site);
            var sal = await _db.EmpSalaries.AsNoTracking().FirstOrDefaultAsync(s => s.EmpCardNo == empCardNo && s.Site == site);

            var deptName = dept?.DepartmentName ?? "N/A";
            var desigName = desig?.DesignationName ?? "N/A";
            var basicPay = sal?.BasicPay ?? 0;
            var grossPay = sal?.GrossPay ?? 0;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2.0f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial").FontColor(Colors.Black));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().AlignCenter().Text(siteFullName).Bold().FontSize(16).FontColor("#1E3A8A");
                        col.Item().AlignCenter().Text("SALARY ADVANCE APPLICATION FORM").SemiBold().FontSize(12).FontColor("#3B82F6");
                        col.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                    });

                    // Content
                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Spacing(15);

                        // Employee Details Block
                        col.Item().Text("1. Employee Information").Bold().FontSize(11).FontColor("#1E3A8A");
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Cell().Text("Emp Card #").Bold();
                            table.Cell().Text(emp.EmpCardNo.ToString());
                            table.Cell().Text("Joining Date").Bold();
                            table.Cell().Text(emp.JoiningDate?.ToString("dd-MMM-yyyy") ?? "N/A");

                            table.Cell().Text("Name").Bold();
                            table.Cell().Text(emp.EmpName ?? "N/A");
                            table.Cell().Text("Father Name").Bold();
                            table.Cell().Text(emp.EmpFatherName ?? "N/A");

                            table.Cell().Text("Department").Bold();
                            table.Cell().Text(deptName);
                            table.Cell().Text("Designation").Bold();
                            table.Cell().Text(desigName);

                            table.Cell().Text("Date of Birth").Bold();
                            table.Cell().Text(emp.BirthDate?.ToString("dd-MMM-yyyy") ?? "N/A");
                            table.Cell().Text("Gender / Shift").Bold();
                            table.Cell().Text($"{emp.Sex ?? "N/A"} / {emp.Shift ?? "N/A"}");

                            table.Cell().Text("Basic Pay").Bold();
                            table.Cell().Text(basicPay.ToString("N0"));
                            table.Cell().Text("Gross Pay").Bold();
                            table.Cell().Text(grossPay.ToString("N0"));
                        });

                        // Advance Details Block
                        col.Item().Text("2. Advance Request Details").Bold().FontSize(11).FontColor("#1E3A8A");
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(advCol =>
                        {
                            advCol.Spacing(15);
                            advCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text("Requested Amount: ____________________");
                                row.RelativeItem().Text("Installments: ____________________");
                            });
                            advCol.Item().Text("Reason for Advance:");
                            advCol.Item().Text("__________________________________________________________________________________________");
                            advCol.Item().Text("__________________________________________________________________________________________");
                        });

                        // Terms & Signature
                        col.Item().Text("3. Declaration & Signatures").Bold().FontSize(11).FontColor("#1E3A8A");
                        col.Item().Text("I hereby authorize the recovery of this advance in monthly installments from my salary.").Italic().FontSize(9);

                        col.Item().PaddingTop(30).Row(row =>
                        {
                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().AlignCenter().Text("________________________").FontSize(10);
                                sigCol.Item().AlignCenter().Text("Employee Signature").Bold().FontSize(9);
                            });
                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().AlignCenter().Text("________________________").FontSize(10);
                                sigCol.Item().AlignCenter().Text("HOD / Supervisor").Bold().FontSize(9);
                            });
                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().AlignCenter().Text("________________________").FontSize(10);
                                sigCol.Item().AlignCenter().Text("HR Department").Bold().FontSize(9);
                            });
                        });

                        col.Item().PaddingTop(30).Row(row =>
                        {
                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().AlignCenter().Text("________________________").FontSize(10);
                                sigCol.Item().AlignCenter().Text("Finance Dept").Bold().FontSize(9);
                            });
                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().AlignCenter().Text("________________________").FontSize(10);
                                sigCol.Item().AlignCenter().Text("Principal / Director").Bold().FontSize(9);
                            });
                        });
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.RelativeItem().Text($"Generated by: {userName} via SAFT HRMS").FontSize(8).FontColor(Colors.Grey.Medium);
                            row.RelativeItem().AlignRight().Text($"Date: {DateTime.Now:dd-MMM-yyyy}").FontSize(8).FontColor(Colors.Grey.Medium);
                        });
                    });
                });
            }).GeneratePdf();

            return pdf;
        }

        public async Task<byte[]> GenerateEmployeesLeftReportAsync(string site, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var query = _db.Employees.AsNoTracking().Where(e => e.Site == site && e.StuckOff == true);
            var employees = await query.OrderByDescending(e => e.StuckOffDate).ThenBy(e => e.EmpCardNo).ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

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
                                titleCol.Item().Text("Employee List (Left)").SemiBold().FontSize(12).FontColor("#EF4444");
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
                                columns.ConstantColumn(25);  // Sr No
                                if (withImage)
                                {
                                    columns.ConstantColumn(35); // Photo
                                }
                                columns.ConstantColumn(45);  // Card No
                                columns.RelativeColumn(2.5f);// Employee Name
                                columns.RelativeColumn(2);   // Department
                                columns.RelativeColumn(2);   // Designation
                                columns.ConstantColumn(65);  // DOB
                                columns.ConstantColumn(65);  // Join Date
                                columns.ConstantColumn(65);  // Left Date
                                columns.RelativeColumn(2);   // Left Reason
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                if (withImage)
                                {
                                    header.Cell().Background("#1E3A8A").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                }
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Left Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Left Reason").Bold().FontColor(Colors.White);
                            });

                            // Rows
                            int srNo = 1;
                            foreach (var emp in employees)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                table.Cell().Background(bg).Padding(4).Text(srNo.ToString()).AlignCenter();

                                if (withImage)
                                {
                                    if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                    {
                                        table.Cell().Background(bg).Padding(2).Height(28).Width(28).Image(emp.EmpPicture);
                                    }
                                    else
                                    {
                                        table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                    }
                                }

                                table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(4).Text(dName);
                                table.Cell().Background(bg).Padding(4).Text(desgName);
                                table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(4).Text(emp.StuckOffDate?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(4).Text(emp.LeftType ?? "");

                                srNo++;
                            }

                            if (employees.Count == 0)
                            {
                                int span = withImage ? 10 : 9;
                                table.Cell().ColumnSpan((uint)span).Padding(20).AlignCenter().Text("No left employees found.").Italic().FontColor(Colors.Grey.Medium);
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

        public async Task<byte[]> GenerateEmployeeOpeningBalancesReportAsync(string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var employees = await _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true)
                .OrderBy(e => e.EmpCardNo)
                .ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var balances = await _db.EmpOpeningBalances.Where(b => b.Site == site).ToDictionaryAsync(b => b.EmpCardNo);

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
                                titleCol.Item().Text("Employee List with Opening Balances").SemiBold().FontSize(12).FontColor("#10B981");
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
                                columns.ConstantColumn(30);  // Sr No
                                columns.ConstantColumn(50);  // Card No
                                columns.RelativeColumn(3);     // Employee Name
                                columns.RelativeColumn(2);     // Department
                                columns.ConstantColumn(70);  // Opening Date
                                columns.ConstantColumn(65);  // EOBI Opening
                                columns.ConstantColumn(65);  // SS Opening
                                columns.ConstantColumn(65);  // PF Opening
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Opening Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("EOBI Open").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("SS Open").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("PF Open").Bold().FontColor(Colors.White).AlignRight();
                            });

                            // Rows
                            int srNo = 1;
                            foreach (var emp in employees)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                balances.TryGetValue(emp.EmpCardNo, out var bal);

                                table.Cell().Background(bg).Padding(5).Text(srNo.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(5).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(5).Text(emp.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(5).Text(dName);

                                if (bal != null)
                                {
                                    table.Cell().Background(bg).Padding(5).Text(bal.OpeningDate?.ToString("dd/MM/yyyy") ?? "-").AlignCenter();
                                    table.Cell().Background(bg).Padding(5).Text(bal.EobiOpening?.ToString("N2") ?? "0.00").AlignRight();
                                    table.Cell().Background(bg).Padding(5).Text(bal.SocialSecurityOpening?.ToString("N2") ?? "0.00").AlignRight();
                                    table.Cell().Background(bg).Padding(5).Text(bal.ProvidantFundOpening?.ToString("N2") ?? "0.00").AlignRight();
                                }
                                else
                                {
                                    table.Cell().Background(bg).Padding(5).Text("Not Set").AlignCenter().Italic().FontColor(Colors.Grey.Medium);
                                    table.Cell().Background(bg).Padding(5).Text("0.00").AlignRight();
                                    table.Cell().Background(bg).Padding(5).Text("0.00").AlignRight();
                                    table.Cell().Background(bg).Padding(5).Text("0.00").AlignRight();
                                }

                                srNo++;
                            }

                            if (employees.Count == 0)
                            {
                                table.Cell().ColumnSpan(8).Padding(20).AlignCenter().Text("No active employees found.").Italic().FontColor(Colors.Grey.Medium);
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

        public async Task<byte[]> GenerateEmployeePfLedgerReportAsync(int empCardNo, string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var emp = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmpCardNo == empCardNo && e.Site == site);
            if (emp == null) throw new Exception("Employee not found");

            var deptName = await _db.Departments.AsNoTracking().Where(d => d.DepartmentCode == emp.DeptCode && d.Site == site).Select(d => d.DepartmentName).FirstOrDefaultAsync() ?? "";
            var desigName = await _db.Designations.AsNoTracking().Where(d => d.DesignationCode == emp.DesgCode && d.Site == site).Select(d => d.DesignationName).FirstOrDefaultAsync() ?? "";

            var openingBalance = await _db.EmpOpeningBalances.AsNoTracking()
                .Where(u => u.EmpCardNo == empCardNo && u.Site == site)
                .FirstOrDefaultAsync();

            var ledgerRows = await _db.HrmPfLedgers.AsNoTracking()
                .Where(u => u.EmpCardNo == empCardNo && u.Site == site)
                .OrderBy(u => u.TransactionDate)
                .ToListAsync();

            decimal pfOpening = openingBalance?.ProvidantFundOpening ?? 0;
            DateTime? pfOpeningDate = openingBalance?.OpeningDate;

            var entries = new List<PfLedgerEntry>();
            decimal balance = 0;

            if (pfOpening != 0 || openingBalance != null)
            {
                balance += pfOpening;
                entries.Add(new PfLedgerEntry
                {
                    Date = pfOpeningDate ?? emp.JoiningDate ?? DateTime.Today,
                    Description = "Opening Balance",
                    ProvidantFund = pfOpening,
                    LoanAmount = 0,
                    LoanInstallment = 0,
                    Balance = balance
                });
            }

            foreach (var row in ledgerRows)
            {
                decimal pfAmount = row.ProvidantFund ?? 0;
                balance += pfAmount;

                entries.Add(new PfLedgerEntry
                {
                    Date = row.TransactionDate,
                    Description = row.PfType ?? "Contribution",
                    ProvidantFund = pfAmount,
                    LoanAmount = row.LoanAmount ?? 0,
                    LoanInstallment = row.LoanInstallment ?? 0,
                    Balance = balance
                });
            }

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
                                titleCol.Item().Text("Employee Provident Fund Ledger").SemiBold().FontSize(12).FontColor("#3B82F6");
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

                        // Table
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);  // Sr No
                                columns.ConstantColumn(70);  // Date
                                columns.RelativeColumn(2);   // Description
                                columns.ConstantColumn(70);  // PF Contribution
                                columns.ConstantColumn(70);  // Loan Amount
                                columns.ConstantColumn(70);  // Loan Installment
                                columns.ConstantColumn(80);  // Balance
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Description").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("PF Amount").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Loan Amt").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Installment").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Balance").Bold().FontColor(Colors.White).AlignRight();
                            });

                            // Rows
                            int sr = 1;
                            foreach (var entry in entries)
                            {
                                var bg = sr % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;

                                table.Cell().Background(bg).Padding(5).Text(sr.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(5).Text(entry.Date?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(5).Text(entry.Description);
                                table.Cell().Background(bg).Padding(5).Text(entry.ProvidantFund.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(entry.LoanAmount.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(entry.LoanInstallment.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(entry.Balance.ToString("N2")).AlignRight().Bold();

                                sr++;
                            }

                            if (entries.Count == 0)
                            {
                                table.Cell().ColumnSpan(7).Padding(20).AlignCenter().Text("No PF ledger transactions found for this employee.").Italic().FontColor(Colors.Grey.Medium);
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

        public async Task<byte[]> GenerateEmployeesByReligionReportAsync(string site, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var employees = await _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true)
                .OrderBy(e => e.Religion)
                .ThenBy(e => e.EmpCardNo)
                .ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

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
                                titleCol.Item().Text("Religion-wise Active Employee List").SemiBold().FontSize(12).FontColor("#D97706");
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
                        col.Spacing(15);

                        var grouped = employees.GroupBy(e => string.IsNullOrWhiteSpace(e.Religion) ? "Unspecified Religion" : e.Religion.Trim()).ToList();

                        foreach (var group in grouped)
                        {
                            col.Item().Column(religCol =>
                            {
                                religCol.Spacing(5);
                                religCol.Item().Background("#FEF3C7").Padding(5).Text($"{group.Key} ({group.Count()} Employees)").Bold().FontSize(11).FontColor("#B45309");

                                religCol.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(25);  // Sr No
                                        if (withImage)
                                        {
                                            columns.ConstantColumn(35); // Image
                                        }
                                        columns.ConstantColumn(45);  // Card No
                                        columns.RelativeColumn(3);   // Employee Name
                                        columns.RelativeColumn(2);   // Department
                                        columns.RelativeColumn(2);   // Designation
                                        columns.ConstantColumn(45);  // Gender/Shift
                                        columns.ConstantColumn(65);  // DOB
                                        columns.ConstantColumn(70);  // Joining Date
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#D97706").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                        if (withImage)
                                        {
                                            header.Cell().Background("#D97706").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                        }
                                        header.Cell().Background("#D97706").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#D97706").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#D97706").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#D97706").Padding(4).Text("Designation").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#D97706").Padding(4).Text("Gen/Shf").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#D97706").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#D97706").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                    });

                                    // Rows
                                    int sr = 1;
                                    foreach (var emp in group)
                                    {
                                        var bg = sr % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                        var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                        var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                        table.Cell().Background(bg).Padding(4).Text(sr.ToString()).AlignCenter();

                                        if (withImage)
                                        {
                                            if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                            {
                                                table.Cell().Background(bg).Padding(2).Height(25).Width(25).Image(emp.EmpPicture);
                                            }
                                            else
                                            {
                                                table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                            }
                                        }

                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                        table.Cell().Background(bg).Padding(4).Text(dName);
                                        table.Cell().Background(bg).Padding(4).Text(desgName);
                                        table.Cell().Background(bg).Padding(4).Text($"{emp.Sex ?? ""}/{emp.Shift ?? ""}");
                                        table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                        table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                        sr++;
                                    }
                                });
                            });
                        }

                        if (employees.Count == 0)
                        {
                            col.Item().AlignCenter().Text("No active employees found.").Italic().FontColor(Colors.Grey.Medium);
                        }
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

        public async Task<byte[]> GenerateEmployeesByServiceReportAsync(string site, bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var employees = await _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true)
                .OrderBy(e => e.EmpStatus)
                .ThenBy(e => e.EmpCardNo)
                .ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

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
                                titleCol.Item().Text("Service-wise Active Employee List").SemiBold().FontSize(12).FontColor("#4F46E5");
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
                        col.Spacing(15);

                        var grouped = employees.GroupBy(e => string.IsNullOrWhiteSpace(e.EmpStatus) ? "Unspecified Service" : e.EmpStatus.Trim()).ToList();

                        foreach (var group in grouped)
                        {
                            col.Item().Column(serviceCol =>
                            {
                                serviceCol.Spacing(5);
                                serviceCol.Item().Background("#EEF2F6").Padding(5).Text($"{group.Key} ({group.Count()} Employees)").Bold().FontSize(11).FontColor("#312E81");

                                serviceCol.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(25);  // Sr No
                                        if (withImage)
                                        {
                                            columns.ConstantColumn(35); // Image
                                        }
                                        columns.ConstantColumn(45);  // Card No
                                        columns.RelativeColumn(3);   // Employee Name
                                        columns.RelativeColumn(2);   // Department
                                        columns.RelativeColumn(2);   // Designation
                                        columns.ConstantColumn(45);  // Gender/Shift
                                        columns.ConstantColumn(65);  // DOB
                                        columns.ConstantColumn(70);  // Joining Date
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                        if (withImage)
                                        {
                                            header.Cell().Background("#4F46E5").Padding(4).Text("Photo").Bold().FontColor(Colors.White);
                                        }
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Card #").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Employee Name").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Designation").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Gen/Shf").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#4F46E5").Padding(4).Text("DOB").Bold().FontColor(Colors.White);
                                        header.Cell().Background("#4F46E5").Padding(4).Text("Join Date").Bold().FontColor(Colors.White);
                                    });

                                    // Rows
                                    int sr = 1;
                                    foreach (var emp in group)
                                    {
                                        var bg = sr % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                        var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                        var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                        table.Cell().Background(bg).Padding(4).Text(sr.ToString()).AlignCenter();

                                        if (withImage)
                                        {
                                            if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                            {
                                                table.Cell().Background(bg).Padding(2).Height(25).Width(25).Image(emp.EmpPicture);
                                            }
                                            else
                                            {
                                                table.Cell().Background(bg).Padding(4).Text("-").AlignCenter();
                                            }
                                        }

                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                        table.Cell().Background(bg).Padding(4).Text(emp.EmpName ?? "").Bold();
                                        table.Cell().Background(bg).Padding(4).Text(dName);
                                        table.Cell().Background(bg).Padding(4).Text(desgName);
                                        table.Cell().Background(bg).Padding(4).Text($"{emp.Sex ?? ""}/{emp.Shift ?? ""}");
                                        table.Cell().Background(bg).Padding(4).Text(emp.BirthDate?.ToString("dd/MM/yyyy") ?? "-");
                                        table.Cell().Background(bg).Padding(4).Text(emp.JoiningDate?.ToString("dd/MM/yyyy") ?? "");
                                        sr++;
                                    }
                                });
                            });
                        }

                        if (employees.Count == 0)
                        {
                            col.Item().AlignCenter().Text("No active employees found.").Italic().FontColor(Colors.Grey.Medium);
                        }
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

        public async Task<byte[]> GenerateEmployeePfLedgerAllReportAsync(string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var employees = await _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true)
                .OrderBy(e => e.EmpCardNo)
                .ToListAsync();

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var openings = await _db.EmpOpeningBalances.Where(b => b.Site == site).ToDictionaryAsync(b => b.EmpCardNo);
            
            var ledgerGroupsQuery = await _db.HrmPfLedgers.AsNoTracking()
                .Where(l => l.Site == site)
                .GroupBy(l => l.EmpCardNo)
                .Select(g => new
                {
                    EmpCardNo = g.Key,
                    TotalPf = g.Sum(x => x.ProvidantFund ?? 0),
                    TotalLoan = g.Sum(x => x.LoanAmount ?? 0),
                    TotalInstallment = g.Sum(x => x.LoanInstallment ?? 0)
                })
                .ToListAsync();

            var ledgerGroups = ledgerGroupsQuery.ToDictionary(
                g => g.EmpCardNo,
                g => new
                {
                    g.TotalPf,
                    g.TotalLoan,
                    g.TotalInstallment
                }
            );

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
                                titleCol.Item().Text("Employees Provident Fund Ledgers Summary").SemiBold().FontSize(12).FontColor("#10B981");
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
                                columns.ConstantColumn(30);   // Sr No
                                columns.ConstantColumn(50);   // Card No
                                columns.RelativeColumn(3);    // Employee Name
                                columns.RelativeColumn(2);    // Department
                                columns.ConstantColumn(75);   // Opening Balance
                                columns.ConstantColumn(75);   // PF Contribution
                                columns.ConstantColumn(75);   // Loan Amount
                                columns.ConstantColumn(75);   // Installments
                                columns.ConstantColumn(80);   // Net Balance
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Opening").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("PF Contrib").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Loan Amt").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Installment").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Net PF Bal").Bold().FontColor(Colors.White).AlignRight();
                            });

                            // Rows
                            int srNo = 1;
                            foreach (var emp in employees)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                var dName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                
                                openings.TryGetValue(emp.EmpCardNo, out var open);
                                decimal openingVal = open?.ProvidantFundOpening ?? 0;

                                decimal pfContrib = 0;
                                decimal loanAmt = 0;
                                decimal installments = 0;
                                if (ledgerGroups.TryGetValue(emp.EmpCardNo, out var ledgerSum))
                                {
                                    pfContrib = ledgerSum.TotalPf;
                                    loanAmt = ledgerSum.TotalLoan;
                                    installments = ledgerSum.TotalInstallment;
                                }

                                decimal netBalance = openingVal + pfContrib;

                                table.Cell().Background(bg).Padding(5).Text(srNo.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(5).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(5).Text(emp.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(5).Text(dName);
                                table.Cell().Background(bg).Padding(5).Text(openingVal.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(pfContrib.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(loanAmt.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(installments.ToString("N2")).AlignRight();
                                table.Cell().Background(bg).Padding(5).Text(netBalance.ToString("N2")).AlignRight().Bold();

                                srNo++;
                            }

                            if (employees.Count == 0)
                            {
                                table.Cell().ColumnSpan(9).Padding(20).AlignCenter().Text("No active employees found.").Italic().FontColor(Colors.Grey.Medium);
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

        public async Task<byte[]> GenerateEmployeeDobReportAsync(
            string site,
            DateTime? fromDate,
            DateTime? toDate,
            int? deptCode,
            int? desigCode,
            bool withImage)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);

            // Only Active employees with non-null BirthDate
            var query = _db.Employees.AsNoTracking()
                .Where(e => e.Site == site && e.Status == true && e.BirthDate != null);

            if (deptCode.HasValue && deptCode.Value > 0)
            {
                query = query.Where(e => e.DeptCode == deptCode.Value);
            }

            if (desigCode.HasValue && desigCode.Value > 0)
            {
                query = query.Where(e => e.DesgCode == desigCode.Value);
            }

            var allEmployees = await query.ToListAsync();

            // Filter by birth month / date range
            List<Employee> filteredEmployees;
            string periodSubTitle;

            if (fromDate.HasValue && toDate.HasValue)
            {
                var start = fromDate.Value;
                var end = toDate.Value;

                var fromVal = start.Month * 100 + start.Day;
                var toVal = end.Month * 100 + end.Day;

                if (fromVal <= toVal)
                {
                    filteredEmployees = allEmployees
                        .Where(e => {
                            var bVal = e.BirthDate!.Value.Month * 100 + e.BirthDate!.Value.Day;
                            return bVal >= fromVal && bVal <= toVal;
                        })
                        .OrderBy(e => e.BirthDate!.Value.Month * 100 + e.BirthDate!.Value.Day)
                        .ThenBy(e => e.EmpName)
                        .ToList();
                }
                else
                {
                    filteredEmployees = allEmployees
                        .Where(e => {
                            var bVal = e.BirthDate!.Value.Month * 100 + e.BirthDate!.Value.Day;
                            return bVal >= fromVal || bVal <= toVal;
                        })
                        .OrderBy(e => e.BirthDate!.Value.Month * 100 + e.BirthDate!.Value.Day)
                        .ThenBy(e => e.EmpName)
                        .ToList();
                }

                periodSubTitle = $"Date of Birth Period: {start:dd MMM yyyy} to {end:dd MMM yyyy}";
            }
            else
            {
                var currentMonth = DateTime.Today.Month;
                var monthName = DateTime.Today.ToString("MMMM");

                filteredEmployees = allEmployees
                    .Where(e => e.BirthDate!.Value.Month == currentMonth)
                    .OrderBy(e => e.BirthDate!.Value.Day)
                    .ThenBy(e => e.EmpName)
                    .ToList();

                periodSubTitle = $"Birthday Month: {monthName} (Current Month)";
            }

            var deptDict = await _db.Departments.Where(d => d.Site == site).ToDictionaryAsync(d => d.DepartmentCode, d => d.DepartmentName ?? "");
            var desigDict = await _db.Designations.Where(d => d.Site == site).ToDictionaryAsync(d => d.DesignationCode, d => d.DesignationName ?? "");

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
                                titleCol.Item().Text("Employee Date of Birth (Birthday) Report").SemiBold().FontSize(12).FontColor("#3B82F6");
                                titleCol.Item().Text(periodSubTitle).FontSize(9).FontColor(Colors.Grey.Darken1);
                            });
                            row.ConstantItem(120).AlignRight().Column(siteCol =>
                            {
                                siteCol.Item().Text($"SITE: {site}").Bold().FontSize(10).FontColor(Colors.Grey.Medium);
                                siteCol.Item().Text($"Active: {filteredEmployees.Count}").Bold().FontSize(9).FontColor("#10B981");
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
                                columns.ConstantColumn(25);  // Sr No
                                if (withImage)
                                {
                                    columns.ConstantColumn(35); // Photo
                                }
                                columns.ConstantColumn(45);  // Card No
                                columns.RelativeColumn(2.5f); // Employee Name
                                columns.RelativeColumn(2);    // Department
                                columns.RelativeColumn(2);    // Designation
                                columns.ConstantColumn(65);  // Date of Birth
                                columns.ConstantColumn(60);  // Birthday
                                columns.ConstantColumn(30);  // Age
                                columns.ConstantColumn(65);  // Contact
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Sr").Bold().FontSize(8.5f).FontColor(Colors.White);
                                if (withImage)
                                {
                                    header.Cell().Background("#1E3A8A").Padding(3).Text("Photo").Bold().FontSize(8.5f).FontColor(Colors.White);
                                }
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Card #").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Employee Name").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Department").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Designation").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("DOB").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Birthday").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Age").Bold().FontSize(8.5f).FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(3).Text("Contact").Bold().FontSize(8.5f).FontColor(Colors.White);
                            });

                            int sr = 1;
                            foreach (var emp in filteredEmployees)
                            {
                                var bg = sr % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                var deptName = (emp.DeptCode.HasValue && deptDict.ContainsKey(emp.DeptCode.Value)) ? deptDict[emp.DeptCode.Value] : "";
                                var desgName = (emp.DesgCode.HasValue && desigDict.ContainsKey(emp.DesgCode.Value)) ? desigDict[emp.DesgCode.Value] : "";

                                var dob = emp.BirthDate!.Value;
                                var age = DateTime.Today.Year - dob.Year;
                                if (DateTime.Today < dob.AddYears(age)) age--;

                                table.Cell().Background(bg).Padding(3).Text(sr.ToString()).AlignCenter();

                                if (withImage)
                                {
                                    if (emp.EmpPicture != null && emp.EmpPicture.Length > 0)
                                    {
                                        table.Cell().Background(bg).Padding(2).Height(24).Width(24).Image(emp.EmpPicture);
                                    }
                                    else
                                    {
                                        table.Cell().Background(bg).Padding(3).Text("-").AlignCenter();
                                    }
                                }

                                table.Cell().Background(bg).Padding(3).Text(emp.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(3).Text(emp.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(3).Text(deptName);
                                table.Cell().Background(bg).Padding(3).Text(desgName);
                                table.Cell().Background(bg).Padding(3).Text(dob.ToString("dd-MMM-yyyy"));
                                table.Cell().Background(bg).Padding(3).Text(dob.ToString("dd MMMM")).SemiBold();
                                table.Cell().Background(bg).Padding(3).Text(age > 0 ? age.ToString() : "-").AlignCenter();
                                table.Cell().Background(bg).Padding(3).Text(emp.PhoneNo ?? emp.EmergencyNo ?? "");

                                sr++;
                            }

                            if (filteredEmployees.Count == 0)
                            {
                                int span = withImage ? 10 : 9;
                                table.Cell().ColumnSpan((uint)span).Padding(25).AlignCenter().Text("No active employees found with birthdays in the selected period.").Italic().FontColor(Colors.Grey.Medium);
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

        private class PfLedgerEntry
        {
            public DateTime? Date { get; set; }
            public string Description { get; set; } = "";
            public decimal ProvidantFund { get; set; }
            public decimal LoanAmount { get; set; }
            public decimal LoanInstallment { get; set; }
            public decimal Balance { get; set; }
        }
    }
}
