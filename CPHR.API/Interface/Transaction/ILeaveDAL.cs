using SaftHR.API.DTO.Transaction;
using SaftHR.API.Models;

namespace SaftHR.API.Interface.Transaction
{
    public interface ILeaveDAL
    {
        // ── Leave Application (Master/Child/Register) ─────────────────────────
        Task<List<HrmLeaveType>> GetLeaveTypesAsync();
        Task<int> ApplicationMaxNOAsync(string site);
        Task SaveLeaveMasterAsync(LeaveRequestDto dto, string site, string userId);
        Task DeleteLeaveChildAsync(int applicationNo, string site);
        Task SaveLeaveChildAsync(LeaveRequestDto dto, string site);
        Task<bool> DeleteLeaveRegisterAsync(int applicationNo, string site);
        Task SaveLeaveRegisterAsync(LeaveRequestDto dto, string site, string userId);
        Task<LeaveResponseDto?> EditLeaveMasterAsync(int applicationNo, string site);
        Task<List<HrmVewLeaf>> EditLeaveChildAsync(int applicationNo, string site);
        Task<bool> DeleteLeaveRecordAsync(int applicationNo, string site);
        Task<LeaveResponseDto?> CheckLeaveAsync(DateTime attendanceDate, int empcard, string site);
        Task<LeaveResponseDto?> CheckLeaveAsync(DateTime fromDate, DateTime toDate, string leaveType, int empcard, string site);
        Task<List<object>> GetRecentLeavesAsync(string site, int count);
        
        // ── Balances ──────────────────────────────────────────────────────────
        Task<decimal> GetALbalanceAsync(int cardno);
        Task<decimal> GetCLbalanceAsync(int cardno);
        Task<decimal> GetSLbalanceAsync(int cardno);
        Task<decimal> GetCPLbalanceAsync(int cardno);
        Task<decimal> CheckAvailedLeaveAsync(DateTime fromDate, DateTime toDate, int empcard, string site);

        // ── Leave Adjustments ─────────────────────────────────────────────────
        Task<LeaveAdjustmentDto?> GetLeaveAdjustmentAsync(int empcard, int leavemonth, int leaveyear, string site);
        Task<bool> UpdateLeaveAdjustmentAsync(LeaveAdjustmentDto dto, string site, string userId);

        // ── Gazetted Leaves ───────────────────────────────────────────────────
        Task<int> GazettedLeaveMaxNOAsync(string site);
        Task SaveGazettedLeaveAsync(GazettedLeaveDto dto, string site, string userId);
        Task<GazettedLeaveDto?> EditGazettedLeaveAsync(int srno, string site);
        Task<List<GazettedLeaveDto>> GetGazettedLeavesListAsync(string site);
        Task<bool> CheckGazettedLeaveAsync(DateTime leavedate, string site);
        Task<string?> CheckGazettedLeaveNameAsync(DateTime leavedate, string site);

        // ── Leave Application Form (HRM_LeaveApplication) ─────────────────────
        Task<int> GetLeaveApplicationMaxNoAsync(string site);
        Task SaveLeaveApplicationAsync(LeaveApplicationDto dto, string site, string userId);
        Task<LeaveApplicationDto?> EditLeaveApplicationAsync(int transNo, string site);

        // ── Short Leave ───────────────────────────────────────────────────────
        Task<int> GetShortLeaveMaxNoAsync(string site);
        Task SaveShortLeaveAsync(ShortLeaveDto dto, string site, string userId);
        Task<ShortLeaveDto?> EditShortLeaveAsync(int transNo, string site);

        // ── Leave Deductions ──────────────────────────────────────────────────
        Task<int> LeaveDeductionsMaxNoAsync(string site);
        Task SaveLeaveDeductionsMasterAsync(LeaveDeductionMasterDto dto, string site, string userId);
        Task SaveLeaveDeductionsChildAsync(LeaveDeductionChildDto dto, string site);
        Task<LeaveDeductionMasterDto?> GetLeaveDeductionsMasterInfoAsync(int transactionNo, string site);
        Task<List<HrmVewLeaveDeduciton>> GetLeaveDeductionsChildInfoAsync(int transactionNo, string site);
        Task DeleteLeaveDeductionsChildAsync(int transactionNo, string site);
        Task<decimal> GetLeaveDeductionsInfoAsync(int empCardNo, DateTime clearanceDate, string site);
    }
}
