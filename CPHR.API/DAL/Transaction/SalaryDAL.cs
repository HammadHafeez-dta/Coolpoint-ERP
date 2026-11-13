using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.DAL.Transaction
{
    public class SalaryDAL : ISalaryDAL
    {
        private readonly HRMSDbContext _db;

        public SalaryDAL(HRMSDbContext db)
        {
            _db = db;
        }

        // ── Monthly Salary ────────────────────────────────────────────────────────

        public async Task SaveMonthlySalaryAsync(SalaryDto dto, string site, string userId)
        {
            var temp = await _db.MonthlySalaries
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.SalaryMonth == dto.SalaryMonth && u.SalaryYear == dto.SalaryYear && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new MonthlySalary
                {
                    EmpCardNo = dto.EmpCardNo,
                    SalaryMonth = dto.SalaryMonth,
                    SalaryYear = dto.SalaryYear,
                    SalaryDate = dto.SalaryDate,
                    Salary = dto.Salary,
                    Days = dto.TotalDays,
                    DaysAmount = dto.DaysAmount,
                    OverTimeDays = dto.OverTimeDays,
                    OverTimeAmount = dto.OverTimeAmount,
                    OtherDays = dto.OtherDays,
                    OtherAmount = dto.OtherAmount,
                    D12 = dto.LdlcDays,
                    D13 = dto.LdlcAmount,
                    TotalLate = dto.TotalLate,
                    LateDeduction = dto.LateDeduction,
                    LongTermLoanBalance = dto.LongTermLoanBalance,
                    ProvidentFundLoanBalance = dto.ProvidentFundLoanBalance,
                    BasicPay = dto.BasicPay,
                    A01 = dto.A01, A02 = dto.A02, A03 = dto.A03, A04 = dto.A04, A05 = dto.A05, A06 = dto.A06,
                    A07 = dto.A07, A08 = dto.A08, A09 = dto.A09, A10 = dto.A10, A11 = dto.A11, A12 = dto.A12, A13 = dto.A13,
                    GrossPay = dto.GrossPay,
                    D01 = dto.D01, D02 = dto.D02, D03 = dto.D03, D04 = dto.D04, D05 = dto.D05, D06 = dto.D06,
                    D07 = dto.D07, D08 = dto.D08, D09 = dto.D09, D10 = dto.D10, D11 = dto.D11,
                    PfSchoolShare = dto.PFSchoolShare,
                    EobiSchoolShare = dto.EOBISchoolShare,
                    LeaveDeducted = dto.LeaveDeductions,
                    NetPay = dto.NetSalary,
                    TotalProvidentFund = dto.TotalProvidentFund,
                    TotalDeductions = dto.TotalDeductions,
                    Scale = dto.Scale,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.MonthlySalaries.Add(temp);
            }
            else
            {
                temp.SalaryDate = dto.SalaryDate;
                temp.Salary = dto.Salary;
                temp.Days = dto.TotalDays;
                temp.DaysAmount = dto.DaysAmount;
                temp.OverTimeDays = dto.OverTimeDays;
                temp.OverTimeAmount = dto.OverTimeAmount;
                temp.OtherDays = dto.OtherDays;
                temp.OtherAmount = dto.OtherAmount;
                temp.D12 = dto.LdlcDays;
                temp.D13 = dto.LdlcAmount;
                temp.TotalLate = dto.TotalLate;
                temp.LateDeduction = dto.LateDeduction;
                temp.LongTermLoanBalance = dto.LongTermLoanBalance;
                temp.ProvidentFundLoanBalance = dto.ProvidentFundLoanBalance;
                temp.BasicPay = dto.BasicPay;
                temp.A01 = dto.A01; temp.A02 = dto.A02; temp.A03 = dto.A03; temp.A04 = dto.A04; temp.A05 = dto.A05; temp.A06 = dto.A06;
                temp.A07 = dto.A07; temp.A08 = dto.A08; temp.A09 = dto.A09; temp.A10 = dto.A10; temp.A11 = dto.A11; temp.A12 = dto.A12; temp.A13 = dto.A13;
                temp.GrossPay = dto.GrossPay;
                temp.D01 = dto.D01; temp.D02 = dto.D02; temp.D03 = dto.D03; temp.D04 = dto.D04; temp.D05 = dto.D05; temp.D06 = dto.D06;
                temp.D07 = dto.D07; temp.D08 = dto.D08; temp.D09 = dto.D09; temp.D10 = dto.D10; temp.D11 = dto.D11;
                temp.PfSchoolShare = dto.PFSchoolShare;
                temp.EobiSchoolShare = dto.EOBISchoolShare;
                temp.LeaveDeducted = dto.LeaveDeductions;
                temp.NetPay = dto.NetSalary;
                temp.TotalProvidentFund = dto.TotalProvidentFund;
                temp.TotalDeductions = dto.TotalDeductions;
                temp.Scale = dto.Scale;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<ProcessSalaryResultDto> ProcessMonthlySalaryAsync(ProcessSalaryRequestDto request, string site, string userId)
        {
            var result = new ProcessSalaryResultDto { Success = true };
            DateTime fromDate = request.FromDate.Date;
            DateTime toDate = request.ToDate.Date;
            int daysInMonth = DateTime.DaysInMonth(toDate.Year, toDate.Month);

            try
            {
                var query = _db.Employees.Where(u => (u.Status ?? false) == true && u.Site == site);
                if (request.ProcessType == "CardWise" && request.EmployeeId.HasValue)
                {
                    query = query.Where(u => u.EmpCardNo == request.EmployeeId.Value);
                }
                var employees = await query.ToListAsync();

                var empIds = employees.Select(e => e.EmpCardNo).ToList();
                var empSalaries = await _db.EmpSalaries
                    .Where(s => empIds.Contains(s.EmpCardNo) && s.Site == site)
                    .ToDictionaryAsync(s => s.EmpCardNo);

                result.Logs.Add($"[{DateTime.Now:HH:mm:ss}] Found {employees.Count} employees to process.");

                foreach (var emp in employees)
                {
                    try
                    {
                        if (emp.IsSalaryBlocked == true)
                        {
                            result.Logs.Add($"[{DateTime.Now:HH:mm:ss}] Card {emp.EmpCardNo}: Salary is blocked. Skipping.");
                            result.Failed++;
                            continue;
                        }

                        if (!empSalaries.TryGetValue(emp.EmpCardNo, out var empSal))
                        {
                            result.Logs.Add($"[{DateTime.Now:HH:mm:ss}] Card {emp.EmpCardNo}: Salary setup (EmpSalary) not found. Skipping.");
                            result.Failed++;
                            continue;
                        }

                        decimal salary = empSal.GrossPay ?? 0;
                        decimal totalDays = await _db.AttendanceRegisters
                            .Where(u => u.EmpCardNo == emp.EmpCardNo
                                && u.AttendanceDate >= fromDate
                                && u.AttendanceDate <= toDate
                                && u.Site == site
                                && u.TotalDays == 1)
                            .CountAsync();
                        if (string.Equals(emp.Unit, "Executive", StringComparison.OrdinalIgnoreCase))
                        {
                            totalDays = daysInMonth;
                        }
                        decimal daysAmount = daysInMonth > 0
                            ? Math.Round(salary / daysInMonth * totalDays, 0)
                            : 0;
                        decimal a03 = empSal.A03 ?? 0;
                        decimal basicPay = Math.Round((daysAmount - a03) / 1.55m, 0);
                        decimal a01 = Math.Round(basicPay * 0.45m, 0);
                        decimal a02 = Math.Round(daysAmount - (basicPay + a01 + a03), 0);

                        // Get Salary Advances (D03)
                        decimal totalAdvances = await _db.Loans
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.LoanDate >= fromDate && u.LoanDate <= toDate && u.LoanType == "Salary Advance" && u.Site == site)
                            .SumAsync(p => p.LoanAmount ?? 0);

                        // Long Term Loan (D04)
                        decimal longTermLoanTotal = await _db.Loans
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.LoanType != "Salary Advance" && u.Site == site)
                            .SumAsync(p => p.LoanAmount ?? 0);

                        decimal longTermLoanReturned = await _db.LoanDeductions
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.LoanType != "Salary Advance" && u.DeductionDate < toDate)
                            .SumAsync(p => p.DeductionAmount ?? 0);

                        decimal longTermInstallment = await _db.Loans
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.LoanType != "Salary Advance" && u.Site == site)
                            .OrderByDescending(o => o.AppNo)
                            .Select(p => p.LoanInstallment ?? 0)
                            .FirstOrDefaultAsync();

                        decimal longTermLoanBalance = longTermLoanTotal >= longTermLoanReturned
                            ? longTermLoanTotal - longTermLoanReturned
                            : longTermLoanTotal;
                        decimal d04 = Math.Min(longTermLoanBalance, longTermInstallment);

                        // Provident Fund Loan (D07)
                        decimal pfLoanBalance = 0;
                        decimal d07 = empSal.D07 ?? 0;

                        // Calculate Total Provident Fund
                        decimal totalPFundPrev = await GetTotalPFundAsync(fromDate, emp.EmpCardNo, site);
                        decimal totalPfSchoolSharePrev = await GetTotalPfSchoolShareAsync(fromDate, emp.EmpCardNo, site);
                        decimal pfSchoolShare = empSal.PfSchoolShare ?? 0;
                        decimal pfProfitInstallments = await _db.LoanDeductions
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.LoanType == "PF Profit")
                            .SumAsync(p => p.DeductionAmount ?? 0);
                        decimal pfOpening = await _db.EmpOpeningBalances
                            .Where(u => u.EmpCardNo == emp.EmpCardNo)
                            .Select(p => p.ProvidantFundOpening ?? 0)
                            .FirstOrDefaultAsync();

                        decimal d01 = empSal.D01 ?? 0;
                        decimal eobiSchoolShare = empSal.EobiSchoolShare ?? 0;
                        decimal totalProvidentFund = totalPFundPrev + totalPfSchoolSharePrev + pfSchoolShare + pfProfitInstallments + pfOpening - pfLoanBalance + d07 + d01;

                        decimal leaveDeductions = 0;
                        decimal d06 = empSal.D06 ?? 0;

                        var totalOvertimeMinutes = await _db.AttendanceRegisters
                            .Where(u => u.EmpCardNo == emp.EmpCardNo
                                && u.AttendanceDate >= fromDate
                                && u.AttendanceDate <= toDate
                                && u.Site == site)
                            .SumAsync(u => (u.OverTime ?? 0) + (u.OverTimeManual ?? 0) * 60m);
                        var overtimeSpan = TimeSpan.FromMinutes((double)totalOvertimeMinutes);
                        decimal otHours = Convert.ToDecimal(overtimeSpan.ToString(@"dd")) * 24
                            + Convert.ToDecimal(overtimeSpan.ToString(@"hh\.mm"));
                        decimal otAmount = 0;
                        otAmount = string.Equals(emp.Unit, "SGuard", StringComparison.OrdinalIgnoreCase)
                            ? (daysInMonth > 0 ? Math.Round(salary / daysInMonth / 12m * otHours, 0) : 0)
                            : Math.Round(otHours * 50m, 0);

                        decimal a13 = 0;
                        decimal lateDeduction = 0;

                        decimal d01_val = empSal.D01 ?? 0;
                        decimal d02_val = empSal.D02 ?? 0;
                        decimal d05_val = empSal.D05 ?? 0;
                        decimal d08_val = empSal.D08 ?? 0;
                        decimal d09_val = empSal.D09 ?? 0;
                        decimal d10_val = empSal.D10 ?? 0;
                        decimal d11_val = empSal.D11 ?? 0;

                        decimal a04 = empSal.A04 ?? 0;
                        decimal a05 = empSal.A05 ?? 0;
                        decimal a06 = empSal.A06 ?? 0;
                        decimal a07 = empSal.A07 ?? 0;
                        decimal a08 = empSal.A08 ?? 0;
                        decimal a09 = empSal.A09 ?? 0;
                        decimal a10 = empSal.A10 ?? 0;
                        decimal a11 = empSal.A11 ?? 0;
                        decimal grossPay = daysAmount + otAmount + a04 + a05 + a06 + a07 + a08 + a09 + a10 + a11;
                        decimal totalDeductions = lateDeduction + d01_val + d02_val + totalAdvances + d04 + d05_val + d06 + d07 + d08_val + d09_val + d10_val + d11_val;
                        decimal netPay = Math.Round(grossPay - totalDeductions, 0);

                        // Save monthly salary record
                        var temp = await _db.MonthlySalaries
                            .Where(u => u.EmpCardNo == emp.EmpCardNo && u.SalaryMonth == toDate.Month && u.SalaryYear == toDate.Year && u.Site == site)
                            .FirstOrDefaultAsync();

                        if (temp == null)
                        {
                            temp = new MonthlySalary
                            {
                                EmpCardNo = emp.EmpCardNo,
                                SalaryMonth = toDate.Month,
                                SalaryYear = toDate.Year,
                                SalaryDate = toDate,
                                Salary = salary,
                                Days = totalDays,
                                DaysAmount = daysAmount,
                                OverTimeDays = otHours,
                                OverTimeAmount = otAmount,
                                OtherDays = 0,
                                OtherAmount = 0,
                                TotalLate = 0,
                                LateDeduction = lateDeduction,
                                LongTermLoanBalance = longTermLoanBalance - d04,
                                ProvidentFundLoanBalance = pfLoanBalance - d07,
                                BasicPay = basicPay,
                                A01 = a01, A02 = a02, A03 = a03, A04 = a04, A05 = a05, A06 = a06,
                                A07 = a07, A08 = a08, A09 = a09, A10 = a10, A11 = a11, A12 = empSal.A12,
                                A13 = a13,
                                GrossPay = grossPay,
                                D01 = d01_val, D02 = d02_val, D03 = totalAdvances, D04 = d04, D05 = d05_val, D06 = d06,
                                D07 = d07, D08 = d08_val, D09 = d09_val, D10 = d10_val, D11 = d11_val,
                                PfSchoolShare = pfSchoolShare,
                                EobiSchoolShare = eobiSchoolShare,
                                LeaveDeducted = leaveDeductions,
                                NetPay = netPay,
                                TotalProvidentFund = totalProvidentFund,
                                TotalDeductions = totalDeductions,
                                Scale = emp.Scale,
                                Site = site,
                                EnterBy = userId,
                                EnteryTime = DateTime.Now,
                                SalaryCreated = true
                            };
                            _db.MonthlySalaries.Add(temp);
                        }
                        else
                        {
                            temp.SalaryDate = toDate;
                            temp.Salary = salary;
                            temp.Days = totalDays;
                            temp.DaysAmount = daysAmount;
                            temp.OverTimeDays = otHours;
                            temp.OverTimeAmount = otAmount;
                            temp.LateDeduction = lateDeduction;
                            temp.LongTermLoanBalance = longTermLoanBalance - d04;
                            temp.ProvidentFundLoanBalance = pfLoanBalance - d07;
                            temp.BasicPay = basicPay;
                            temp.A01 = a01; temp.A02 = a02; temp.A03 = a03; temp.A04 = a04; temp.A05 = a05; temp.A06 = a06;
                            temp.A07 = a07; temp.A08 = a08; temp.A09 = a09; temp.A10 = a10; temp.A11 = a11; temp.A12 = empSal.A12;
                            temp.A13 = a13;
                            temp.GrossPay = grossPay;
                            temp.D01 = d01_val; temp.D02 = d02_val; temp.D03 = totalAdvances; temp.D04 = d04; temp.D05 = d05_val; temp.D06 = d06;
                            temp.D07 = d07; temp.D08 = d08_val; temp.D09 = d09_val; temp.D10 = d10_val; temp.D11 = d11_val;
                            temp.PfSchoolShare = pfSchoolShare;
                            temp.EobiSchoolShare = eobiSchoolShare;
                            temp.LeaveDeducted = leaveDeductions;
                            temp.NetPay = netPay;
                            temp.TotalProvidentFund = totalProvidentFund;
                            temp.TotalDeductions = totalDeductions;
                            temp.Scale = emp.Scale;
                            temp.EditBy = userId;
                            temp.EditTime = DateTime.Now;
                            temp.SalaryCreated = true;
                        }

                        // Save Loan Deductions
                        if (d04 > 0)
                        {
                            var tempLD = await _db.LoanDeductions.FirstOrDefaultAsync(u => u.EmpCardNo == emp.EmpCardNo && u.LoanType == "Long Term Loan" && u.DeductionDate == toDate);
                            if (tempLD == null)
                            {
                                tempLD = new LoanDeduction
                                {
                                    EmpCardNo = emp.EmpCardNo,
                                    LoanType = "Long Term Loan",
                                    DeductionDate = toDate,
                                    DeductionAmount = d04
                                };
                                _db.LoanDeductions.Add(tempLD);
                            }
                            else
                            {
                                tempLD.DeductionAmount = d04;
                            }
                        }

                        if (d07 > 0)
                        {
                            var tempLD = await _db.LoanDeductions.FirstOrDefaultAsync(u => u.EmpCardNo == emp.EmpCardNo && u.LoanType == "Providant Fund Loan" && u.DeductionDate == toDate);
                            if (tempLD == null)
                            {
                                tempLD = new LoanDeduction
                                {
                                    EmpCardNo = emp.EmpCardNo,
                                    LoanType = "Providant Fund Loan",
                                    DeductionDate = toDate,
                                    DeductionAmount = d07
                                };
                                _db.LoanDeductions.Add(tempLD);
                            }
                            else
                            {
                                tempLD.DeductionAmount = d07;
                            }
                        }

                        await _db.SaveChangesAsync();
                        result.Processed++;
                        result.Logs.Add($"[{DateTime.Now:HH:mm:ss}] Card {emp.EmpCardNo} ({emp.EmpName}): Processed successfully. Gross: {grossPay}, Ded: {totalDeductions}, Net: {netPay}");
                    }
                    catch (Exception ex)
                    {
                        result.Logs.Add($"[{DateTime.Now:HH:mm:ss}] Card {emp.EmpCardNo}: Failed with error: {ex.Message}");
                        result.Failed++;
                    }
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Logs.Add($"[{DateTime.Now:HH:mm:ss}] Fatal Error: {ex.Message}");
            }

            return result;
        }

        public async Task<bool> DeleteMonthlySalarySingleAsync(SalaryDto dto, string site)
        {
            var temp = await _db.MonthlySalaries
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.SalaryMonth == dto.SalaryMonth && u.SalaryYear == dto.SalaryYear && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp != null)
            {
                _db.MonthlySalaries.Remove(temp);
                await _db.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteMonthlySalaryAsync(int salaryMonth, int salaryYear)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync("DELETE FROM Monthly_Salary WHERE Salary_Month={0} AND Salary_Year={1}", salaryMonth, salaryYear);
                return true;
            }
            catch { return false; }
        }

        public async Task<DeleteSalaryResultDto> DeleteMonthlySalaryRangeAsync(DeleteSalaryRequestDto request, string site)
        {
            var result = new DeleteSalaryResultDto();
            if (request.FromDate.Date > request.ToDate.Date)
            {
                result.Success = false;
                result.Message = "From Date cannot be greater than To Date.";
                return result;
            }

            try
            {
                var from = request.FromDate.Date;
                var to = request.ToDate.Date;

                var query = _db.MonthlySalaries.Where(s => s.Site == site);

                if (request.ProcessType == "CardWise" && request.EmployeeId.HasValue && request.EmployeeId.Value > 0)
                {
                    query = query.Where(s => s.EmpCardNo == request.EmployeeId.Value);
                }

                // Match records within date range:
                // 1. By SalaryDate if populated
                // 2. OR by SalaryYear & SalaryMonth if SalaryDate is null
                query = query.Where(s =>
                    (s.SalaryDate.HasValue && s.SalaryDate.Value.Date >= from && s.SalaryDate.Value.Date <= to)
                    || (!s.SalaryDate.HasValue &&
                        (s.SalaryYear > from.Year || (s.SalaryYear == from.Year && s.SalaryMonth >= from.Month)) &&
                        (s.SalaryYear < to.Year || (s.SalaryYear == to.Year && s.SalaryMonth <= to.Month)))
                );

                var records = await query.ToListAsync();
                int count = records.Count;

                if (count > 0)
                {
                    _db.MonthlySalaries.RemoveRange(records);
                    await _db.SaveChangesAsync();
                    result.Success = true;
                    result.DeletedCount = count;
                    result.Message = $"Successfully deleted {count} salary record(s).";
                }
                else
                {
                    result.Success = true;
                    result.DeletedCount = 0;
                    result.Message = "No salary records found for the selected date range.";
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Error deleting salary records: {ex.Message}";
            }

            return result;
        }

        public async Task<decimal> GetTotalAbsentsAsync(DateTime fromDate, DateTime toDate, int empCardNo, string site)
        {
            return await _db.AttendanceRegisters
                .Where(u => u.EmpCardNo == empCardNo && u.AttendanceDate >= fromDate && u.AttendanceDate <= toDate && u.TotalDays == 0 && u.AttnedanceType == "A" && u.Site == site)
                .Select(p => p.TotalDays ?? 0)
                .CountAsync();
        }

        public async Task<decimal> GetTotalDaysAsync(DateTime fromDate, DateTime toDate, int empCardNo, string site)
        {
            return await _db.AttendanceRegisters
                .Where(u => u.EmpCardNo == empCardNo && u.AttendanceDate >= fromDate && u.AttendanceDate <= toDate && u.TotalDays == 1 && u.Site == site)
                .Select(p => p.TotalDays ?? 0)
                .CountAsync();
        }

        public async Task<decimal> GetTotalPFundAsync(DateTime salaryDate, int empCardNo, string site)
        {
            return await _db.MonthlySalaries
                .Where(u => u.EmpCardNo == empCardNo && u.SalaryDate < salaryDate && u.Site == site)
                .Select(p => p.D01 ?? 0)
                .SumAsync();
        }

        public async Task<decimal> GetTotalPfSchoolShareAsync(DateTime salaryDate, int empCardNo, string site)
        {
            return await _db.MonthlySalaries
                .Where(u => u.EmpCardNo == empCardNo && u.SalaryDate < salaryDate && u.Site == site)
                .Select(p => p.PfSchoolShare ?? 0)
                .SumAsync();
        }

        public async Task<VewSalary?> GetMonthlySalaryAsync(int empCardNo, DateTime salaryMonth, string site)
        {
            return await _db.VewSalaries
                .Where(u => u.EmpCardNo == empCardNo && u.SalaryMonth == salaryMonth.Month && u.SalaryYear == salaryMonth.Year && u.Site == site)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetTotalEmployeeSalarySlipForEmailAsync(DateTime salaryDate, int empCardNo, int departmentID, string site)
        {
            var query = _db.VewSalaries.Where(u => u.SalaryMonth == salaryDate.Month && u.SalaryYear == salaryDate.Year && u.Email != "" && u.Email != null && u.Site == site);
            if (empCardNo > 0)
                query = query.Where(u => u.EmpCardNo == empCardNo);
            else if (departmentID > 0)
                query = query.Where(u => u.DeptCode == departmentID);
                
            return await query.CountAsync();
        }

        public async Task<List<VewSalary>> GetEmployeeSalaryListForEmailAsync(DateTime salaryDate, int empCardNo, int departmentID, string site)
        {
            var query = _db.VewSalaries.Where(u => u.SalaryMonth == salaryDate.Month && u.SalaryYear == salaryDate.Year && u.Email != "" && u.Email != null && u.Site == site);
            if (empCardNo > 0)
                query = query.Where(u => u.EmpCardNo == empCardNo);
            else if (departmentID > 0)
                query = query.Where(u => u.DeptCode == departmentID);
                
            return await query.OrderBy(o => o.EmpCardNo).ToListAsync();
        }

        public async Task<List<VewSalary>> GetSalaryReportListAsync(int month, int year, string site)
        {
            return await _db.VewSalaries
                .Where(u => u.SalaryMonth == month && u.SalaryYear == year && u.Site == site)
                .OrderBy(o => o.EmpCardNo)
                .ToListAsync();
        }

        // ── Evening Salary ────────────────────────────────────────────────────────

        public async Task<int> EveningSalaryMaxNOAsync(string site)
        {
            if (!await _db.HrmEveningSalaryMasters.AnyAsync(u => u.Site == site))
                return 1;
            return await _db.HrmEveningSalaryMasters.Where(u => u.Site == site).MaxAsync(p => p.TransNo) + 1;
        }

        public async Task SaveEveningSalaryMasterAsync(EveningSalaryMasterDto dto, string site, string userId)
        {
            var temp = await _db.HrmEveningSalaryMasters
                .Where(u => u.TransNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmEveningSalaryMaster
                {
                    TransNo = dto.TransactionNo,
                    TransMonth = dto.TransactionDate,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmEveningSalaryMasters.Add(temp);
            }
            else
            {
                temp.TransMonth = dto.TransactionDate;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task SaveEveningSalaryChildAsync(EveningSalaryChildDto dto, string site)
        {
            var temp = new HrmEveningSalaryChild
            {
                TransNo = dto.TransactionNo,
                EmpCardNo = dto.EmpCardNo,
                Subject = dto.Name,
                SalaryPerLecture = dto.Rate,
                TotalLectures = (int)dto.Days,
                Salary = dto.NetPay != 0 ? dto.NetPay : dto.Amount,
                Site = site
            };
            _db.HrmEveningSalaryChildren.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task<EveningSalaryMasterDto?> GetEveningSalaryInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewEveningSalaries
                .Where(u => u.TransNo == transactionNo && u.Site == site)
                .OrderByDescending(u => u.RecNo)
                .Select(temp => new EveningSalaryMasterDto
                {
                    TransactionNo = temp.TransNo,
                    TransactionDate = temp.TransMonth ?? DateTime.Now
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<HrmVewEveningSalary>> GetEveningSalaryChildInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewEveningSalaries
                .Where(u => u.TransNo == transactionNo && u.Site == site)
                .OrderBy(o => o.RecNo)
                .ToListAsync();
        }

        public async Task DeleteEveningSalaryChildAsync(int transactionNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync("DELETE FROM HRM_EveningSalary_Child WHERE Trans_No={0} AND Site={1}", transactionNo, site);
        }

        // ── Special Allowance ─────────────────────────────────────────────────────

        public async Task<int> SpecialAllowanceMaxNoAsync(string site)
        {
            var max = await _db.HrmSpecialAllowanceMasters
                .Where(u => u.Site == site)
                .Select(p => (int?)p.TransactionNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveSpecialAllowanceMasterAsync(SpecialAllowanceMasterDto dto, string site, string userId)
        {
            var temp = await _db.HrmSpecialAllowanceMasters
                .Where(u => u.TransactionNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmSpecialAllowanceMaster
                {
                    TransactionNo = dto.TransactionNo,
                    TransactionDate = dto.TransactionDate,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmSpecialAllowanceMasters.Add(temp);
            }
            else
            {
                temp.TransactionDate = dto.TransactionDate;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task SaveSpecialAllowanceChildAsync(SpecialAllowanceChildDto dto, string site)
        {
            var temp = new HrmSpecialAllowanceChild
            {
                TransactionNo = dto.TransactionNo,
                EmpCardNo = dto.EmpCardNo,
                Name = dto.Name,
                FatherName = dto.FatherName,
                DesignationName = dto.DesignationName,
                DepartmentName = dto.DepartmentName,
                SpecialAllowance = dto.NetPay != 0 ? dto.NetPay : (dto.Allowance + dto.Arrears - dto.Deduction),
                Site = site
            };
            _db.HrmSpecialAllowanceChildren.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task<SpecialAllowanceMasterDto?> GetSpecialAllowanceInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewSpecialAllowances
                .Where(u => u.TransactionNo == transactionNo && u.Site == site)
                .OrderByDescending(u => u.RecNo)
                .Select(temp => new SpecialAllowanceMasterDto
                {
                    TransactionNo = temp.TransactionNo,
                    TransactionDate = temp.TransactionDate ?? DateTime.Now
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<HrmVewSpecialAllowance>> GetSpecialAllowanceChildInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewSpecialAllowances
                .Where(u => u.TransactionNo == transactionNo && u.Site == site)
                .OrderBy(o => o.RecNo)
                .ToListAsync();
        }

        public async Task DeleteSpecialAllowanceChildAsync(int transactionNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync("DELETE FROM HRM_SpecialAllowance_Child WHERE Transaction_No={0} AND Site={1}", transactionNo, site);
        }

        // ── OverTime ──────────────────────────────────────────────────────────────

        public async Task<int> OverTimeMaxNOAsync(string site)
        {
            var max = await _db.OverTimeMasters
                .Where(u => u.Site == site)
                .Select(p => (int?)p.OverTimeNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveOverTimeMasterAsync(OverTimeMasterDto dto, string site, string userId)
        {
            var temp = await _db.OverTimeMasters
                .Where(u => u.OverTimeNo == dto.OverTimeNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new OverTimeMaster
                {
                    OverTimeNo = dto.OverTimeNo,
                    OverTimeDate = dto.OverTimeDate,
                    OverTimeGazetted = dto.OverTimeGazetted,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.OverTimeMasters.Add(temp);
            }
            else
            {
                temp.OverTimeDate = dto.OverTimeDate;
                temp.OverTimeGazetted = dto.OverTimeGazetted;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task SaveOverTimechildAsync(OverTimeChildDto dto, string site)
        {
            var temp = new OverTimeChild
            {
                OverTimeNo = dto.OverTimeNo,
                EmpCardNo = dto.EmpCardNo,
                FromTime = dto.FromTime,
                ToTime = dto.ToTime,
                OverTime = dto.OverTimeHours,
                OverTimeAmount = dto.OverTimeAmount,
                Site = site
            };
            _db.OverTimeChildren.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteOverTimeChildAsync(int overTimeNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync("DELETE FROM OverTime_Child WHERE OverTime_No={0} AND Site={1}", overTimeNo, site);
        }

        public async Task<OverTimeMasterDto?> EditOverTimeMasterAsync(int srno, string site)
        {
            return await _db.OverTimeMasters
                .Where(u => u.OverTimeNo == srno && u.Site == site)
                .OrderByDescending(u => u.OverTimeNo)
                .Select(temp => new OverTimeMasterDto
                {
                    OverTimeNo = temp.OverTimeNo,
                    OverTimeDate = temp.OverTimeDate ?? DateTime.Today,
                    OverTimeGazetted = temp.OverTimeGazetted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<VewOverTime>> EditOverTimeChildAsync(int srno, string site)
        {
            return await _db.VewOverTimes
                .Where(u => u.OverTimeNo == srno && u.Site == site)
                .OrderBy(o => o.SerialNo)
                .ToListAsync();
        }

        // ── Update Salary Breakup ─────────────────────────────────────────────────

        public async Task<int> UpdateSalaryBreakupMaxNoAsync(string site)
        {
            var max = await _db.HrmUpdateSalaryBreakupMasters
                .Where(u => u.Site == site)
                .Select(p => (int?)p.TransactionNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveUpdateSalaryBreakupMasterAsync(UpdateSalaryBreakupMasterDto dto, string site, string userId)
        {
            var temp = await _db.HrmUpdateSalaryBreakupMasters
                .Where(u => u.TransactionNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmUpdateSalaryBreakupMaster
                {
                    TransactionNo = dto.TransactionNo,
                    TransactionDate = dto.TransactionDate,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmUpdateSalaryBreakupMasters.Add(temp);
            }
            else
            {
                temp.TransactionDate = dto.TransactionDate;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task SaveUpdateSalaryBreakupChildAsync(UpdateSalaryBreakupChildDto dto, string site)
        {
            var temp = new HrmUpdateSalaryBreakupChild
            {
                TransactionNo = dto.TransactionNo,
                EmpCardNo = dto.EmpCardNo,
                Name = dto.Name,
                BasicPay = dto.BasicPay,
                TwentyPercent = dto.twentyPerc,
                HouseRent = dto.HouseRent,
                ThirtyFivePercent = dto.ThirtyFivePerc,
                Conveyance = dto.Conveyance,
                Adh1 = dto.ADH1,
                Adh2 = dto.ADH2,
                Adh3 = dto.ADH3,
                Allowance = dto.Allowance,
                TwentyPercent1 = dto.twentyPerc1,
                ProvidentFund = dto.ProvidentFund,
                Eobi = dto.EOBI,
                GrossPay = dto.GrossPay,
                Allowances = dto.allowances,
                DAdvance = dto.D_Advance,
                DEobi = dto.D_EOBI,
                DLoan = dto.D_Loan,
                DLvs = dto.D_Lvs,
                DProvidentFund = dto.D_ProvidentFund,
                DTax = dto.D_Tax,
                NetPay = dto.NetPay,
                Site = site
            };
            _db.HrmUpdateSalaryBreakupChildren.Add(temp);
            await _db.SaveChangesAsync();
        }

        public async Task<UpdateSalaryBreakupMasterDto?> GetUpdateSalaryBreakupMasterInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewUpdateSalaryBreakups
                .Where(u => u.TransactionNo == transactionNo && u.Site == site)
                .OrderByDescending(u => u.RecNo)
                .Select(temp => new UpdateSalaryBreakupMasterDto
                {
                    TransactionNo = temp.TransactionNo,
                    TransactionDate = temp.TransactionDate ?? DateTime.Now
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<HrmVewUpdateSalaryBreakup>> GetUpdateSalaryBreakupChildInfoAsync(int transactionNo, string site)
        {
            return await _db.HrmVewUpdateSalaryBreakups
                .Where(u => u.TransactionNo == transactionNo && u.Site == site)
                .OrderBy(o => o.RecNo)
                .ToListAsync();
        }

        public async Task DeleteUpdateSalaryBreakupChildAsync(int transactionNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync("DELETE FROM HRM_UpdateSalaryBreakup_Child WHERE Transaction_No={0} AND Site={1}", transactionNo, site);
        }

        public async Task UpdateEmployeeSalaryBreakupAsync(UpdateSalaryBreakupChildDto dto, string site)
        {
            var temp = await _db.EmpSalaries
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp != null)
            {
                temp.BasicPay = dto.BasicPay;
                temp.A01 = dto.twentyPerc;
                temp.A02 = dto.ThirtyFivePerc;
                temp.A03 = dto.HouseRent;
                temp.A04 = dto.Conveyance;
                temp.A05 = dto.ADH1;
                temp.A06 = dto.ADH2;
                temp.A07 = dto.ADH3;
                temp.A08 = dto.Allowance;
                temp.A09 = dto.twentyPerc1;
                temp.A10 = dto.ProvidentFund;
                temp.A11 = dto.EOBI;
                temp.A12 = dto.allowances;

                temp.GrossPay = dto.GrossPay;
                temp.D01 = dto.D_ProvidentFund;
                temp.D02 = dto.D_EOBI;
                temp.D03 = dto.D_Advance;
                temp.D04 = dto.D_Loan;
                temp.D05 = dto.D_Tax;
                temp.D06 = dto.D_Lvs;
                temp.NetPay = dto.NetPay;
                temp.PfSchoolShare = dto.PfSchoolShare;
                temp.EobiSchoolShare = dto.EobiSchoolShare;
                
                await _db.SaveChangesAsync();
            }
        }
    }
}
