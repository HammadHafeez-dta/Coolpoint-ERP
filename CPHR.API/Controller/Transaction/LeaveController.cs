using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/hr/transaction/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveDAL _dal;
        private readonly SaftHR.API.Services.LeaveReportService _reportService;

        public LeaveController(ILeaveDAL dal, SaftHR.API.Services.LeaveReportService reportService)
        {
            _dal = dal;
            _reportService = reportService;
        }

        private string ResolveSite(string? querySite = null)
        {
            var claimSite = User.FindFirst("Site")?.Value;
            return !string.IsNullOrWhiteSpace(claimSite) ? claimSite
                 : !string.IsNullOrWhiteSpace(querySite) ? querySite
                 : "SAFT";
        }

        private string ResolveUser()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? "SYSTEM";
        }

        // ── Leave Application (Master/Child/Register) ─────────────────────────

        [HttpGet("types")]
        public async Task<IActionResult> GetLeaveTypes()
        {
            var result = await _dal.GetLeaveTypesAsync();
            return Ok(result);
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentLeaves([FromQuery] string? site = null, [FromQuery] int count = 50)
        {
            var result = await _dal.GetRecentLeavesAsync(ResolveSite(site), count);
            return Ok(result);
        }

        [HttpGet("application/maxno")]
        public async Task<IActionResult> ApplicationMaxNO([FromQuery] string? site = null)
        {
            var result = await _dal.ApplicationMaxNOAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("master")]
        public async Task<IActionResult> SaveLeaveMaster([FromBody] LeaveRequestDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLeaveMasterAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpPost("child")]
        public async Task<IActionResult> SaveLeaveChild([FromBody] LeaveRequestDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveLeaveChildAsync(dto, ResolveSite(site));
            return Ok();
        }

        [HttpDelete("child/{applicationNo}")]
        public async Task<IActionResult> DeleteLeaveChild(int applicationNo, [FromQuery] string? site = null)
        {
            await _dal.DeleteLeaveChildAsync(applicationNo, ResolveSite(site));
            return Ok();
        }

        [HttpPost("register")]
        public async Task<IActionResult> SaveLeaveRegister([FromBody] LeaveRequestDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLeaveRegisterAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpDelete("register/{applicationNo}")]
        public async Task<IActionResult> DeleteLeaveRegister(int applicationNo, [FromQuery] string? site = null)
        {
            var success = await _dal.DeleteLeaveRegisterAsync(applicationNo, ResolveSite(site));
            return success ? Ok() : BadRequest();
        }

        [HttpGet("master/{applicationNo}")]
        public async Task<IActionResult> EditLeaveMaster(int applicationNo, [FromQuery] string? site = null)
        {
            var result = await _dal.EditLeaveMasterAsync(applicationNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("child/{applicationNo}")]
        public async Task<IActionResult> EditLeaveChild(int applicationNo, [FromQuery] string? site = null)
        {
            var result = await _dal.EditLeaveChildAsync(applicationNo, ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("record/{applicationNo}")]
        public async Task<IActionResult> DeleteLeaveRecord(int applicationNo, [FromQuery] string? site = null)
        {
            var success = await _dal.DeleteLeaveRecordAsync(applicationNo, ResolveSite(site));
            return success ? Ok() : BadRequest();
        }

        [HttpGet("check")]
        public async Task<IActionResult> CheckLeave([FromQuery] DateTime attendanceDate, [FromQuery] int empcard, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckLeaveAsync(attendanceDate, empcard, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("check/range")]
        public async Task<IActionResult> CheckLeaveRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] string leaveType, [FromQuery] int empcard, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckLeaveAsync(fromDate, toDate, leaveType, empcard, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ── Balances ──────────────────────────────────────────────────────────

        [HttpGet("balance/al/{empcard}")]
        public async Task<IActionResult> GetALbalance(int empcard)
        {
            var balance = await _dal.GetALbalanceAsync(empcard);
            return Ok(balance);
        }

        [HttpGet("balance/cl/{empcard}")]
        public async Task<IActionResult> GetCLbalance(int empcard)
        {
            var balance = await _dal.GetCLbalanceAsync(empcard);
            return Ok(balance);
        }

        [HttpGet("balance/sl/{empcard}")]
        public async Task<IActionResult> GetSLbalance(int empcard)
        {
            var balance = await _dal.GetSLbalanceAsync(empcard);
            return Ok(balance);
        }

        [HttpGet("balance/cpl/{empcard}")]
        public async Task<IActionResult> GetCPLbalance(int empcard)
        {
            var balance = await _dal.GetCPLbalanceAsync(empcard);
            return Ok(balance);
        }

        [HttpGet("availed")]
        public async Task<IActionResult> CheckAvailedLeave([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int empcard, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckAvailedLeaveAsync(fromDate, toDate, empcard, ResolveSite(site));
            return Ok(result);
        }

        // ── Leave Adjustments ─────────────────────────────────────────────────

        [HttpGet("adjustment")]
        public async Task<IActionResult> GetLeaveAdjustment([FromQuery] int empcard, [FromQuery] int leavemonth, [FromQuery] int leaveyear, [FromQuery] string? site = null)
        {
            var result = await _dal.GetLeaveAdjustmentAsync(empcard, leavemonth, leaveyear, ResolveSite(site));
            if (result == null)
            {
                return Ok(new LeaveAdjustmentDto
                {
                    EmpCardNo = empcard,
                    LeaveDate = new DateTime(leaveyear, leavemonth, 1),
                    ALOpen = 0,
                    CLOpen = 0,
                    SLOpen = 0,
                    CPLOpen = 0
                });
            }
            return Ok(result);
        }

        [HttpPut("adjustment")]
        public async Task<IActionResult> UpdateLeaveAdjustment([FromBody] LeaveAdjustmentDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            var success = await _dal.UpdateLeaveAdjustmentAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return success ? Ok() : BadRequest();
        }

        // ── Gazetted Leaves ───────────────────────────────────────────────────

        [HttpGet("gazetted/maxno")]
        public async Task<IActionResult> GazettedLeaveMaxNO([FromQuery] string? site = null)
        {
            var max = await _dal.GazettedLeaveMaxNOAsync(ResolveSite(site));
            return Ok(max);
        }

        [HttpPost("gazetted")]
        public async Task<IActionResult> SaveGazettedLeave([FromBody] GazettedLeaveDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveGazettedLeaveAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpGet("gazetted/{srno}")]
        public async Task<IActionResult> EditGazettedLeave(int srno, [FromQuery] string? site = null)
        {
            var result = await _dal.EditGazettedLeaveAsync(srno, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("gazetted/list")]
        public async Task<IActionResult> GetGazettedLeavesList([FromQuery] string? site = null)
        {
            var result = await _dal.GetGazettedLeavesListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("gazetted/check")]
        public async Task<IActionResult> CheckGazettedLeave([FromQuery] DateTime leavedate, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckGazettedLeaveAsync(leavedate, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("gazetted/checkname")]
        public async Task<IActionResult> CheckGazettedLeaveName([FromQuery] DateTime leavedate, [FromQuery] string? site = null)
        {
            var name = await _dal.CheckGazettedLeaveNameAsync(leavedate, ResolveSite(site));
            if (name == null) return NotFound();
            return Ok(name);
        }

        // ── Leave Application Form (HRM_LeaveApplication) ─────────────────────

        [HttpGet("form/maxno")]
        public async Task<IActionResult> GetLeaveApplicationMaxNo([FromQuery] string? site = null)
        {
            var max = await _dal.GetLeaveApplicationMaxNoAsync(ResolveSite(site));
            return Ok(max);
        }

        [HttpPost("form")]
        public async Task<IActionResult> SaveLeaveApplication([FromBody] LeaveApplicationDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLeaveApplicationAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpGet("form/{transNo}")]
        public async Task<IActionResult> EditLeaveApplication(int transNo, [FromQuery] string? site = null)
        {
            var result = await _dal.EditLeaveApplicationAsync(transNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ── Short Leave ───────────────────────────────────────────────────────

        [HttpGet("short/maxno")]
        public async Task<IActionResult> GetShortLeaveMaxNo([FromQuery] string? site = null)
        {
            var max = await _dal.GetShortLeaveMaxNoAsync(ResolveSite(site));
            return Ok(max);
        }

        [HttpPost("short")]
        public async Task<IActionResult> SaveShortLeave([FromBody] ShortLeaveDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveShortLeaveAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpGet("short/{transNo}")]
        public async Task<IActionResult> EditShortLeave(int transNo, [FromQuery] string? site = null)
        {
            var result = await _dal.EditShortLeaveAsync(transNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ── Leave Deductions ──────────────────────────────────────────────────

        [HttpGet("deductions/maxno")]
        public async Task<IActionResult> LeaveDeductionsMaxNo([FromQuery] string? site = null)
        {
            var max = await _dal.LeaveDeductionsMaxNoAsync(ResolveSite(site));
            return Ok(max);
        }

        [HttpPost("deductions/master")]
        public async Task<IActionResult> SaveLeaveDeductionsMaster([FromBody] LeaveDeductionMasterDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLeaveDeductionsMasterAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpPost("deductions/child")]
        public async Task<IActionResult> SaveLeaveDeductionsChild([FromBody] LeaveDeductionChildDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveLeaveDeductionsChildAsync(dto, ResolveSite(site));
            return Ok();
        }

        [HttpGet("deductions/master/{transactionNo}")]
        public async Task<IActionResult> GetLeaveDeductionsMasterInfo(int transactionNo, [FromQuery] string? site = null)
        {
            var result = await _dal.GetLeaveDeductionsMasterInfoAsync(transactionNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("deductions/child/{transactionNo}")]
        public async Task<IActionResult> GetLeaveDeductionsChildInfo(int transactionNo, [FromQuery] string? site = null)
        {
            var result = await _dal.GetLeaveDeductionsChildInfoAsync(transactionNo, ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("deductions/child/{transactionNo}")]
        public async Task<IActionResult> DeleteLeaveDeductionsChild(int transactionNo, [FromQuery] string? site = null)
        {
            await _dal.DeleteLeaveDeductionsChildAsync(transactionNo, ResolveSite(site));
            return Ok();
        }

        [HttpGet("deductions/info")]
        public async Task<IActionResult> GetLeaveDeductionsInfo([FromQuery] int empCardNo, [FromQuery] DateTime clearanceDate, [FromQuery] string? site = null)
        {
            var info = await _dal.GetLeaveDeductionsInfoAsync(empCardNo, clearanceDate, ResolveSite(site));
            return Ok(info);
        }

        // ── Leave PDF Reports ────────────────────────────────────────────────
        [HttpGet("report/application")]
        public async Task<IActionResult> GetLeaveApplicationReport([FromQuery] int empCardNo, [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateLeaveApplicationReportAsync(empCardNo, ResolveSite(site));
                return File(pdfBytes, "application/pdf", $"Leave_Application_{empCardNo}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/ledger")]
        public async Task<IActionResult> GetLeaveLedgerReport([FromQuery] int empCardNo, [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateLeaveLedgerReportAsync(empCardNo, ResolveSite(site));
                return File(pdfBytes, "application/pdf", $"Leave_Ledger_{empCardNo}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/register")]
        public async Task<IActionResult> GetLeaveRegisterReport(
            [FromQuery] string fromDate,
            [FromQuery] string toDate,
            [FromQuery] int? empCardNo = null,
            [FromQuery] int? deptCode = null,
            [FromQuery] int? desigCode = null,
            [FromQuery] string? site = null)
        {
            try
            {
                if (!DateTime.TryParse(fromDate, out var start) || !DateTime.TryParse(toDate, out var end))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD.");
                }
                var pdfBytes = await _reportService.GenerateLeaveRegisterReportAsync(ResolveSite(site), start, end, empCardNo, deptCode, desigCode);
                return File(pdfBytes, "application/pdf", $"Leave_Register_{fromDate}_{toDate}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
