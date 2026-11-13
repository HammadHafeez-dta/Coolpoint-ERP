using SaftHR.API.DTO.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.Interface.Transaction
{
    public interface IAttendanceDAL
    {
        Task<int> SaveDailyAttendanceAsync(AttendanceDto dto, string site, string userId);
        Task<List<MachineAttendance>> GetEmployeeAttendanceMachineAsync(DateTime attendate, int empcard);
        Task<List<VewDailyAttendance>> GetEmployeeAttendanceLateEarlyAsync(DateTime attendate);
        Task DeleteAbsenteesAsync();
        Task<int> SaveAbsenteesAsync(AttendanceDto dto);
        Task DeleteTimeCardAsync();
        Task<int> SaveTimeCardAsync(AttendanceDto dto);
        Task<List<VewDailyAttendance>> GetEmployeeAttendanceListAsync(DateTime attndate, int empcard);
        Task<AttendanceDto?> CheckEmployeeDailyAttendanceAsync(DateTime attendate, int empcard);
        Task<bool> DeleteAttendanceAsync(AttendanceDto dto);
        Task DeleteFromTempDailyAttenAllAsync();
        Task DeleteFromMachineAttendanceAsync(int empCardNo, bool cardWise, DateTime fromDate, DateTime toDate, string site);
        Task DeleteFromDailyAttendanceAsync(int empCardNo, bool cardWise, DateTime fromDate, DateTime toDate, string site);
        Task DeleteFromAttendanceRegisterAsync(int empCardNo, bool cardWise, DateTime fromDate, DateTime toDate, string site);
        Task<bool> CheckEmployeeINAsync(DateTime attendate, int empcardno);
        Task<int> GetEmployeeWorkingHoursAsync(DateTime attendate, int empcardno);
        Task<int> UpdateManualAttendanceINAsync(AttendanceDto dto);
        Task<int> UpdateManualAttendanceOUTAsync(AttendanceDto dto);
        Task UpdateLateEarlyReasonAsync(AttendanceDto dto);
        Task<List<DailyAttendance>> GetDailyInOutAsync(DateTime attendate);
        Task<AttendanceDto?> GetDailyInOutAsync(DateTime attendate, int empcardno);
        Task SaveAttendanceRegisterAsync(AttendanceDto dto, string site, string userId);
        Task UpdateAttendanceRegisterAsync(AttendanceDto dto, string site, string userId);
        Task<List<AttendanceRegister>> GetEmployeeAttendanceAsync(DateTime fromDate, DateTime toDate, int empcard, string site);
        Task<bool> UpdateMachineAttendanceAsync(DateTime fromDate, DateTime toDate, int? empCardNo, bool cardWise, string site);
        Task<List<VewDailyAttendance>> GetDailyAttendanceReportAsync(DateTime date, string? search, string site);
        Task<List<VewAttendanceRegister>> GetAttendanceHistoryReportAsync(DateTime fromDate, DateTime toDate, string? search, string site);
    }
}
