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

namespace SaftHR.API.Services
{
    public class SalaryReportService
    {
        private readonly HRMSDbContext _db;
        private readonly ISiteInfoService? _siteInfoService;

        public SalaryReportService(HRMSDbContext db, ISiteInfoService? siteInfoService = null)
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
            return GetSchoolNameForSite(site);
        }

        private IQueryable<VewSalary> BuildQuery(string site, int month, int year, string? reportType = null, int? employeeId = null, string? departmentCode = null, int? designationCode = null, string? category = null)
        {
            var query = _db.VewSalaries.AsNoTracking().Where(s => s.Site == site && s.SalaryMonth == month && s.SalaryYear == year);

            if (reportType == "EmployeeWise" && employeeId.HasValue)
                query = query.Where(s => s.EmpCardNo == employeeId.Value);
            else if (reportType == "DepartmentWise" && int.TryParse(departmentCode, out var deptCodeVal))
                query = query.Where(s => s.DeptCode == deptCodeVal);
            else if (reportType == "DesignationWise" && designationCode.HasValue)
                query = query.Where(s => s.DesgCode == designationCode.Value);

            if (!string.IsNullOrEmpty(category) && category.ToLower() != "all")
                query = query.Where(s => s.Category == category);

            return query;
        }

        private string GetSchoolNameForSite(string site)
        {
            if (_siteInfoService != null)
            {
                return _siteInfoService.GetSiteFullName(site);
            }
            if (string.IsNullOrWhiteSpace(site)) return "CoolPoint";
            var cleanSite = site.Trim().ToUpperInvariant();
            if (cleanSite.Contains("FAISAL") || cleanSite == "SAFT" || cleanSite == "SAF") return "CoolPoint (Faisal Town)";
            if (cleanSite.Contains("GIRL")) return "CoolPoint Girls";
            if (cleanSite.Contains("CATHOLIC") || cleanSite.Contains("BOARD")) return "CATHOLIC BOARD OF EDUCATION";
            return $"CoolPoint ({site.Trim()})";
        }

        public async Task<byte[]> GenerateSalaryReportAsync(string site, int month, int year, int? employeeId, string? departmentCode, string? category, string reportType)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var salaries = await BuildQuery(site, month, year, reportType, employeeId, departmentCode, null, category)
                .OrderBy(s => s.EmpCardNo)
                .ToListAsync();

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0.6f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(5.5f).FontFamily("Arial").FontColor(Colors.Black));

                    page.Header().Column(col =>
                    {
                        col.Item().AlignCenter().Border(1).BorderColor(Colors.Black).Padding(4).Text(siteFullName).Bold().FontSize(12);
                        col.Item().AlignCenter().PaddingTop(3).Text($"Salary Sheet For {new DateTime(year, month, 1):MMMM-yyyy}").Bold().FontSize(9).Underline();
                    });

                    page.Content().PaddingVertical(5).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(16); c.ConstantColumn(40); c.RelativeColumn(1.8f); c.ConstantColumn(22);
                            for (int i = 0; i < 24; i++) c.ConstantColumn(i == 0 || i == 14 || i == 22 || i == 23 ? 24 : 20);
                        });

                        void HeaderCell(string text, bool right = false)
                        {
                            var container = table.Cell().Border(0.3f).BorderColor(Colors.Black).Padding(1);
                            var aligned = right ? container.AlignRight().AlignMiddle() : container.AlignCenter().AlignMiddle();
                            aligned.Text(text).Bold();
                        }

                        void NumCell(decimal? val, bool isBold = false)
                        {
                            var txt = table.Cell().Border(0.3f).BorderColor(Colors.Black).Padding(1).AlignRight().AlignMiddle().Text((val ?? 0).ToString("N0"));
                            if (isBold) txt.Bold();
                        }

                        void TxtCell(string text, bool center = false, bool isBold = false)
                        {
                            var container = table.Cell().Border(0.3f).BorderColor(Colors.Black).Padding(1);
                            var aligned = center ? container.AlignCenter().AlignMiddle() : container.AlignLeft().AlignMiddle();
                            var txt = aligned.Text(text);
                            if (isBold) txt.Bold();
                        }

                        HeaderCell("Sr#"); HeaderCell("Card No,\nCategory"); HeaderCell("Employee Name,\nDepartment", false); HeaderCell("Scale");
                        HeaderCell("Basic", true); HeaderCell("Arrears", true); HeaderCell("Allowance", true); HeaderCell("H/Rent", true); HeaderCell("Cony", true);
                        HeaderCell("ADH1", true); HeaderCell("ADH2", true); HeaderCell("ADH3", true); HeaderCell("Allowance", true); HeaderCell("Eve.\nShift", true);
                        HeaderCell("PF", true); HeaderCell("EOBI", true); HeaderCell("Allowances", true); HeaderCell("Gross\nPay", true);
                        HeaderCell("PF", true); HeaderCell("EOBI", true); HeaderCell("Ivs", true); HeaderCell("Adv.\nSalary", true); HeaderCell("L.T\nLoan", true);
                        HeaderCell("P.F\nLoan", true); HeaderCell("Tax", true); HeaderCell("Net\nPayable", true); HeaderCell("PF Sch.\nShare", true); HeaderCell("EOBI\nSchool", true);

                        int srNo = 1;
                        decimal[] sums = new decimal[24];

                        foreach (var s in salaries)
                        {
                            TxtCell(srNo++.ToString(), true);
                            table.Cell().Border(0.3f).BorderColor(Colors.Black).Padding(1).Column(tc => { tc.Item().AlignCenter().Text(s.EmpCardNo.ToString()); tc.Item().AlignCenter().Text(s.Category ?? ""); });
                            table.Cell().Border(0.3f).BorderColor(Colors.Black).Padding(1).Column(nc => { nc.Item().Text(s.EmpName ?? "").Bold(); nc.Item().Text(s.DepartmentName ?? ""); });
                            TxtCell(s.Scale ?? "", true);

                            decimal[] rowVals = {
                                s.BasicPay??0, s.A01??0, s.A02??0, s.A03??0, s.A04??0, s.A05??0, s.A06??0, s.A07??0, s.A08??0, s.A09??0, s.A10??0, s.A11??0, s.A12??0,
                                s.GrossPay??0, s.D01??0, s.D02??0, s.D03??0, s.D04??0, s.D05??0, s.D06??0, s.D07??0, s.NetPay??0, s.PfSchoolShare??0, s.EobiSchoolShare??0
                            };

                            for (int i = 0; i < rowVals.Length; i++)
                            {
                                NumCell(rowVals[i]); 
                                if (i < sums.Length) sums[i] += rowVals[i];
                            }
                        }

                        if (salaries.Count == 0) table.Cell().ColumnSpan(28).Padding(20).AlignCenter().Text("No records found.").Italic();
                        else
                        {
                            table.Cell().ColumnSpan(4).Border(0.3f).BorderColor(Colors.Black).Padding(1).AlignRight().Text("Grand Total >>>").Bold();
                            foreach (var sum in sums) NumCell(sum, true);
                        }
                    });
                });
            }).GeneratePdf();
        }

        public async Task<byte[]> GenerateSalarySlipsAsync(string site, int month, int year, int? employeeId, string? departmentCode, int? designationCode, string? category, string reportType)
        {
            var salaries = await BuildQuery(site, month, year, reportType, employeeId, departmentCode, designationCode, category)
                .OrderBy(s => s.EmpCardNo)
                .ToListAsync();
            
            var schoolTitle = GetSchoolNameForSite(site);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0.6f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(6.2f).FontFamily("Arial").FontColor(Colors.Black));

                    page.Content().Column(col =>
                    {
                        foreach (var s in salaries)
                        {
                            col.Item().ShowEntire().PaddingBottom(8).Border(0.75f).BorderColor(Colors.Black).Padding(3).Column(slip =>
                            {
                                slip.Item().Border(0.75f).BorderColor(Colors.Black).Padding(2).Text(schoolTitle).Bold().FontSize(9f);
                                
                                void InfoLine(QuestPDF.Infrastructure.IContainer c, string label, string value)
                                {
                                    c.PaddingBottom(0.5f).Text(t =>
                                    {
                                        t.Span(label).Bold();
                                        t.Span(value);
                                    });
                                }

                                slip.Item().PaddingVertical(2.5f).Row(infoRow =>
                                {
                                    infoRow.RelativeItem().Column(c =>
                                    {
                                        c.Item().Text($"Pay Slip for {new DateTime(year, month, 1):MMMM, yyyy}").Bold().Underline();
                                        c.Item().PaddingTop(2).Text($"Working Days : {(s.Days ?? 0):F0}").Bold();
                                    });

                                    infoRow.RelativeItem().Column(c =>
                                    {
                                        InfoLine(c.Item(), "Employee Code: ", s.EmpCardNo.ToString());
                                        InfoLine(c.Item(), "Father/Husband: ", s.EmpFatherName ?? "-");
                                        InfoLine(c.Item(), "Designation: ", s.DesignationName ?? "-");
                                        InfoLine(c.Item(), "Scale: ", string.IsNullOrEmpty(s.Scale) ? (s.GradeName ?? "-") : s.Scale);
                                        InfoLine(c.Item(), "PF Loan Balance: ", (s.ProvidentFundLoanBalance ?? 0).ToString("N2"));
                                    });

                                    infoRow.RelativeItem().Column(c =>
                                    {
                                        InfoLine(c.Item(), "Employee Name: ", s.EmpName ?? "-");
                                        InfoLine(c.Item(), "Department: ", s.DepartmentName ?? "-");
                                        InfoLine(c.Item(), "Salary Category: ", s.Category ?? "-");
                                        InfoLine(c.Item(), "LT Loan Balance: ", (s.LongTermLoanBalance ?? 0).ToString("N2"));
                                        InfoLine(c.Item(), "St+Sc PF: ", (s.TotalProvidentFund ?? 0).ToString("N2"));
                                    });
                                });

                                slip.Item().Table(t =>
                                {
                                    t.ColumnsDefinition(c =>
                                    {
                                        c.RelativeColumn(1.1f); c.RelativeColumn(0.9f); c.RelativeColumn(0.9f); c.RelativeColumn(0.9f);
                                        c.RelativeColumn(0.9f); c.RelativeColumn(0.9f); c.RelativeColumn(0.9f); c.RelativeColumn(0.9f);
                                        c.RelativeColumn(0.9f); c.RelativeColumn(0.9f); c.RelativeColumn(0.7f); c.RelativeColumn(0.7f);
                                        c.RelativeColumn(1.0f); c.RelativeColumn(1.2f); c.RelativeColumn(0.7f); c.RelativeColumn(0.7f);
                                        c.RelativeColumn(0.7f); c.RelativeColumn(0.9f); c.RelativeColumn(0.9f); c.RelativeColumn(0.9f);
                                        c.RelativeColumn(0.7f); c.RelativeColumn(1.2f); c.RelativeColumn(1.1f); c.RelativeColumn(1.1f);
                                    });

                                    void Hdr(string txt) => t.Cell().Border(0.75f).BorderColor(Colors.Black).Padding(0.8f).AlignCenter().AlignMiddle().Text(txt).Bold();
                                    void Val(decimal? amt, bool isBold = false)
                                    {
                                        var txt = t.Cell().Border(0.75f).BorderColor(Colors.Black).Padding(0.8f).AlignRight().AlignMiddle().Text((amt ?? 0).ToString("N0"));
                                        if (isBold) txt.Bold();
                                    }

                                    Hdr("Basic"); Hdr("Arrea\nrs"); Hdr("Allow\nance"); Hdr("H/\nRent"); Hdr("Cony");
                                    Hdr("ADH1"); Hdr("ADH2"); Hdr("ADH3/\nsp.All"); Hdr("Allow\nance"); Hdr("Eve.\nShift");
                                    Hdr("PF"); Hdr("EOBI"); Hdr("Allowa\nnces"); Hdr("Gross\nPay");
                                    Hdr("PF"); Hdr("EOBI"); Hdr("Ivs"); Hdr("Adv.\nSalary"); Hdr("L.T\nLoan");
                                    Hdr("P.F\nLoan"); Hdr("Tax"); Hdr("Net\nPayable"); Hdr("PF\nSchool\nShare"); Hdr("EOBI\nSchool\nShare");

                                    Val(s.BasicPay); Val(s.A01); Val(s.A02); Val(s.A03); Val(s.A04);
                                    Val(s.A05); Val(s.A06); Val(s.A07); Val(s.A08); Val(s.A09);
                                    Val(s.A10); Val(s.A11); Val(s.A12); Val(s.GrossPay, true);
                                    Val(s.D01); Val(s.D02); Val(s.D03); Val(s.D04); Val(s.D05);
                                    Val(s.D06); Val(s.D07); Val(s.NetPay, true); Val(s.PfSchoolShare); Val(s.EobiSchoolShare);
                                });

                                slip.Item().PaddingTop(6).Row(ftr =>
                                {
                                    ftr.RelativeItem().AlignBottom().Text("DEDUCTION OF CHILD FEE IS NOT MENTIONED HERE.").Bold().FontSize(6f);
                                    ftr.ConstantItem(130).Column(c =>
                                    {
                                        c.Item().LineHorizontal(0.5f).LineColor(Colors.Black);
                                        c.Item().PaddingTop(1.5f).AlignCenter().Text("Signature").FontSize(6f);
                                    });
                                });
                            });
                        }
                        
                        if (salaries.Count == 0) col.Item().AlignCenter().PaddingTop(20).Text("No salaries found.").Italic();
                    });
                });
            }).GeneratePdf();
        }

        public async Task<byte[]> GenerateSalarySummaryAsync(string site, int month, int year, string? category)
        {
            var siteFullName = await ResolveSiteFullNameAsync(site);
            var salaries = await BuildQuery(site, month, year, null, null, null, null, category).ToListAsync();

            var summaryData = salaries.GroupBy(s => s.Category ?? "Unspecified").Select(g => new {
                Category = g.Key, EmpCount = g.Count(), Basic = g.Sum(s => s.BasicPay ?? 0),
                A01 = g.Sum(s => s.A01 ?? 0), A02 = g.Sum(s => s.A02 ?? 0), A03 = g.Sum(s => s.A03 ?? 0), A04 = g.Sum(s => s.A04 ?? 0), A05 = g.Sum(s => s.A05 ?? 0),
                A06 = g.Sum(s => s.A06 ?? 0), A07 = g.Sum(s => s.A07 ?? 0), A08 = g.Sum(s => s.A08 ?? 0), A09 = g.Sum(s => s.A09 ?? 0), A10 = g.Sum(s => s.A10 ?? 0), A11 = g.Sum(s => s.A11 ?? 0),
                Gross = g.Sum(s => s.GrossPay ?? 0), D01 = g.Sum(s => s.D01 ?? 0), D02 = g.Sum(s => s.D02 ?? 0), D03 = g.Sum(s => s.D03 ?? 0),
                D04 = g.Sum(s => s.D04 ?? 0), D05 = g.Sum(s => s.D05 ?? 0), D06 = g.Sum(s => s.D06 ?? 0), D07 = g.Sum(s => s.D07 ?? 0),
                Net = g.Sum(s => s.NetPay ?? 0), PfShare = g.Sum(s => s.PfSchoolShare ?? 0), EobiShare = g.Sum(s => s.EobiSchoolShare ?? 0)
            }).OrderBy(g => g.Category).ToList();

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0.6f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(5.5f).FontFamily("Arial"));

                    page.Header().Column(col =>
                    {
                        col.Item().AlignCenter().Border(1).Padding(4).Text(siteFullName).Bold().FontSize(12);
                        col.Item().AlignCenter().PaddingTop(3).Text($"Salary Summary For {new DateTime(year, month, 1):MMMM-yyyy}").Bold().FontSize(9).Underline();
                    });

                    page.Content().PaddingVertical(5).Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(1.8f); c.ConstantColumn(22); for (int i = 0; i < 23; i++) c.ConstantColumn(22); });

                        void HCell(string text) => table.Cell().Border(0.3f).Padding(2).AlignRight().Text(text).Bold();
                        
                        void NCell(decimal val, bool isBold = false)
                        {
                            var txt = table.Cell().Border(0.3f).Padding(2).AlignRight().Text(val.ToString("N0"));
                            if (isBold) txt.Bold();
                        }

                        table.Header(h => {
                            table.Cell().Border(0.3f).Padding(2).Text("Category").Bold(); table.Cell().Border(0.3f).Padding(2).AlignCenter().Text("Emp#").Bold();
                            string[] heads = { "Basic", "Allowances", "Allowance", "H/Rent", "Cony", "ADH1", "ADH2", "ADH3", "Allowance", "Eve. Shift", "PF", "EOBI", "Gross Pay", "PF", "EOBI", "Ivs", "Adv. Sal", "L.T Loan", "P.F Loan", "Tax", "Net Pay", "PF Sch", "EOBI Sch" };
                            foreach (var head in heads) HCell(head);
                        });

                        int tEmp = 0; decimal[] tSums = new decimal[23];

                        foreach (var g in summaryData)
                        {
                            table.Cell().Border(0.3f).Padding(2).Text(g.Category); table.Cell().Border(0.3f).Padding(2).AlignCenter().Text(g.EmpCount.ToString());
                            decimal[] vals = { g.Basic, g.A01 + g.A02, g.A02, g.A03, g.A04, g.A05, g.A06, g.A07, g.A08, g.A09, g.A10, g.A11, g.Gross, g.D01, g.D02, g.D03, g.D04, g.D05, g.D06, g.D07, g.Net, g.PfShare, g.EobiShare };
                            for (int i = 0; i < vals.Length; i++) { NCell(vals[i]); tSums[i] += vals[i]; }
                            tEmp += g.EmpCount;
                        }

                        table.Cell().Border(0.3f).Padding(2).Text("Grand Total").Bold(); table.Cell().Border(0.3f).Padding(2).AlignCenter().Text(tEmp.ToString()).Bold();
                        foreach (var sum in tSums) NCell(sum, true);
                    });
                });
            }).GeneratePdf();
        }

        public async Task<byte[]> GenerateBankTransferReportAsync(string site, int month, int year, string? category)
        {
            var salaries = await BuildQuery(site, month, year, null, null, null, null, category)
                .Where(s => s.NetPay > 0).OrderBy(s => s.EmpCardNo).ToListAsync();

            return GenerateSimpleListReport(salaries, "Account No", s => s.BankAccount ?? "", s => s.NetPay ?? 0);
        }

        public async Task<byte[]> GeneratePfListReportAsync(string site, int month, int year, string? category)
        {
            var salaries = await BuildQuery(site, month, year, null, null, null, null, category)
                .Where(s => s.D01 > 0).OrderBy(s => s.EmpCardNo).ToListAsync();

            return GenerateSimpleListReport(salaries, "Provident Fund", s => s.EmpCardNo.ToString(), s => s.D01 ?? 0, true);
        }

        public async Task<byte[]> GenerateSpecialAllowTransferReportAsync(string site, int month, int year, string? category)
        {
            var salaries = await BuildQuery(site, month, year, null, null, null, null, category)
                .Where(s => s.A07 > 0).OrderBy(s => s.EmpCardNo).ToListAsync();

            return GenerateSimpleListReport(salaries, "Amount", s => s.BankAccount ?? "", s => s.A07 ?? 0);
        }

        private byte[] GenerateSimpleListReport(List<VewSalary> salaries, string amountColName, Func<VewSalary, string> getCol2, Func<VewSalary, decimal> getAmount, bool isLandscape = false)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(isLandscape ? PageSizes.A4.Landscape() : PageSizes.A4.Portrait());
                    page.Margin(1.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial").FontColor(Colors.Black));

                    page.Content().Column(col =>
                    {
                        col.Item().Text(DateTime.Now.ToString("MMMM dd, yyyy"));
                        col.Item().PaddingTop(10).Column(addr => { addr.Item().Text("The Manager,"); addr.Item().Text("HBL, Johar Town,"); addr.Item().Text("Lahore."); });
                        col.Item().PaddingTop(15).Text("Dear Sir,");

                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(c => { c.ConstantColumn(30); c.RelativeColumn(1.8f); c.RelativeColumn(2.5f); c.RelativeColumn(2.2f); c.RelativeColumn(1.2f); });
                            
                            void HCell(string text, bool right = false)
                            {
                                var container = table.Cell().Border(0.5f).Padding(3);
                                var aligned = right ? container.AlignRight().AlignMiddle() : container.AlignCenter().AlignMiddle();
                                aligned.Text(text).Bold();
                            }

                            void TCell(string text, bool center = false, bool bold = false)
                            {
                                var container = table.Cell().Border(0.5f).Padding(3);
                                var aligned = center ? container.AlignCenter().AlignMiddle() : container.AlignLeft().AlignMiddle();
                                var txt = aligned.Text(text);
                                if (bold) txt.Bold();
                            }

                            HCell("Sr#"); HCell(isLandscape ? "Card No" : "Account No"); HCell("Employee Name"); HCell("Department"); HCell(amountColName, true);

                            int srNo = 1; decimal totalAmount = 0;

                            foreach (var s in salaries)
                            {
                                TCell(srNo++.ToString(), true); TCell(getCol2(s)); TCell(s.EmpName ?? "", false, true); TCell(s.DepartmentName ?? "");
                                decimal amt = getAmount(s); totalAmount += amt;
                                table.Cell().Border(0.5f).Padding(3).AlignRight().Text(amt.ToString("N2"));
                            }

                            table.Cell().ColumnSpan(4).Border(0.5f).Padding(3).AlignRight().Text("Total >>>").Bold();
                            table.Cell().Border(0.5f).Padding(3).AlignRight().Text(totalAmount.ToString("N2")).Bold();
                        });

                        col.Item().PaddingTop(40).Row(row =>
                        {
                            row.RelativeItem().Column(c => { c.Item().LineHorizontal(0.5f); c.Item().PaddingTop(2).Text("H.D Maxwell").Bold().AlignCenter(); c.Item().Text("Principal").AlignCenter(); });
                            row.ConstantItem(80);
                            row.RelativeItem().Column(c => { c.Item().LineHorizontal(0.5f); c.Item().PaddingTop(2).Text("Mr Nelson Malik").Bold().AlignCenter(); c.Item().Text("Procurator").AlignCenter(); });
                        });
                    });
                });
            }).GeneratePdf();
        }
    }
}