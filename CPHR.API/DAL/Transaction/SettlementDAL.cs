using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.DAL.Transaction
{
    public class SettlementDAL : ISettlementDAL
    {
        private readonly HRMSDbContext _db;

        public SettlementDAL(HRMSDbContext db)
        {
            _db = db;
        }

        public async Task<int> FinalSettlementMaxNOAsync(string site)
        {
            var max = await _db.HrmFinalSettlements
                .Where(u => u.Site == site)
                .Select(p => (int?)p.TransactionNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<int> CheckSettlementAsync(int cardNo, string site)
        {
            return await _db.HrmFinalSettlements
                .Where(u => u.EmpCardNo == cardNo && u.Site == site)
                .Select(p => p.TransactionNo)
                .FirstOrDefaultAsync();
        }

        public async Task<decimal> GetOverTimeAsync(int cardNo, DateTime fromDate, DateTime toDate, string site)
        {
            return await _db.AttendanceRegisters
                .Where(u => u.EmpCardNo == cardNo
                    && u.AttendanceDate >= fromDate
                    && u.AttendanceDate <= toDate
                    && u.Site == site)
                .SumAsync(u => u.OverTime ?? 0);
        }

        public async Task SaveFinalSettlementAsync(FinalSettlementDto dto, string site, string userId)
        {
            var temp = await _db.HrmFinalSettlements
                .Where(u => u.TransactionNo == dto.TransactionNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmFinalSettlement
                {
                    TransactionNo = dto.TransactionNo,
                    TransactionDate = dto.TransactionDate,
                    EmpCardNo = dto.EmpCardNo,
                    LeavingType = dto.LeavingType,
                    LeavingDate = dto.LeavingDate,
                    SalaryDays = dto.SalaryDays,
                    SalaryMonth = dto.SalaryMonth,
                    SalaryAmount = dto.SalaryAmount,
                    OverTimeHours = dto.OverTimeHours,
                    OverTimeAmount = dto.OverTimeAmount,
                    TotalSalary = dto.TotalSalary,
                    SalaryAdvance = dto.SalaryAdvance,
                    LoanAmount = dto.LoanAdvance,
                    OtherPayable = dto.OtherPayable,
                    GraduityPercent = dto.GraduityPercent,
                    GraduityDays = dto.GraduityDays,
                    GraduityAmount = dto.GraduityAmount,
                    LeavesPayable = dto.LeavesPayable,
                    LeavesType = dto.LeavesType,
                    LeavesAmount = dto.LeavesAmount,
                    NoticeDays = dto.NoticeDays,
                    NoticeAmount = dto.NoticeDaysAmount,
                    Eobi = dto.EOBI,
                    OtherDeductions = dto.OtherDeductions,
                    PayableAmount = dto.PayableAmount,
                    IncomeTax = dto.IncomeTax,
                    ProvidentFund = dto.ProvidentFund,
                    ProvidentFundProfit = dto.ProvidentFundProfit,
                    MobileAllowance = dto.MobileAllowance,
                    FuelAllowance = dto.FuelAllowance,
                    FabricLoan = dto.FabricLoan,
                    VehicleLoan = dto.VehicleLoan,
                    Commission = dto.Commission,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmFinalSettlements.Add(temp);
            }
            else
            {
                temp.TransactionDate = dto.TransactionDate;
                temp.EmpCardNo = dto.EmpCardNo;
                temp.LeavingType = dto.LeavingType;
                temp.LeavingDate = dto.LeavingDate;
                temp.SalaryDays = dto.SalaryDays;
                temp.SalaryMonth = dto.SalaryMonth;
                temp.SalaryAmount = dto.SalaryAmount;
                temp.OverTimeHours = dto.OverTimeHours;
                temp.OverTimeAmount = dto.OverTimeAmount;
                temp.TotalSalary = dto.TotalSalary;
                temp.SalaryAdvance = dto.SalaryAdvance;
                temp.LoanAmount = dto.LoanAdvance;
                temp.OtherPayable = dto.OtherPayable;
                temp.GraduityPercent = dto.GraduityPercent;
                temp.GraduityDays = dto.GraduityDays;
                temp.GraduityAmount = dto.GraduityAmount;
                temp.LeavesPayable = dto.LeavesPayable;
                temp.LeavesType = dto.LeavesType;
                temp.LeavesAmount = dto.LeavesAmount;
                temp.NoticeDays = dto.NoticeDays;
                temp.NoticeAmount = dto.NoticeDaysAmount;
                temp.Eobi = dto.EOBI;
                temp.OtherDeductions = dto.OtherDeductions;
                temp.PayableAmount = dto.PayableAmount;
                temp.IncomeTax = dto.IncomeTax;
                temp.ProvidentFund = dto.ProvidentFund;
                temp.ProvidentFundProfit = dto.ProvidentFundProfit;
                temp.MobileAllowance = dto.MobileAllowance;
                temp.FuelAllowance = dto.FuelAllowance;
                temp.FabricLoan = dto.FabricLoan;
                temp.VehicleLoan = dto.VehicleLoan;
                temp.Commission = dto.Commission;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<FinalSettlementDto?> EditFinalSettlementAsync(int settlementNo, string site)
        {
            return await _db.HrmVewFinalSettlements
                .Where(u => u.TransactionNo == settlementNo && u.Site == site)
                .OrderByDescending(u => u.TransactionNo)
                .Select(temp => new FinalSettlementDto
                {
                    TransactionNo = temp.TransactionNo,
                    TransactionDate = temp.TransactionDate ?? DateTime.Today,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    EmpName = temp.EmpName ?? "",
                    Department = temp.DepartmentName ?? "",
                    EmpFatherName = temp.EmpFatherName,
                    CNIC = temp.Cnic,
                    Designation = temp.DesignationName ?? "",
                    JoiningDate = temp.JoiningDate ?? DateTime.Now,
                    GrossPay = temp.GrossPay ?? 0,
                    BasicPay = temp.BasicPay ?? 0,
                    LeavingType = temp.LeavingType ?? "",
                    LeavingDate = temp.LeavingDate ?? DateTime.Now,
                    SalaryDays = temp.SalaryDays ?? 0,
                    SalaryMonth = temp.SalaryMonth ?? DateTime.Now,
                    SalaryAmount = temp.SalaryAmount ?? 0,
                    OverTimeHours = temp.OverTimeHours ?? 0,
                    OverTimeAmount = temp.OverTimeAmount ?? 0,
                    TotalSalary = temp.TotalSalary ?? 0,
                    OtherPayable = temp.OtherPayable ?? 0,
                    SalaryAdvance = temp.SalaryAdvance ?? 0,
                    GraduityPercent = temp.GraduityPercent ?? 0,
                    GraduityDays = temp.GraduityDays ?? 0,
                    IncomeTax = temp.IncomeTax ?? 0,
                    GraduityAmount = temp.GraduityAmount ?? 0,
                    LeavesPayable = temp.LeavesPayable ?? 0,
                    LeavesType = temp.LeavesType ?? "",
                    LeavesAmount = temp.LeavesAmount ?? 0,
                    NoticeDays = temp.NoticeDays ?? 0,
                    NoticeDaysAmount = temp.NoticeAmount ?? 0,
                    LoanAdvance = temp.LoanAmount ?? 0,
                    EOBI = temp.Eobi ?? 0,
                    OtherDeductions = temp.OtherDeductions ?? 0,
                    PayableAmount = temp.PayableAmount ?? 0,
                    ProvidentFund = temp.ProvidentFund ?? 0,
                    ProvidentFundProfit = temp.ProvidentFundProfit ?? 0,
                    MobileAllowance = temp.MobileAllowance ?? 0,
                    FuelAllowance = temp.FuelAllowance ?? 0,
                    FabricLoan = temp.FabricLoan ?? 0,
                    VehicleLoan = temp.VehicleLoan ?? 0,
                    Commission = temp.Commission ?? 0
                })
                .FirstOrDefaultAsync();
        }

        public async Task<FinalSettlementDto?> EditFinalSettlementCardNoAsync(int cardNo, string site)
        {
            return await _db.HrmVewFinalSettlements
                .Where(u => u.EmpCardNo == cardNo && u.Site == site)
                .OrderByDescending(u => u.EmpCardNo)
                .Select(temp => new FinalSettlementDto
                {
                    TransactionNo = temp.TransactionNo,
                    TransactionDate = temp.TransactionDate ?? DateTime.Today,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    EmpName = temp.EmpName ?? "",
                    Department = temp.DepartmentName ?? "",
                    Designation = temp.DesignationName ?? "",
                    EmpFatherName = temp.EmpFatherName,
                    CNIC = temp.Cnic,
                    JoiningDate = temp.JoiningDate ?? DateTime.Now,
                    GrossPay = temp.GrossPay ?? 0,
                    BasicPay = temp.BasicPay ?? 0,
                    LeavingType = temp.LeavingType ?? "",
                    LeavingDate = temp.LeavingDate ?? DateTime.Now,
                    SalaryDays = temp.SalaryDays ?? 0,
                    SalaryMonth = temp.SalaryMonth ?? DateTime.Now,
                    SalaryAmount = temp.SalaryAmount ?? 0,
                    OverTimeHours = temp.OverTimeHours ?? 0,
                    OverTimeAmount = temp.OverTimeAmount ?? 0,
                    IncomeTax = temp.IncomeTax ?? 0,
                    TotalSalary = temp.TotalSalary ?? 0,
                    OtherPayable = temp.OtherPayable ?? 0,
                    SalaryAdvance = temp.SalaryAdvance ?? 0,
                    GraduityPercent = temp.GraduityPercent ?? 0,
                    GraduityDays = temp.GraduityDays ?? 0,
                    GraduityAmount = temp.GraduityAmount ?? 0,
                    LeavesPayable = temp.LeavesPayable ?? 0,
                    LeavesType = temp.LeavesType ?? "",
                    LeavesAmount = temp.LeavesAmount ?? 0,
                    NoticeDays = temp.NoticeDays ?? 0,
                    NoticeDaysAmount = temp.NoticeAmount ?? 0,
                    LoanAdvance = temp.LoanAmount ?? 0,
                    EOBI = temp.Eobi ?? 0,
                    OtherDeductions = temp.OtherDeductions ?? 0,
                    PayableAmount = temp.PayableAmount ?? 0,
                    ProvidentFund = temp.ProvidentFund ?? 0,
                    ProvidentFundProfit = temp.ProvidentFundProfit ?? 0,
                    MobileAllowance = temp.MobileAllowance ?? 0,
                    FuelAllowance = temp.FuelAllowance ?? 0,
                    FabricLoan = temp.FabricLoan ?? 0,
                    VehicleLoan = temp.VehicleLoan ?? 0,
                    Commission = temp.Commission ?? 0
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<FinalSettlementDto>> GetFinalSettlementsListAsync(string site)
        {
            return await _db.HrmVewFinalSettlements
                .Where(u => u.Site == site)
                .OrderByDescending(u => u.TransactionNo)
                .Select(temp => new FinalSettlementDto
                {
                    TransactionNo = temp.TransactionNo,
                    TransactionDate = temp.TransactionDate ?? DateTime.Today,
                    EmpCardNo = temp.EmpCardNo ?? 0,
                    EmpName = temp.EmpName ?? "",
                    Department = temp.DepartmentName ?? "",
                    Designation = temp.DesignationName ?? "",
                    EmpFatherName = temp.EmpFatherName,
                    CNIC = temp.Cnic,
                    JoiningDate = temp.JoiningDate ?? DateTime.Now,
                    GrossPay = temp.GrossPay ?? 0,
                    BasicPay = temp.BasicPay ?? 0,
                    LeavingType = temp.LeavingType ?? "",
                    LeavingDate = temp.LeavingDate ?? DateTime.Now,
                    SalaryDays = temp.SalaryDays ?? 0,
                    SalaryMonth = temp.SalaryMonth ?? DateTime.Now,
                    SalaryAmount = temp.SalaryAmount ?? 0,
                    OverTimeHours = temp.OverTimeHours ?? 0,
                    OverTimeAmount = temp.OverTimeAmount ?? 0,
                    IncomeTax = temp.IncomeTax ?? 0,
                    TotalSalary = temp.TotalSalary ?? 0,
                    OtherPayable = temp.OtherPayable ?? 0,
                    SalaryAdvance = temp.SalaryAdvance ?? 0,
                    GraduityPercent = temp.GraduityPercent ?? 0,
                    GraduityDays = temp.GraduityDays ?? 0,
                    GraduityAmount = temp.GraduityAmount ?? 0,
                    LeavesPayable = temp.LeavesPayable ?? 0,
                    LeavesType = temp.LeavesType ?? "",
                    LeavesAmount = temp.LeavesAmount ?? 0,
                    NoticeDays = temp.NoticeDays ?? 0,
                    NoticeDaysAmount = temp.NoticeAmount ?? 0,
                    LoanAdvance = temp.LoanAmount ?? 0,
                    EOBI = temp.Eobi ?? 0,
                    OtherDeductions = temp.OtherDeductions ?? 0,
                    PayableAmount = temp.PayableAmount ?? 0,
                    ProvidentFund = temp.ProvidentFund ?? 0,
                    ProvidentFundProfit = temp.ProvidentFundProfit ?? 0,
                    MobileAllowance = temp.MobileAllowance ?? 0,
                    FuelAllowance = temp.FuelAllowance ?? 0,
                    FabricLoan = temp.FabricLoan ?? 0,
                    VehicleLoan = temp.VehicleLoan ?? 0,
                    Commission = temp.Commission ?? 0
                })
                .ToListAsync();
        }
    }
}
