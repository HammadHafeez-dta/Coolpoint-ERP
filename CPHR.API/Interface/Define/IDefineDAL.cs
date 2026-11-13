using SaftHR.API.DTO.Define;

namespace SaftHR.API.Interface.Define
{
    public interface IDefineDAL
    {
        // ── Employee ──────────────────────────────────────────────────────────
        Task<int> EmpMaxNoAsync(string site);
        Task<string> EmpInTimeAsync(int empCardNo);
        Task SaveEmployeeAsync(EmployeeRequestDto dto, string site, string userId);
        Task SaveEmployeeSalaryAsync(EmployeeSalaryDto dto, string site, string userId);
        Task SaveEmployeeSalaryIncrementAsync(EmployeeSalaryIncrementDto dto, string site, string userId);
        Task<List<HrmVewSalaryIncrementDto>> GetEmployeeSalaryIncrementAsync(DateTime incrementDate, string site);
        Task<bool> DeleteEmployeeSalaryIncrementAsync(DateTime incrementDate);
        Task UpdateEmployeeSalaryAsync(EmployeeSalaryDto dto, string site);
        Task<EmployeeResponseDto?> GetEmployeeInfoAsync(int empId, string site);
        Task<EmployeeResponseDto?> GetEmployeeInfoLittleAsync(int empId, string site);
        Task<EmployeeSalaryDto?> GetEmployeeSalaryInfoAsync(int empId, string site);
        Task<bool> UpdateEmployeeStruckOffAsync(EmployeeStruckOffDto dto, string site);
        Task UpdateEmployeeTimingsAsync(EmployeeTimingsDto dto, string site);
        Task UpdateEmployeeRestDayAsync(EmployeeRestDayDto dto, string site);
        Task<int> GetEmployeeNosAsync(string site);
        Task<List<EmployeeResponseDto>> GetEmployeeListAsync(EmployeeListRequestDto request, string site);
        Task<List<EmployeeResponseDto>> GetStaffRosterReportAsync(string? search, string? category, string site);
        Task UpdateEmployeeSalaryBlockedAsync(EmployeeSalaryBlockDto dto, string userId);
        Task<List<ContractExpiryAlertDto>> GetContractExpiryAlertsAsync(string site);
        Task<bool> DeleteEmployeeAsync(int empCardNo, string site);

        // ── Employee Opening Balances ─────────────────────────────────────────
        Task<EmployeeOpeningBalancesDto?> GetEmployeeOpeningBalancesAsync(int empId, string site);
        Task<bool> SaveEmployeeOpeningBalancesAsync(EmployeeOpeningBalancesDto dto, string site, string userId);
        Task<decimal> GetPFundOpeningAsync(int empId, string site);

        // ── Department ────────────────────────────────────────────────────────
        Task<int> GetDepartmentMaxNoAsync(string site);
        Task SaveDepartmentAsync(DepartmentRequestDto dto, string site);
        Task<DepartmentResponseDto?> GetDepartmentAsync(int departmentId, string site);
        Task<List<DepartmentResponseDto>> GetDepartmentListAsync(string site);
        Task<bool> DeleteDepartmentAsync(int departmentId, string site);

        // ── Designation ───────────────────────────────────────────────────────
        Task<int> GetDesignationMaxNoAsync(string site);
        Task<int> SaveDesignationAsync(DesignationRequestDto dto, string site);
        Task<DesignationResponseDto?> GetDesignationAsync(int designationId, string site);
        Task<List<DesignationResponseDto>> GetDesignationListAsync(string site);
        Task<bool> DeleteDesignationAsync(int designationId, string site);

        // ── Location ──────────────────────────────────────────────────────────
        Task<int> GetLocationMaxNoAsync();
        Task SaveLocationAsync(LocationRequestDto dto);
        Task<LocationResponseDto?> GetLocationAsync(int locationId);
        Task<List<LocationResponseDto>> GetLocationsListAsync();
        Task<List<SalaryUnitResponseDto>> GetSalaryUnitsListAsync(CancellationToken cancellationToken);

        // ── Grade ─────────────────────────────────────────────────────────────
        Task<int> GetGradeMaxNoAsync();
        Task SaveGradeAsync(GradeRequestDto dto);
        Task<GradeResponseDto?> GetGradeAsync(int gradeId);
        Task<List<GradeResponseDto>> GetGradesListAsync();
        Task<bool> DeleteGradeAsync(int gradeId);

        // ── Shift ─────────────────────────────────────────────────────────────
        Task<int> GetShiftMaxNoAsync();
        Task SaveShiftAsync(ShiftRequestDto dto);
        Task<ShiftResponseDto?> GetShiftAsync(int shiftId);
        Task<List<ShiftResponseDto>> GetShiftsListAsync();

        // ── Bank ──────────────────────────────────────────────────────────────
        Task<int> GetBankMaxNoAsync();
        Task SaveBankAsync(BankRequestDto dto);
        Task<BankResponseDto?> GetBankAsync(int bankId);
        Task<List<BankResponseDto>> GetBanksListAsync();

        // ── Scale ─────────────────────────────────────────────────────────────
        Task<int> GetScaleMaxNoAsync(string site);
        Task SaveScaleAsync(ScaleRequestDto dto, string site);
        Task<ScaleResponseDto?> GetScaleAsync(int scaleId, string site);
        Task<List<ScaleResponseDto>> GetScaleListAsync(string site);
        Task<bool> DeleteScaleAsync(int scaleId, string site);

        // ── Category ──────────────────────────────────────────────────────────
        Task<int> GetCategoryMaxNoAsync(string site);
        Task SaveCategoryAsync(CategoryRequestDto dto, string site, string? userId = null);
        Task<CategoryResponseDto?> GetCategoryAsync(int categoryId, string site);
        Task<List<CategoryResponseDto>> GetCategoryListAsync(string site);
        Task<bool> DeleteCategoryAsync(int categoryId, string site);

        // ── Status ────────────────────────────────────────────────────────────
        Task<int> GetStatusMaxNoAsync(string site);
        Task SaveStatusAsync(StatusRequestDto dto, string site, string? userId = null);
        Task<StatusResponseDto?> GetStatusAsync(int statusId, string site);
        Task<List<StatusResponseDto>> GetStatusListAsync(string site);
        Task<bool> DeleteStatusAsync(int statusId, string site);
    }

    // ── Salary Increment Response (used in interface) ─────────────────────────
    public class HrmVewSalaryIncrementDto
    {
        public int EmpCardNo { get; set; }
        public string? EmpName { get; set; }
        public DateTime? IncrementDate { get; set; }
        public decimal? Increment { get; set; }
        public decimal? OldBasicPay { get; set; }
        public decimal? CurrentBasicPay { get; set; }
        public decimal? OldGrossPay { get; set; }
        public decimal? CurrentGrossPay { get; set; }
        public string? Site { get; set; }
    }
}
