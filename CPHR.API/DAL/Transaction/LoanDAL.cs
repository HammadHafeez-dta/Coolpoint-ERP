using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.DAL.Transaction
{
    public class LoanDAL : ILoanDAL
    {
        private readonly HRMSDbContext _db;

        public LoanDAL(HRMSDbContext db)
        {
            _db = db;
        }

        public async Task<List<LoanType>> GetLoanTypesAsync()
        {
            return await _db.LoanTypes.OrderBy(u => u.LoanType1).ToListAsync();
        }

        /// <summary>Maps API "transaction number" to loan <see cref="Loan.AppNo"/> (legacy App_No).</summary>
        public async Task<int> LoanMaxNOAsync(string site)
        {
            if (!await _db.Loans.AnyAsync(u => u.Site == site))
                return 1;
            return await _db.Loans.Where(u => u.Site == site).MaxAsync(u => u.AppNo) + 1;
        }

        public async Task SaveLoansAsync(LoanDto dto, string site, string userId)
        {
            var temp = await _db.Loans
                .Where(u => u.AppNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            var loanClear = MapLoanStatusToLoanClear(dto.Status);

            if (temp == null)
            {
                temp = new Loan
                {
                    AppNo = dto.TransactionNo,
                    LoanDate = dto.TransactionDate,
                    EmpCardNo = dto.EmpCardNo,
                    LoanType = dto.LoanType,
                    LoanAmount = dto.LoanAmount,
                    LoanInstallment = dto.InstalmentAmount,
                    LoanClear = loanClear,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.Loans.Add(temp);
            }
            else
            {
                temp.LoanDate = dto.TransactionDate;
                temp.EmpCardNo = dto.EmpCardNo;
                temp.LoanType = dto.LoanType;
                temp.LoanAmount = dto.LoanAmount;
                temp.LoanInstallment = dto.InstalmentAmount;
                temp.LoanClear = loanClear;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        private static byte? MapLoanStatusToLoanClear(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return 0;
            return status.Trim().Equals("OPEN", StringComparison.OrdinalIgnoreCase) ? (byte)0 : (byte)1;
        }

        private static bool IsOpenLoan(Loan u) =>
            (u.LoanClear ?? 0) == 0;

        public async Task<LoanDto?> GetLoanInfoAsync(int transactionNo, string site)
        {
            return await _db.VewLoans
                .Where(u => u.AppNo == transactionNo && u.Site == site)
                .OrderByDescending(u => u.AppNo)
                .Select(temp => new LoanDto
                {
                    TransactionNo = temp.AppNo,
                    TransactionDate = temp.LoanDate ?? DateTime.Now,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    EmpName = temp.EmpName ?? "",
                    DesignationName = temp.DesignationName ?? "",
                    DepartmentName = temp.DepartmentName ?? "",
                    LoanType = temp.LoanType ?? "",
                    LoanAmount = temp.LoanAmount ?? 0,
                    Instalments = 0,
                    InstalmentAmount = temp.LoanInstallment ?? 0,
                    StartingMonth = temp.LoanDate ?? DateTime.Now,
                    Status = (temp.LoanClear ?? 0) == 0 ? "OPEN" : "CLOSED"
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<LoanDto>> GetLoansListAsync(string site)
        {
            return await _db.VewLoans
                .Where(u => u.Site == site)
                .OrderByDescending(u => u.AppNo)
                .Select(temp => new LoanDto
                {
                    TransactionNo = temp.AppNo,
                    TransactionDate = temp.LoanDate ?? DateTime.Now,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    EmpName = temp.EmpName ?? "",
                    DesignationName = temp.DesignationName ?? "",
                    DepartmentName = temp.DepartmentName ?? "",
                    LoanType = temp.LoanType ?? "",
                    LoanAmount = temp.LoanAmount ?? 0,
                    Instalments = 0,
                    InstalmentAmount = temp.LoanInstallment ?? 0,
                    StartingMonth = temp.LoanDate ?? DateTime.Now,
                    Status = (temp.LoanClear ?? 0) == 0 ? "OPEN" : "CLOSED"
                })
                .ToListAsync();
        }

        public async Task<bool> CheckEmpLongTermLoanAsync(int empcard, string site)
        {
            var temp = await _db.Loans
                .Where(u => u.EmpCardNo == empcard && u.LoanType == "LONG TERM LOAN" && IsOpenLoan(u) && u.Site == site)
                .FirstOrDefaultAsync();
            return temp != null;
        }

        public async Task<bool> CheckEmpProvidentFundLoanAsync(int empcard, string site)
        {
            var temp = await _db.Loans
                .Where(u => u.EmpCardNo == empcard && u.LoanType == "PROVIDENT FUND LOAN" && IsOpenLoan(u) && u.Site == site)
                .FirstOrDefaultAsync();
            return temp != null;
        }

        public async Task DeleteLoanLedgerAsync(int loanTransactionNo, string site)
        {
            await _db.Database.ExecuteSqlRawAsync("DELETE FROM Loan_Ledger WHERE Loan_TransactionNo={0} AND Site={1}", loanTransactionNo, site);
        }

        public async Task SaveLoanLedgerTempAsync(LoanLedgerDto dto, string site)
        {
            await _db.Database.ExecuteSqlRawAsync(
                "INSERT INTO Loan_Ledger_Temp (Serial_No, Loan_TransactionNo, Emp_CardNo, Instalment_Month, Instalment_Amount, IsPaid, Site) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                dto.SerialNo, dto.LoanTransactionNo, dto.EmpCardNo, dto.InstalmentMonth, dto.InstalmentAmount, dto.IsPaid ?? "", site);
        }

        public async Task DeleteLoanLedgerTempAsync()
        {
            await _db.Database.ExecuteSqlRawAsync("TRUNCATE TABLE Loan_Ledger_Temp");
        }

        public async Task SaveLoanLedgerAsync(LoanLedgerDto dto, string site)
        {
            await _db.Database.ExecuteSqlRawAsync(
                "INSERT INTO Loan_Ledger (Serial_No, Loan_TransactionNo, Emp_CardNo, Instalment_Month, Instalment_Amount, IsPaid, Site) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                dto.SerialNo, dto.LoanTransactionNo, dto.EmpCardNo, dto.InstalmentMonth, dto.InstalmentAmount, dto.IsPaid ?? "", site);
        }

        public async Task<int> LoanDeductionsMaxNOAsync(string site)
        {
            _ = site;
            if (!await _db.LoanDeductions.AnyAsync())
                return 1;
            return await _db.LoanDeductions.MaxAsync(p => p.SerialNo) + 1;
        }

        public async Task SaveLoanDeductionsAsync(LoanDeductionDto dto, string site, string userId)
        {
            _ = site;
            _ = userId;
            var temp = await _db.LoanDeductions
                .Where(u => u.SerialNo == dto.TransactionNo)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new LoanDeduction
                {
                    SerialNo = dto.TransactionNo,
                    DeductionDate = dto.TransactionDate,
                    EmpCardNo = dto.EmpCardNo,
                    LoanType = dto.DeductionType,
                    DeductionAmount = dto.LoanDeductionAmount
                };
                _db.LoanDeductions.Add(temp);
            }
            else
            {
                temp.DeductionDate = dto.TransactionDate;
                temp.EmpCardNo = dto.EmpCardNo;
                temp.DeductionAmount = dto.LoanDeductionAmount;
                temp.LoanType = dto.DeductionType;
            }

            await _db.SaveChangesAsync();
        }

        public async Task DeleteLoanDeductionsAsync(int transactionNo, string site)
        {
            _ = site;
            var temp = await _db.LoanDeductions
                .Where(u => u.SerialNo == transactionNo)
                .FirstOrDefaultAsync();

            if (temp != null)
            {
                _db.LoanDeductions.Remove(temp);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<LoanDeductionDto?> GetLoanDeductionsInfoAsync(int transactionNo, string site)
        {
            _ = site;
            return await _db.LoanDeductions
                .Where(u => u.SerialNo == transactionNo)
                .Select(temp => new LoanDeductionDto
                {
                    TransactionNo = temp.SerialNo,
                    TransactionDate = temp.DeductionDate ?? DateTime.Now,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    LoanTransactionNo = 0,
                    LoanDeductionAmount = temp.DeductionAmount ?? 0,
                    DeductionType = temp.LoanType ?? ""
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<LoanDeduction>> GetLoansDeductionsAsync(int transactionNo, string site)
        {
            var loan = await _db.Loans
                .Where(u => u.AppNo == transactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (loan?.EmpCardNo == null || string.IsNullOrEmpty(loan.LoanType))
                return new List<LoanDeduction>();

            return await _db.LoanDeductions
                .Where(u => u.EmpCardNo == loan.EmpCardNo && u.LoanType == loan.LoanType)
                .ToListAsync();
        }

        public async Task<decimal> CheckEmpLoanInstalmentAsync(int empcard, string site)
        {
            return await _db.Loans
                .Where(u => u.EmpCardNo == empcard && u.LoanType == "LONG TERM LOAN" && IsOpenLoan(u) && u.Site == site)
                .Select(p => p.LoanInstallment ?? 0)
                .FirstOrDefaultAsync();
        }

        public async Task<int> LoanReturnMaxNOAsync(string site)
        {
            _ = site;
            if (!await _db.LoanDeductions.AnyAsync())
                return 1;
            return await _db.LoanDeductions.MaxAsync(p => p.SerialNo) + 1;
        }

        /// <summary>PF loan return is persisted on <c>Loan_Deductions</c> (legacy HRMS behavior).</summary>
        public async Task SaveLoanReturnAsync(LoanReturnDto dto, string site, string userId)
        {
            _ = site;
            _ = userId;
            var temp = await _db.LoanDeductions
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.LoanType == dto.LoanType && u.DeductionDate == dto.TransactionDate)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                var serial = await LoanReturnMaxNOAsync(site);
                temp = new LoanDeduction
                {
                    SerialNo = serial,
                    EmpCardNo = dto.EmpCardNo,
                    LoanType = dto.LoanType,
                    DeductionDate = dto.TransactionDate,
                    DeductionAmount = dto.ReturnAmount
                };
                _db.LoanDeductions.Add(temp);
            }
            else
            {
                temp.LoanType = dto.LoanType;
                temp.DeductionDate = dto.TransactionDate;
                temp.DeductionAmount = dto.ReturnAmount;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<LoanReturnDto?> GetPfLoanReturnInfoAsync(int transactionNo, string site)
        {
            _ = site;
            return await _db.LoanDeductions
                .Where(u => u.SerialNo == transactionNo)
                .Select(temp => new LoanReturnDto
                {
                    TransactionNo = temp.SerialNo,
                    TransactionDate = temp.DeductionDate ?? DateTime.Now,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    LoanType = temp.LoanType ?? "",
                    ReturnAmount = temp.DeductionAmount ?? 0
                })
                .FirstOrDefaultAsync();
        }
    }
}
