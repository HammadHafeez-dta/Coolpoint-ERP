using SaftHR.API.DTO.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.Interface.Transaction
{
    public interface ISalaryDAL
    {
        // ── Monthly Salary ────────────────────────────────────────────────────────
        Task SaveMonthlySalaryAsync(SalaryDto dto, string site, string userId);
        Task<ProcessSalaryResultDto> ProcessMonthlySalaryAsync(ProcessSalaryRequestDto request, string site, string userId);
        Task<bool> DeleteMonthlySalarySingleAsync(SalaryDto dto, string site);
        Task<bool> DeleteMonthlySalaryAsync(int salaryMonth, int salaryYear);
        Task<DeleteSalaryResultDto> DeleteMonthlySalaryRangeAsync(DeleteSalaryRequestDto request, string site);
        Task<decimal> GetTotalAbsentsAsync(DateTime fromDate, DateTime toDate, int empCardNo, string site);
        Task<decimal> GetTotalDaysAsync(DateTime fromDate, DateTime toDate, int empCardNo, string site);
        Task<decimal> GetTotalPFundAsync(DateTime salaryDate, int empCardNo, string site);
        Task<decimal> GetTotalPfSchoolShareAsync(DateTime salaryDate, int empCardNo, string site);
        Task<VewSalary?> GetMonthlySalaryAsync(int empCardNo, DateTime salaryMonth, string site);
        Task<int> GetTotalEmployeeSalarySlipForEmailAsync(DateTime salaryDate, int empCardNo, int departmentID, string site);
        Task<List<VewSalary>> GetEmployeeSalaryListForEmailAsync(DateTime salaryDate, int empCardNo, int departmentID, string site);
        Task<List<VewSalary>> GetSalaryReportListAsync(int month, int year, string site);

        // ── Evening Salary ────────────────────────────────────────────────────────
        Task<int> EveningSalaryMaxNOAsync(string site);
        Task SaveEveningSalaryMasterAsync(EveningSalaryMasterDto dto, string site, string userId);
        Task SaveEveningSalaryChildAsync(EveningSalaryChildDto dto, string site);
        Task<EveningSalaryMasterDto?> GetEveningSalaryInfoAsync(int transactionNo, string site);
        Task<List<HrmVewEveningSalary>> GetEveningSalaryChildInfoAsync(int transactionNo, string site);
        Task DeleteEveningSalaryChildAsync(int transactionNo, string site);

        // ── Special Allowance ─────────────────────────────────────────────────────
        Task<int> SpecialAllowanceMaxNoAsync(string site);
        Task SaveSpecialAllowanceMasterAsync(SpecialAllowanceMasterDto dto, string site, string userId);
        Task SaveSpecialAllowanceChildAsync(SpecialAllowanceChildDto dto, string site);
        Task<SpecialAllowanceMasterDto?> GetSpecialAllowanceInfoAsync(int transactionNo, string site);
        Task<List<HrmVewSpecialAllowance>> GetSpecialAllowanceChildInfoAsync(int transactionNo, string site);
        Task DeleteSpecialAllowanceChildAsync(int transactionNo, string site);

        // ── OverTime ──────────────────────────────────────────────────────────────
        Task<int> OverTimeMaxNOAsync(string site);
        Task SaveOverTimeMasterAsync(OverTimeMasterDto dto, string site, string userId);
        Task SaveOverTimechildAsync(OverTimeChildDto dto, string site);
        Task DeleteOverTimeChildAsync(int overTimeNo, string site);
        Task<OverTimeMasterDto?> EditOverTimeMasterAsync(int srno, string site);
        Task<List<VewOverTime>> EditOverTimeChildAsync(int srno, string site);

        // ── Update Salary Breakup ─────────────────────────────────────────────────
        Task<int> UpdateSalaryBreakupMaxNoAsync(string site);
        Task SaveUpdateSalaryBreakupMasterAsync(UpdateSalaryBreakupMasterDto dto, string site, string userId);
        Task SaveUpdateSalaryBreakupChildAsync(UpdateSalaryBreakupChildDto dto, string site);
        Task<UpdateSalaryBreakupMasterDto?> GetUpdateSalaryBreakupMasterInfoAsync(int transactionNo, string site);
        Task<List<HrmVewUpdateSalaryBreakup>> GetUpdateSalaryBreakupChildInfoAsync(int transactionNo, string site);
        Task DeleteUpdateSalaryBreakupChildAsync(int transactionNo, string site);
        Task UpdateEmployeeSalaryBreakupAsync(UpdateSalaryBreakupChildDto dto, string site);
    }
}
