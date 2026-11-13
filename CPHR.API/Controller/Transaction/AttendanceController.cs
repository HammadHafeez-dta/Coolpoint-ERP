using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/hr/transaction/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceDAL _dal;
        private readonly SaftHR.API.Services.AttendanceReportService _reportService;

        public AttendanceController(IAttendanceDAL dal, SaftHR.API.Services.AttendanceReportService reportService)
        {
            _dal = dal;
            _reportService = reportService;
        }

        // ── Daily Attendance ──────────────────────────────────────────────────

        [HttpPost("daily")]
        public async Task<IActionResult> SaveDailyAttendance([FromBody] AttendanceDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            var result = await _dal.SaveDailyAttendanceAsync(dto, site, userId);
            return Ok(result);
        }

        [HttpGet("daily/inout")]
        public async Task<IActionResult> GetDailyInOut([FromQuery] DateTime attendate)
        {
            var result = await _dal.GetDailyInOutAsync(attendate);
            return Ok(result);
        }

        [HttpGet("daily/inout/{empcard}")]
        public async Task<IActionResult> GetDailyInOut(DateTime attendate, int empcard)
        {
            var result = await _dal.GetDailyInOutAsync(attendate, empcard);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("daily/check")]
        public async Task<IActionResult> CheckEmployeeDailyAttendance([FromQuery] DateTime attendate, [FromQuery] int empcard)
        {
            var result = await _dal.CheckEmployeeDailyAttendanceAsync(attendate, empcard);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ── Machine Attendance ────────────────────────────────────────────────

        [HttpGet("machine")]
        public async Task<IActionResult> GetEmployeeAttendanceMachine([FromQuery] DateTime attendate, [FromQuery] int empcard)
        {
            var result = await _dal.GetEmployeeAttendanceMachineAsync(attendate, empcard);
            return Ok(result);
        }

        [HttpDelete("machine")]
        public async Task<IActionResult> DeleteAttendance([FromBody] AttendanceDto dto)
        {
            var success = await _dal.DeleteAttendanceAsync(dto);
            return success ? Ok() : BadRequest();
        }

        [HttpGet("machine/checkin")]
        public async Task<IActionResult> CheckEmployeeIN([FromQuery] DateTime attendate, [FromQuery] int empcard)
        {
            var result = await _dal.CheckEmployeeINAsync(attendate, empcard);
            return Ok(result);
        }

        [HttpPost("machine/manualin")]
        public async Task<IActionResult> UpdateManualAttendanceIN([FromBody] AttendanceDto dto)
        {
            var result = await _dal.UpdateManualAttendanceINAsync(dto);
            return Ok(result);
        }

        [HttpPost("machine/manualout")]
        public async Task<IActionResult> UpdateManualAttendanceOUT([FromBody] AttendanceDto dto)
        {
            var result = await _dal.UpdateManualAttendanceOUTAsync(dto);
            return Ok(result);
        }

        [HttpPost("machine/lateearlyreason")]
        public async Task<IActionResult> UpdateLateEarlyReason([FromBody] AttendanceDto dto)
        {
            await _dal.UpdateLateEarlyReasonAsync(dto);
            return Ok();
        }

        // ── Late / Early ──────────────────────────────────────────────────────

        [HttpGet("lateearly")]
        public async Task<IActionResult> GetEmployeeAttendanceLateEarly([FromQuery] DateTime attendate)
        {
            var result = await _dal.GetEmployeeAttendanceLateEarlyAsync(attendate);
            return Ok(result);
        }

        [HttpGet("workinghours")]
        public async Task<IActionResult> GetEmployeeWorkingHours([FromQuery] DateTime attendate, [FromQuery] int empcard)
        {
            var result = await _dal.GetEmployeeWorkingHoursAsync(attendate, empcard);
            return Ok(result);
        }

        // ── Absentees ─────────────────────────────────────────────────────────

        [HttpDelete("absentees")]
        public async Task<IActionResult> DeleteAbsentees()
        {
            await _dal.DeleteAbsenteesAsync();
            return Ok();
        }

        [HttpPost("absentees")]
        public async Task<IActionResult> SaveAbsentees([FromBody] AttendanceDto dto)
        {
            var result = await _dal.SaveAbsenteesAsync(dto);
            return Ok(result);
        }

        // ── Time Card ─────────────────────────────────────────────────────────

        [HttpDelete("timecard")]
        public async Task<IActionResult> DeleteTimeCard()
        {
            await _dal.DeleteTimeCardAsync();
            return Ok();
        }

        [HttpPost("timecard")]
        public async Task<IActionResult> SaveTimeCard([FromBody] AttendanceDto dto)
        {
            var result = await _dal.SaveTimeCardAsync(dto);
            return Ok(result);
        }

        // ── Attendance Register ───────────────────────────────────────────────

        [HttpGet("register")]
        public async Task<IActionResult> GetEmployeeAttendance([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int empcard, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetEmployeeAttendanceAsync(fromDate, toDate, empcard, ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> SaveAttendanceRegister([FromBody] AttendanceDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.SaveAttendanceRegisterAsync(dto, site, userId);
            return Ok();
        }

        [HttpPut("register")]
        public async Task<IActionResult> UpdateAttendanceRegister([FromBody] AttendanceDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.UpdateAttendanceRegisterAsync(dto, ResolveSite(site), userId);
            return Ok();
        }

        // ── Vew Daily Attendance ──────────────────────────────────────────────

        [HttpGet("list")]
        public async Task<IActionResult> GetEmployeeAttendanceList([FromQuery] DateTime attendate, [FromQuery] int empcard)
        {
            var result = await _dal.GetEmployeeAttendanceListAsync(attendate, empcard);
            return Ok(result);
        }

        // ── Mass Deletions ────────────────────────────────────────────────────

        [HttpDelete("tempdailyattenall")]
        public async Task<IActionResult> DeleteFromTempDailyAttenAll()
        {
            await _dal.DeleteFromTempDailyAttenAllAsync();
            return Ok();
        }

        [HttpDelete("mass/machine")]
        public async Task<IActionResult> DeleteFromMachineAttendance([FromQuery] int empCardNo, [FromQuery] bool cardWise, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteFromMachineAttendanceAsync(empCardNo, cardWise, fromDate, toDate, ResolveSite(site));
            return Ok();
        }

        [HttpDelete("mass/daily")]
        public async Task<IActionResult> DeleteFromDailyAttendance([FromQuery] int empCardNo, [FromQuery] bool cardWise, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteFromDailyAttendanceAsync(empCardNo, cardWise, fromDate, toDate, ResolveSite(site));
            return Ok();
        }

        [HttpDelete("mass/register")]
        public async Task<IActionResult> DeleteFromAttendanceRegister([FromQuery] int empCardNo, [FromQuery] bool cardWise, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteFromAttendanceRegisterAsync(empCardNo, cardWise, fromDate, toDate, ResolveSite(site));
            return Ok();
        }

        [HttpPost("machine/bulk")]
        public async Task<IActionResult> BulkUpdateMachineAttendance([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int? empCardNo, [FromQuery] bool cardWise = false, [FromQuery] string? site = null)
        {
            var result = await _dal.UpdateMachineAttendanceAsync(fromDate, toDate, empCardNo, cardWise, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("daily-report")]
        public async Task<IActionResult> GetDailyAttendanceReportPrincipal([FromQuery] DateTime date, [FromQuery] string? search, [FromQuery] string? site = null)
        {
            var result = await _dal.GetDailyAttendanceReportAsync(date, search, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("history-report")]
        public async Task<IActionResult> GetAttendanceHistoryReportPrincipal([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] string? search, [FromQuery] string? site = null)
        {
            var result = await _dal.GetAttendanceHistoryReportAsync(fromDate, toDate, search, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("report/daily")]
        public async Task<IActionResult> GetDailyAttendanceReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string? status = null,
            [FromQuery] string? deptCode = null,
            [FromQuery] int? desigCode = null,
            [FromQuery] bool? isManual = null,
            [FromQuery] int? empCardNo = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateDailyAttendanceReportAsync(ResolveSite(site), fromDate, toDate, status, deptCode, desigCode, isManual, empCardNo);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/machine")]
        public async Task<IActionResult> GetMachineAttendanceReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int? empCardNo = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateMachineAttendanceReportAsync(ResolveSite(site), fromDate, toDate, empCardNo);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/register")]
        public async Task<IActionResult> GetAttendanceRegisterReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int? empCardNo = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateAttendanceRegisterReportAsync(ResolveSite(site), fromDate, toDate, empCardNo);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/overtime")]
        public async Task<IActionResult> GetOvertimeReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int? empCardNo = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateOvertimeReportAsync(ResolveSite(site), fromDate, toDate, empCardNo);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/time-card")]
        public async Task<IActionResult> GetEmployeeTimeCardReport(
            [FromQuery] int empCardNo,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateEmployeeTimeCardReportAsync(ResolveSite(site), empCardNo, fromDate, toDate);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/short-late-detail")]
        public async Task<IActionResult> GetShortLeaveLateDetailReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateAttendanceShortLeaveLateDetailReportAsync(ResolveSite(site), fromDate, toDate, category);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/leave-absent-detail")]
        public async Task<IActionResult> GetLeaveAbsentDetailReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateAttendanceLeaveAbsentDetailReportAsync(ResolveSite(site), fromDate, toDate, category);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/summary-options")]
        public async Task<IActionResult> GetAttendanceSummaryWithOptionsReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string displayType,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateAttendanceSummaryWithOptionsReportAsync(ResolveSite(site), fromDate, toDate, category, displayType);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/duty-timing")]
        public async Task<IActionResult> GetDutyTimingReport(
            [FromQuery] string reportType = "all",
            [FromQuery] int? employeeCardNo = null,
            [FromQuery] int? departmentCode = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string? site = null)
        {
            var resolvedSite = ResolveSite(site);
            var normalizedType = (reportType ?? "all").Trim().ToLowerInvariant();

            // Normalize/swap inverted dates so backend never crashes
            if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
            {
                (fromDate, toDate) = (toDate, fromDate);
            }

            if (normalizedType == "employee" && (!employeeCardNo.HasValue || employeeCardNo.Value <= 0))
            {
                return BadRequest(new { message = "Employee Card No is required when Report Type is Employee Wise." });
            }

            if (normalizedType == "department" && (!departmentCode.HasValue || departmentCode.Value <= 0))
            {
                return BadRequest(new { message = "Department is required when Report Type is Department Wise." });
            }

            try
            {
                var pdfBytes = await _reportService.GenerateDutyTimingReportAsync(
                    resolvedSite,
                    normalizedType,
                    employeeCardNo,
                    departmentCode,
                    fromDate,
                    toDate);

                Response.Headers["Content-Disposition"] = "inline; filename=\"EmployeeDutyTimingReport.pdf\"";
                return File(pdfBytes, "application/pdf");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private string ResolveSite(string? querySite = null)
        {
            var claimSite = User.FindFirst("Site")?.Value;
            return !string.IsNullOrWhiteSpace(claimSite) ? claimSite
                 : !string.IsNullOrWhiteSpace(querySite) ? querySite
                 : "SAFT";
        }
    }
}
