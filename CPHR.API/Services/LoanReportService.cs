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
    public class LoanReportService
    {
        private readonly HRMSDbContext _db;
        private readonly ISiteInfoService? _siteInfoService;

        public LoanReportService(HRMSDbContext db, ISiteInfoService? siteInfoService = null)
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

        public async Task<byte[]> GenerateLoanRegisterReportAsync(
            string site,
            DateTime fromDate,
            DateTime toDate,
            string userName)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var query = _db.VewLoans.AsNoTracking().Where(l => l.LoanDate >= fromDate && l.LoanDate <= toDate && l.Site == site);
            var data = await query.OrderBy(l => l.LoanDate).ThenBy(l => l.EmpCardNo).ToListAsync();

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Portrait());
                    page.Margin(1.0f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(8).FontFamily("Arial").FontColor(Colors.Grey.Darken3));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(titleCol =>
                            {
                                titleCol.Item().Text(siteFullName).Bold().FontSize(14).FontColor("#1E3A8A");
                                titleCol.Item().Text($"Loan Register Report: {fromDate:dd MMM yyyy} to {toDate:dd MMM yyyy}").SemiBold().FontSize(10).FontColor("#3B82F6");
                            });
                            row.ConstantItem(120).AlignRight().Column(siteCol =>
                            {
                                siteCol.Item().Text($"SITE: {site}").Bold().FontSize(9).FontColor(Colors.Grey.Medium);
                                siteCol.Item().Text($"Date: {DateTime.Now:dd MMM yyyy}").FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                        col.Item().PaddingVertical(3).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Content
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
                                columns.RelativeColumn(2);   // Loan Type
                                columns.ConstantColumn(60);  // Loan Amount
                                columns.ConstantColumn(60);  // Installment
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Card").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Name").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Department").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Loan Type").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Amount").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Installment").Bold().FontColor(Colors.White).AlignRight();
                            });

                            int srNo = 1;
                            decimal totalLoanAmount = 0;
                            decimal totalInstallments = 0;

                            foreach (var item in data)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                table.Cell().Background(bg).Padding(4).Text(srNo.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(4).Text(item.EmpCardNo.ToString()).FontFamily("Courier New");
                                table.Cell().Background(bg).Padding(4).Text(item.EmpName ?? "").Bold();
                                table.Cell().Background(bg).Padding(4).Text(item.DepartmentName ?? "");
                                table.Cell().Background(bg).Padding(4).Text(item.LoanDate?.ToString("dd-MMM-yyyy") ?? "");
                                table.Cell().Background(bg).Padding(4).Text(item.LoanType ?? "");
                                table.Cell().Background(bg).Padding(4).Text((item.LoanAmount ?? 0).ToString("N0")).AlignRight();
                                table.Cell().Background(bg).Padding(4).Text((item.LoanInstallment ?? 0).ToString("N0")).AlignRight();
                                
                                totalLoanAmount += item.LoanAmount ?? 0;
                                totalInstallments += item.LoanInstallment ?? 0;
                                srNo++;
                            }

                            // Totals
                            table.Cell().ColumnSpan(6).Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Grand Total").Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(totalLoanAmount.ToString("N0")).Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(totalInstallments.ToString("N0")).Bold();

                            if (data.Count == 0)
                            {
                                table.Cell().ColumnSpan(8).Padding(20).AlignCenter().Text("No loan records found for this period.").Italic().FontColor(Colors.Grey.Medium);
                            }
                        });
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(3).Row(row =>
                        {
                            row.RelativeItem().Text($"Generated by: {userName} via SAFT HRMS").FontSize(8).FontColor(Colors.Grey.Medium);
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
        }

        public async Task<byte[]> GenerateLoanLedgerReportAsync(
            string site,
            int empCardNo,
            string loanType,
            string userName)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var emp = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmpCardNo == empCardNo && e.Site == site);
            if (emp == null) throw new Exception("Employee not found.");

            var dept = await _db.Departments.AsNoTracking().FirstOrDefaultAsync(d => d.DepartmentCode == emp.DeptCode && d.Site == site);
            var deptName = dept?.DepartmentName ?? "N/A";

            // Get disbursements (debits)
            var loans = await _db.Loans.AsNoTracking()
                .Where(l => l.EmpCardNo == empCardNo && l.LoanType == loanType && l.Site == site)
                .OrderBy(l => l.LoanDate)
                .ToListAsync();

            // Get deductions/returns (credits)
            var deductions = await _db.LoanDeductions.AsNoTracking()
                .Where(d => d.EmpCardNo == empCardNo && d.LoanType == loanType)
                .OrderBy(d => d.DeductionDate)
                .ToListAsync();

            // Combine into ledger entries
            var ledger = new List<LedgerEntry>();
            foreach (var l in loans)
            {
                ledger.Add(new LedgerEntry
                {
                    Date = l.LoanDate ?? DateTime.Today,
                    Description = $"Loan Disbursed (App #{l.AppNo})",
                    Debit = l.LoanAmount ?? 0,
                    Credit = 0
                });
            }

            foreach (var d in deductions)
            {
                ledger.Add(new LedgerEntry
                {
                    Date = d.DeductionDate ?? DateTime.Today,
                    Description = "Salary Deduction / Return",
                    Debit = 0,
                    Credit = d.DeductionAmount ?? 0
                });
            }

            ledger = ledger.OrderBy(le => le.Date).ToList();

            // Calculate running balances
            decimal runningBalance = 0;
            foreach (var entry in ledger)
            {
                runningBalance += entry.Debit - entry.Credit;
                entry.Balance = runningBalance;
            }

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Portrait());
                    page.Margin(1.0f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(8).FontFamily("Arial").FontColor(Colors.Grey.Darken3));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(titleCol =>
                            {
                                titleCol.Item().Text(siteFullName).Bold().FontSize(14).FontColor("#1E3A8A");
                                titleCol.Item().Text($"Loan Ledger: {emp.EmpName} ({empCardNo}) - {loanType}").SemiBold().FontSize(10).FontColor("#3B82F6");
                            });
                            row.ConstantItem(120).AlignRight().Column(siteCol =>
                            {
                                siteCol.Item().Text($"SITE: {site}").Bold().FontSize(9).FontColor(Colors.Grey.Medium);
                                siteCol.Item().Text($"Date: {DateTime.Now:dd MMM yyyy}").FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                        col.Item().PaddingVertical(3).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Content
                    page.Content().PaddingVertical(8).Column(col =>
                    {
                        col.Spacing(10);
                        col.Item().Text($"Department: {deptName}").Bold();

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);  // Sr
                                columns.ConstantColumn(70);  // Date
                                columns.RelativeColumn(3);   // Description
                                columns.ConstantColumn(60);  // Debit (Disbursed)
                                columns.ConstantColumn(60);  // Credit (Deducted)
                                columns.ConstantColumn(65);  // Balance
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Sr").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Date").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Description").Bold().FontColor(Colors.White);
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Disbursed").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Recovered").Bold().FontColor(Colors.White).AlignRight();
                                header.Cell().Background("#1E3A8A").Padding(4).Text("Balance").Bold().FontColor(Colors.White).AlignRight();
                            });

                            int srNo = 1;
                            decimal totalDebit = 0;
                            decimal totalCredit = 0;

                            foreach (var item in ledger)
                            {
                                var bg = srNo % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                                table.Cell().Background(bg).Padding(4).Text(srNo.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(4).Text(item.Date.ToString("dd-MMM-yyyy"));
                                table.Cell().Background(bg).Padding(4).Text(item.Description);
                                table.Cell().Background(bg).Padding(4).Text(item.Debit > 0 ? item.Debit.ToString("N0") : "-").AlignRight();
                                table.Cell().Background(bg).Padding(4).Text(item.Credit > 0 ? item.Credit.ToString("N0") : "-").AlignRight();
                                table.Cell().Background(bg).Padding(4).Text(item.Balance.ToString("N0")).AlignRight().Bold();
                                
                                totalDebit += item.Debit;
                                totalCredit += item.Credit;
                                srNo++;
                            }

                            // Totals
                            table.Cell().ColumnSpan(3).Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Summary").Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(totalDebit.ToString("N0")).Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(totalCredit.ToString("N0")).Bold();
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text((totalDebit - totalCredit).ToString("N0")).Bold();

                            if (ledger.Count == 0)
                            {
                                table.Cell().ColumnSpan(6).Padding(20).AlignCenter().Text("No ledger activity found for this type.").Italic().FontColor(Colors.Grey.Medium);
                            }
                        });
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(3).Row(row =>
                        {
                            row.RelativeItem().Text($"Generated by: {userName} via SAFT HRMS").FontSize(8).FontColor(Colors.Grey.Medium);
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
        }

        private class LedgerEntry
        {
            public DateTime Date { get; set; }
            public string Description { get; set; } = "";
            public decimal Debit { get; set; }
            public decimal Credit { get; set; }
            public decimal Balance { get; set; }
        }
    }
}
