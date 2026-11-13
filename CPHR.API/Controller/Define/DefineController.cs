using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Define;
using SaftHR.API.Interface.Define;

namespace SaftHR.API.Controller.Define
{
    [ApiController]
    [Route("api/hr/define")]
    [Authorize]
    public class DefineController : ControllerBase
    {
        private readonly IDefineDAL _dal;
        private readonly SaftHR.API.Services.EmployeeReportService _reportService;

        public DefineController(IDefineDAL dal, SaftHR.API.Services.EmployeeReportService reportService)
        {
            _dal = dal;
            _reportService = reportService;
        }

        /// <summary>
        /// Resolves the active site from the JWT "Site" claim.
        /// Falls back to the provided query-param value if the claim is absent.
        /// </summary>
        private string ResolveSite(string? querySite = null)
        {
            var claimSite = User.FindFirst("Site")?.Value;
            return !string.IsNullOrWhiteSpace(claimSite) ? claimSite
                 : !string.IsNullOrWhiteSpace(querySite)  ? querySite
                 : "SAFT";   // ultimate fallback
        }

        /// <summary>
        /// Returns the UserID from the JWT "sub" claim.
        /// </summary>
        private string ResolveUser()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? "SYSTEM";
        }

        // ══════════════════════════════════════════════════════════════════════
        // EMPLOYEE ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("employee/maxno")]
        public async Task<IActionResult> EmpMaxNo([FromQuery] string? site = null)
        {
            var result = await _dal.EmpMaxNoAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("employee/intime/{empCardNo}")]
        public async Task<IActionResult> EmpInTime(int empCardNo)
        {
            var result = await _dal.EmpInTimeAsync(empCardNo);
            return Ok(result);
        }

        [HttpPost("employee/save")]
        public async Task<IActionResult> SaveEmployee([FromBody] EmployeeRequestDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveEmployeeAsync(dto, ResolveSite(site), ResolveUser());
            return Ok(new { message = "Employee saved successfully." });
        }

        [HttpDelete("employee/{empCardNo:int}")]
        public async Task<IActionResult> DeleteEmployee(int empCardNo, [FromQuery] string? site = null)
        {
            var success = await _dal.DeleteEmployeeAsync(empCardNo, ResolveSite(site));
            if (!success)
                return BadRequest(new { message = "Failed to delete employee or employee not found." });
            return Ok(new { message = "Employee deleted successfully." });
        }

        [HttpGet("employee/{empId}")]
        public async Task<IActionResult> GetEmployeeInfo(int empId, [FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeInfoAsync(empId, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("employee/{empId}/lite")]
        public async Task<IActionResult> GetEmployeeInfoLittle(int empId, [FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeInfoLittleAsync(empId, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("employee/list")]
        public async Task<IActionResult> GetEmployeeList([FromQuery] EmployeeListRequestDto request, [FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeListAsync(request, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("employee/roster-report")]
        public async Task<IActionResult> GetStaffRosterReport([FromQuery] string? search, [FromQuery] string? category, [FromQuery] string? site = null)
        {
            var result = await _dal.GetStaffRosterReportAsync(search, category, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("employee/contract-expiry")]
        public async Task<IActionResult> GetContractExpiryAlerts([FromQuery] string? site = null)
        {
            var result = await _dal.GetContractExpiryAlertsAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("employee/count")]
        public async Task<IActionResult> GetEmployeeNos([FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeNosAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPut("employee/struckoff")]
        public async Task<IActionResult> UpdateEmployeeStruckOff([FromBody] EmployeeStruckOffDto dto, [FromQuery] string? site = null)
        {
            var result = await _dal.UpdateEmployeeStruckOffAsync(dto, ResolveSite(site));
            if (!result) return NotFound();
            return Ok(new { message = "Employee struck off status updated." });
        }

        [HttpPut("employee/timings")]
        public async Task<IActionResult> UpdateEmployeeTimings([FromBody] EmployeeTimingsDto dto, [FromQuery] string? site = null)
        {
            await _dal.UpdateEmployeeTimingsAsync(dto, ResolveSite(site));
            return Ok(new { message = "Employee timings updated." });
        }

        [HttpPut("employee/restday")]
        public async Task<IActionResult> UpdateEmployeeRestDay([FromBody] EmployeeRestDayDto dto, [FromQuery] string? site = null)
        {
            await _dal.UpdateEmployeeRestDayAsync(dto, ResolveSite(site));
            return Ok(new { message = "Employee rest day updated." });
        }

        [HttpPut("employee/salary-block")]
        public async Task<IActionResult> UpdateEmployeeSalaryBlocked([FromBody] EmployeeSalaryBlockDto dto)
        {
            await _dal.UpdateEmployeeSalaryBlockedAsync(dto, ResolveUser());
            return Ok(new { message = "Employee salary block status updated." });
        }

        // ── Salary ────────────────────────────────────────────────────────────

        [HttpPost("employee/salary/save")]
        public async Task<IActionResult> SaveEmployeeSalary([FromBody] EmployeeSalaryDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveEmployeeSalaryAsync(dto, ResolveSite(site), ResolveUser());
            return Ok(new { message = "Employee salary saved." });
        }

        [HttpGet("employee/{empId}/salary")]
        public async Task<IActionResult> GetEmployeeSalaryInfo(int empId, [FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeSalaryInfoAsync(empId, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("employee/salary/update")]
        public async Task<IActionResult> UpdateEmployeeSalary([FromBody] EmployeeSalaryDto dto, [FromQuery] string? site = null)
        {
            await _dal.UpdateEmployeeSalaryAsync(dto, ResolveSite(site));
            return Ok(new { message = "Employee salary updated." });
        }

        // ── Salary Increment ──────────────────────────────────────────────────

        [HttpPost("employee/salary-increment/save")]
        public async Task<IActionResult> SaveSalaryIncrement([FromBody] EmployeeSalaryIncrementDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveEmployeeSalaryIncrementAsync(dto, ResolveSite(site), ResolveUser());
            return Ok(new { message = "Salary increment saved." });
        }

        [HttpGet("employee/salary-increment")]
        public async Task<IActionResult> GetSalaryIncrements([FromQuery] DateTime incrementDate, [FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeSalaryIncrementAsync(incrementDate, ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("employee/salary-increment")]
        public async Task<IActionResult> DeleteSalaryIncrement([FromQuery] DateTime incrementDate)
        {
            var result = await _dal.DeleteEmployeeSalaryIncrementAsync(incrementDate);
            return Ok(new { success = result });
        }

        // ── Opening Balances ──────────────────────────────────────────────────

        [HttpGet("employee/{empId}/opening-balances")]
        public async Task<IActionResult> GetOpeningBalances(int empId, [FromQuery] string? site = null)
        {
            var result = await _dal.GetEmployeeOpeningBalancesAsync(empId, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("employee/opening-balances/save")]
        public async Task<IActionResult> SaveOpeningBalances([FromBody] EmployeeOpeningBalancesDto dto, [FromQuery] string? site = null)
        {
            var result = await _dal.SaveEmployeeOpeningBalancesAsync(dto, ResolveSite(site), ResolveUser());
            return Ok(new { success = result });
        }

        [HttpGet("employee/{empId}/pf-opening")]
        public async Task<IActionResult> GetPFundOpening(int empId, [FromQuery] string? site = null)
        {
            var result = await _dal.GetPFundOpeningAsync(empId, ResolveSite(site));
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // DEPARTMENT ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("department/maxno")]
        public async Task<IActionResult> GetDepartmentMaxNo([FromQuery] string? site = null)
        {
            var result = await _dal.GetDepartmentMaxNoAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("department/save")]
        public async Task<IActionResult> SaveDepartment([FromBody] DepartmentRequestDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveDepartmentAsync(dto, ResolveSite(site));
            return Ok(new { message = "Department saved." });
        }

        [HttpGet("department/{id}")]
        public async Task<IActionResult> GetDepartment(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.GetDepartmentAsync(id, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("department/list")]
        public async Task<IActionResult> GetDepartmentList([FromQuery] string? site = null)
        {
            var result = await _dal.GetDepartmentListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("department/{id}")]
        public async Task<IActionResult> DeleteDepartment(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.DeleteDepartmentAsync(id, ResolveSite(site));
            return Ok(new { success = result });
        }

        // ══════════════════════════════════════════════════════════════════════
        // DESIGNATION ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("designation/maxno")]
        public async Task<IActionResult> GetDesignationMaxNo([FromQuery] string? site = null)
        {
            var result = await _dal.GetDesignationMaxNoAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("designation/save")]
        public async Task<IActionResult> SaveDesignation([FromBody] DesignationRequestDto dto, [FromQuery] string? site = null)
        {
            var id = await _dal.SaveDesignationAsync(dto, ResolveSite(site));
            return Ok(new { message = "Designation saved.", id });
        }

        [HttpGet("designation/{id}")]
        public async Task<IActionResult> GetDesignation(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.GetDesignationAsync(id, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("designation/list")]
        public async Task<IActionResult> GetDesignationList([FromQuery] string? site = null)
        {
            var result = await _dal.GetDesignationListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("designation/{id}")]
        public async Task<IActionResult> DeleteDesignation(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.DeleteDesignationAsync(id, ResolveSite(site));
            return Ok(new { success = result });
        }

        // ══════════════════════════════════════════════════════════════════════
        // LOCATION ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("location/maxno")]
        public async Task<IActionResult> GetLocationMaxNo()
        {
            var result = await _dal.GetLocationMaxNoAsync();
            return Ok(result);
        }

        [HttpPost("location/save")]
        public async Task<IActionResult> SaveLocation([FromBody] LocationRequestDto dto)
        {
            await _dal.SaveLocationAsync(dto);
            return Ok(new { message = "Location saved." });
        }

        [HttpGet("location/{id}")]
        public async Task<IActionResult> GetLocation(int id)
        {
            var result = await _dal.GetLocationAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("location/list")]
        public async Task<IActionResult> GetLocationsList()
        {
            var result = await _dal.GetLocationsListAsync();
            return Ok(result);
        }

        /// <summary>Gets the salary units used by employee records.</summary>
        [HttpGet("unit/list")]
        [ProducesResponseType(typeof(List<SalaryUnitResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<SalaryUnitResponseDto>>> GetSalaryUnitsList(
            CancellationToken cancellationToken)
        {
            var result = await _dal.GetSalaryUnitsListAsync(cancellationToken);
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // GRADE ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("grade/maxno")]
        public async Task<IActionResult> GetGradeMaxNo()
        {
            var result = await _dal.GetGradeMaxNoAsync();
            return Ok(result);
        }

        [HttpPost("grade/save")]
        public async Task<IActionResult> SaveGrade([FromBody] GradeRequestDto dto)
        {
            await _dal.SaveGradeAsync(dto);
            return Ok(new { message = "Grade saved." });
        }

        [HttpGet("grade/{id}")]
        public async Task<IActionResult> GetGrade(int id)
        {
            var result = await _dal.GetGradeAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("grade/list")]
        public async Task<IActionResult> GetGradesList()
        {
            var result = await _dal.GetGradesListAsync();
            return Ok(result);
        }

        [HttpDelete("grade/{id}")]
        public async Task<IActionResult> DeleteGrade(int id)
        {
            var result = await _dal.DeleteGradeAsync(id);
            return Ok(new { success = result });
        }

        // ══════════════════════════════════════════════════════════════════════
        // SHIFT ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("shift/maxno")]
        public async Task<IActionResult> GetShiftMaxNo()
        {
            var result = await _dal.GetShiftMaxNoAsync();
            return Ok(result);
        }

        [HttpPost("shift/save")]
        public async Task<IActionResult> SaveShift([FromBody] ShiftRequestDto dto)
        {
            await _dal.SaveShiftAsync(dto);
            return Ok(new { message = "Shift saved." });
        }

        [HttpGet("shift/{id}")]
        public async Task<IActionResult> GetShift(int id)
        {
            var result = await _dal.GetShiftAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("shift/list")]
        public async Task<IActionResult> GetShiftsList()
        {
            var result = await _dal.GetShiftsListAsync();
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // BANK ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("bank/maxno")]
        public async Task<IActionResult> GetBankMaxNo()
        {
            var result = await _dal.GetBankMaxNoAsync();
            return Ok(result);
        }

        [HttpPost("bank/save")]
        public async Task<IActionResult> SaveBank([FromBody] BankRequestDto dto)
        {
            await _dal.SaveBankAsync(dto);
            return Ok(new { message = "Bank saved." });
        }

        [HttpGet("bank/{id}")]
        public async Task<IActionResult> GetBank(int id)
        {
            var result = await _dal.GetBankAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("bank/list")]
        public async Task<IActionResult> GetBanksList()
        {
            var result = await _dal.GetBanksListAsync();
            return Ok(result);
        }

        // ══════════════════════════════════════════════════════════════════════
        // SCALE ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("scale/maxno")]
        public async Task<IActionResult> GetScaleMaxNo([FromQuery] string? site = null)
        {
            var result = await _dal.GetScaleMaxNoAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("scale/save")]
        public async Task<IActionResult> SaveScale([FromBody] ScaleRequestDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveScaleAsync(dto, ResolveSite(site));
            return Ok(new { message = "Scale saved." });
        }

        [HttpGet("scale/{id}")]
        public async Task<IActionResult> GetScale(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.GetScaleAsync(id, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("scale/list")]
        public async Task<IActionResult> GetScaleList([FromQuery] string? site = null)
        {
            var result = await _dal.GetScaleListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("scale/{id}")]
        public async Task<IActionResult> DeleteScale(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.DeleteScaleAsync(id, ResolveSite(site));
            return Ok(new { success = result });
        }

        // ══════════════════════════════════════════════════════════════════════
        // CATEGORY ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("category/maxno")]
        public async Task<IActionResult> GetCategoryMaxNo([FromQuery] string? site = null)
        {
            var result = await _dal.GetCategoryMaxNoAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("category/save")]
        public async Task<IActionResult> SaveCategory([FromBody] CategoryRequestDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveCategoryAsync(dto, ResolveSite(site), ResolveUser());
            return Ok(new { message = "Category saved." });
        }

        [HttpGet("category/{id}")]
        public async Task<IActionResult> GetCategory(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.GetCategoryAsync(id, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("category/list")]
        public async Task<IActionResult> GetCategoryList([FromQuery] string? site = null)
        {
            var result = await _dal.GetCategoryListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("category/{id}")]
        public async Task<IActionResult> DeleteCategory(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.DeleteCategoryAsync(id, ResolveSite(site));
            return Ok(new { success = result });
        }

        // ══════════════════════════════════════════════════════════════════════
        // STATUS ENDPOINTS
        // ══════════════════════════════════════════════════════════════════════

        [HttpGet("status/maxno")]
        public async Task<IActionResult> GetStatusMaxNo([FromQuery] string? site = null)
        {
            var result = await _dal.GetStatusMaxNoAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("status/save")]
        public async Task<IActionResult> SaveStatus([FromBody] StatusRequestDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveStatusAsync(dto, ResolveSite(site), ResolveUser());
            return Ok(new { message = "Status saved." });
        }

        [HttpGet("status/{id}")]
        public async Task<IActionResult> GetStatus(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.GetStatusAsync(id, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("status/list")]
        public async Task<IActionResult> GetStatusList([FromQuery] string? site = null)
        {
            var result = await _dal.GetStatusListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpDelete("status/{id}")]
        public async Task<IActionResult> DeleteStatus(int id, [FromQuery] string? site = null)
        {
            var result = await _dal.DeleteStatusAsync(id, ResolveSite(site));
            return Ok(new { success = result });
        }

        // ── Employee PDF Reports ─────────────────────────────────────────────
        [HttpGet("employee/report/list")]
        public async Task<IActionResult> GetEmployeeListReport(
            [FromQuery] string? site = null,
            [FromQuery] bool? status = null,
            [FromQuery] bool withImage = false)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeeListReportAsync(ResolveSite(site), status, withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/department")]
        public async Task<IActionResult> GetEmployeesByDepartmentReport(
            [FromQuery] string? site = null,
            [FromQuery] bool withImage = false)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeesByDepartmentReportAsync(ResolveSite(site), withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/designation")]
        public async Task<IActionResult> GetEmployeesByDesignationReport(
            [FromQuery] string? site = null,
            [FromQuery] bool withImage = false)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeesByDesignationReportAsync(ResolveSite(site), withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/new-appointments")]
        public async Task<IActionResult> GetNewAppointmentsReport(
            [FromQuery] string fromDate,
            [FromQuery] string toDate,
            [FromQuery] int? deptCode = null,
            [FromQuery] int? desigCode = null,
            [FromQuery] bool withImage = false,
            [FromQuery] string? site = null)
        {
            try
            {
                if (!DateTime.TryParse(fromDate, out var start) || !DateTime.TryParse(toDate, out var end))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD.");
                }
                var pdfBytes = await _reportService.GenerateNewAppointmentsReportAsync(ResolveSite(site), start, end, deptCode, desigCode, withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/dob")]
        public async Task<IActionResult> GetEmployeeDobReport(
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null,
            [FromQuery] int? deptCode = null,
            [FromQuery] int? desigCode = null,
            [FromQuery] bool withImage = false,
            [FromQuery] string? site = null)
        {
            try
            {
                DateTime? start = null;
                DateTime? end = null;

                if (!string.IsNullOrWhiteSpace(fromDate) && DateTime.TryParse(fromDate, out var s))
                {
                    start = s;
                }

                if (!string.IsNullOrWhiteSpace(toDate) && DateTime.TryParse(toDate, out var e))
                {
                    end = e;
                }

                var pdfBytes = await _reportService.GenerateEmployeeDobReportAsync(ResolveSite(site), start, end, deptCode, desigCode, withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/advance")]
        public async Task<IActionResult> GetAdvanceApplicationReport(
            [FromQuery] int empCardNo,
            [FromQuery] string? site = null,
            [FromQuery] string userName = "Admin")
        {
            try
            {
                var pdfBytes = await _reportService.GenerateAdvanceApplicationReportAsync(empCardNo, ResolveSite(site), userName);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/left")]
        public async Task<IActionResult> GetEmployeesLeftReport(
            [FromQuery] string? site = null,
            [FromQuery] bool withImage = false)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeesLeftReportAsync(ResolveSite(site), withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/opening-balances")]
        public async Task<IActionResult> GetEmployeeOpeningBalancesReport(
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeeOpeningBalancesReportAsync(ResolveSite(site));
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/pf-ledger")]
        public async Task<IActionResult> GetEmployeePfLedgerReport(
            [FromQuery] int empCardNo,
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeePfLedgerReportAsync(empCardNo, ResolveSite(site));
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/religion")]
        public async Task<IActionResult> GetEmployeesByReligionReport(
            [FromQuery] string? site = null,
            [FromQuery] bool withImage = false)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeesByReligionReportAsync(ResolveSite(site), withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/service")]
        public async Task<IActionResult> GetEmployeesByServiceReport(
            [FromQuery] string? site = null,
            [FromQuery] bool withImage = false)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeesByServiceReportAsync(ResolveSite(site), withImage);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employee/report/pf-ledger-all")]
        public async Task<IActionResult> GetEmployeePfLedgerAllReport(
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateEmployeePfLedgerAllReportAsync(ResolveSite(site));
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
