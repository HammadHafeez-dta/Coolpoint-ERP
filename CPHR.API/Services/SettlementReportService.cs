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
    public class SettlementReportService
    {
        private readonly HRMSDbContext _db;
        private readonly ISiteInfoService? _siteInfoService;

        public SettlementReportService(HRMSDbContext db, ISiteInfoService? siteInfoService = null)
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

        public async Task<byte[]> GenerateSettlementDetailReportAsync(int transactionNo, string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var settlement = await _db.HrmVewFinalSettlements
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.TransactionNo == transactionNo && s.Site == site);

            if (settlement == null)
            {
                throw new Exception("Settlement record not found.");
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
                                titleCol.Item().Text("Final Settlement Statement").SemiBold().FontSize(12).FontColor("#3B82F6");
                            });
                            row.ConstantItem(120).AlignRight().Column(siteCol =>
                            {
                                siteCol.Item().Text($"SITE: {site}").Bold().FontSize(10).FontColor(Colors.Grey.Medium);
                                siteCol.Item().Text($"Trans No: {transactionNo}").FontSize(9).Bold().FontColor("#1E3A8A");
                                siteCol.Item().Text($"Date: {settlement.TransactionDate?.ToString("dd MMM yyyy") ?? "-"}").FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Content
                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Spacing(12);

                        // Employee details section
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten5).Padding(10).Column(infoCol =>
                        {
                            infoCol.Spacing(4);
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Employee Name: ").Bold(); t.Span(settlement.EmpName ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("Card No: ").Bold(); t.Span(settlement.EmpCardNo?.ToString() ?? ""); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Father Name: ").Bold(); t.Span(settlement.EmpFatherName ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("CNIC: ").Bold(); t.Span(settlement.Cnic ?? ""); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Department: ").Bold(); t.Span(settlement.DepartmentName ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("Designation: ").Bold(); t.Span(settlement.DesignationName ?? ""); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Joining Date: ").Bold(); t.Span(settlement.JoiningDate?.ToString("dd/MM/yyyy") ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("Leaving Date: ").Bold(); t.Span(settlement.LeavingDate?.ToString("dd/MM/yyyy") ?? ""); });
                            });
                            infoCol.Item().Row(row =>
                            {
                                row.RelativeItem().Text(t => { t.Span("Leaving Type: ").Bold(); t.Span(settlement.LeavingType ?? ""); });
                                row.RelativeItem().Text(t => { t.Span("Last Present: ").Bold(); t.Span(settlement.LastPresent ?? ""); });
                            });
                        });

                        // Salary and Allowances
                        col.Item().Row(row =>
                        {
                            row.Spacing(20);

                            // Additions
                            row.RelativeItem().Column(addCol =>
                            {
                                addCol.Item().BorderBottom(1).BorderColor("#1E3A8A").PaddingBottom(2).Text("ADDITIONS / PAYABLE").Bold().FontSize(10).FontColor("#1E3A8A");
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Basic Pay"); r.ConstantItem(60).AlignRight().Text((settlement.BasicPay ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Gross Pay"); r.ConstantItem(60).AlignRight().Text((settlement.GrossPay ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text($"Salary ({settlement.SalaryDays ?? 0} days)"); r.ConstantItem(60).AlignRight().Text((settlement.SalaryAmount ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text($"Badli ({settlement.BadliDays ?? 0} days)"); r.ConstantItem(60).AlignRight().Text((settlement.BadliAmount ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text($"Overtime ({settlement.OverTimeHours ?? 0} hrs)"); r.ConstantItem(60).AlignRight().Text((settlement.OverTimeAmount ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Graduity Amount"); r.ConstantItem(60).AlignRight().Text((settlement.GraduityAmount ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text($"Leaves Payable ({settlement.LeavesPayable ?? 0})"); r.ConstantItem(60).AlignRight().Text((settlement.LeavesAmount ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Notice Days Amount"); r.ConstantItem(60).AlignRight().Text((settlement.NoticeAmount ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Unpaid Salary"); r.ConstantItem(60).AlignRight().Text((settlement.SalaryUnpaid ?? 0).ToString("N0")); });
                                addCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Other Payables / Commission"); r.ConstantItem(60).AlignRight().Text(((settlement.OtherPayable ?? 0) + (settlement.Commission ?? 0)).ToString("N0")); });

                                decimal totalAdditions = (settlement.SalaryAmount ?? 0) + (settlement.BadliAmount ?? 0) + (settlement.OverTimeAmount ?? 0) +
                                                         (settlement.GraduityAmount ?? 0) + (settlement.LeavesAmount ?? 0) + (settlement.NoticeAmount ?? 0) +
                                                         (settlement.SalaryUnpaid ?? 0) + (settlement.OtherPayable ?? 0) + (settlement.Commission ?? 0);
                                addCol.Item().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(4).Row(r => { r.RelativeItem().Text("Total Additions").Bold(); r.ConstantItem(60).AlignRight().Text(totalAdditions.ToString("N0")).Bold(); });
                            });

                            // Deductions
                            row.RelativeItem().Column(dedCol =>
                            {
                                dedCol.Item().BorderBottom(1).BorderColor("#B91C1C").PaddingBottom(2).Text("DEDUCTIONS").Bold().FontSize(10).FontColor("#B91C1C");
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Salary Advance"); r.ConstantItem(60).AlignRight().Text((settlement.SalaryAdvance ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Loan (Long term)"); r.ConstantItem(60).AlignRight().Text((settlement.LoanAmount ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("EOBI"); r.ConstantItem(60).AlignRight().Text((settlement.Eobi ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Provident Fund"); r.ConstantItem(60).AlignRight().Text((settlement.ProvidentFund ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Provident Fund Profit"); r.ConstantItem(60).AlignRight().Text((settlement.ProvidentFundProfit ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Vehicle Loan"); r.ConstantItem(60).AlignRight().Text((settlement.VehicleLoan ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Fabric Loan"); r.ConstantItem(60).AlignRight().Text((settlement.FabricLoan ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Mobile / Fuel Allowance"); r.ConstantItem(60).AlignRight().Text(((settlement.MobileAllowance ?? 0) + (settlement.FuelAllowance ?? 0)).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Income Tax"); r.ConstantItem(60).AlignRight().Text((settlement.IncomeTax ?? 0).ToString("N0")); });
                                dedCol.Item().PaddingVertical(4).Row(r => { r.RelativeItem().Text("Other Deductions"); r.ConstantItem(60).AlignRight().Text((settlement.OtherDeductions ?? 0).ToString("N0")); });

                                decimal totalDeductions = (settlement.SalaryAdvance ?? 0) + (settlement.LoanAmount ?? 0) + (settlement.Eobi ?? 0) +
                                                          (settlement.ProvidentFund ?? 0) + (settlement.ProvidentFundProfit ?? 0) + (settlement.VehicleLoan ?? 0) +
                                                          (settlement.FabricLoan ?? 0) + (settlement.MobileAllowance ?? 0) + (settlement.FuelAllowance ?? 0) +
                                                          (settlement.IncomeTax ?? 0) + (settlement.OtherDeductions ?? 0);
                                dedCol.Item().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(4).Row(r => { r.RelativeItem().Text("Total Deductions").Bold(); r.ConstantItem(60).AlignRight().Text(totalDeductions.ToString("N0")).Bold(); });
                            });
                        });

                        // Net Payable
                        col.Item().PaddingTop(10).Background("#EFF6FF").Border(1).BorderColor("#BFDBFE").Padding(10).Row(row =>
                        {
                            row.RelativeItem().Text("NET PAYABLE AMOUNT").Bold().FontSize(12).FontColor("#1E3A8A");
                            row.ConstantItem(150).AlignRight().Text($"Rs. {(settlement.PayableAmount ?? 0):N0}").Bold().FontSize(14).FontColor("#1E3A8A");
                        });

                        // Signatures
                        col.Item().PaddingTop(40).Row(row =>
                        {
                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().LineHorizontal(1).LineColor(Colors.Grey.Darken1);
                                c.Item().PaddingTop(2).Text("Prepared By").FontSize(8).AlignCenter();
                            });
                            row.ConstantItem(40);
                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().LineHorizontal(1).LineColor(Colors.Grey.Darken1);
                                c.Item().PaddingTop(2).Text("Checked By").FontSize(8).AlignCenter();
                            });
                            row.ConstantItem(40);
                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().LineHorizontal(1).LineColor(Colors.Grey.Darken1);
                                c.Item().PaddingTop(2).Text("Approved By").FontSize(8).AlignCenter();
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

        public async Task<byte[]> GenerateSettlementSummaryReportAsync(DateTime fromDate, DateTime toDate, string site)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var settlements = await _db.HrmVewFinalSettlements
                .AsNoTracking()
                .Where(s => s.Site == site && s.TransactionDate >= fromDate && s.TransactionDate <= toDate)
                .OrderBy(s => s.TransactionDate)
                .ThenBy(s => s.EmpCardNo)
                .ToListAsync();

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
                                titleCol.Item().Text($"Final Settlements Summary ({fromDate:dd/MM/yyyy} to {toDate:dd/MM/yyyy})").SemiBold().FontSize(12).FontColor("#3B82F6");
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
                                columns.ConstantColumn(80);  // Trans Date
                                columns.ConstantColumn(50);  // Card No
                                columns.RelativeColumn(2);   // Employee Name
                                columns.RelativeColumn(2);   // Department
                                columns.RelativeColumn(2);   // Designation
                                columns.ConstantColumn(80);  // Leaving Date
                                columns.ConstantColumn(80);  // Net Payable
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Trans Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Card #").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Employee Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Designation").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Leaving Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(5).Text("Net Payable").Bold().FontColor(Colors.White).AlignRight();
                            });

                            // Rows
                            int srNo = 1;
                            decimal grandTotal = 0;
                            foreach (var s in settlements)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                table.Cell().Background(bg).Padding(5).Text(srNo.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(5).Text(s.TransactionDate?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(5).Text(s.EmpCardNo?.ToString() ?? "").FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(5).Text(s.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(5).Text(s.DepartmentName ?? "");
                                table.Cell().Background(bg).Padding(5).Text(s.DesignationName ?? "");
                                table.Cell().Background(bg).Padding(5).Text(s.LeavingDate?.ToString("dd/MM/yyyy") ?? "");
                                table.Cell().Background(bg).Padding(5).Text((s.PayableAmount ?? 0).ToString("N0")).AlignRight();

                                grandTotal += (s.PayableAmount ?? 0);
                                srNo++;
                            }

                            // Total
                            table.Cell().ColumnSpan(7).Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text("Grand Total").Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text(grandTotal.ToString("N0")).Bold();

                            if (settlements.Count == 0)
                            {
                                table.Cell().ColumnSpan(8).Padding(20).AlignCenter().Text("No settlements found for the specified period.").Italic().FontColor(Colors.Grey.Medium);
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
