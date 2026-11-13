using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/hr/transaction/[controller]")]
    [ApiController]
    [Authorize]
    public class SalaryController : ControllerBase
    {
        private readonly ISalaryDAL _dal;
        private readonly SaftHR.API.Services.SalaryReportService _reportService;

        public SalaryController(ISalaryDAL dal, SaftHR.API.Services.SalaryReportService reportService)
        {
            _dal = dal;
            _reportService = reportService;
        }

        // ── Monthly Salary ────────────────────────────────────────────────────────

        [HttpPost("monthly")]
        public async Task<IActionResult> SaveMonthlySalary([FromBody] ProcessSalaryRequestDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            var result = await _dal.ProcessMonthlySalaryAsync(dto, ResolveSite(site), userId);
            return Ok(result);
        }

        [HttpPost("monthly/manual")]
        public async Task<IActionResult> SaveMonthlySalaryManual([FromBody] SalaryDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.SaveMonthlySalaryAsync(dto, ResolveSite(site), userId);
            return Ok();
        }

        [HttpDelete("monthly/single")]
        public async Task<IActionResult> DeleteMonthlySalarySingle([FromBody] SalaryDto dto, [FromQuery] string site = "SAFT")
        {
            var success = await _dal.DeleteMonthlySalarySingleAsync(dto, site);
            return success ? Ok() : BadRequest();
        }

        [HttpDelete("monthly")]
        public async Task<IActionResult> DeleteMonthlySalary([FromQuery] int salaryMonth, [FromQuery] int salaryYear)
        {
            var success = await _dal.DeleteMonthlySalaryAsync(salaryMonth, salaryYear);
            return success ? Ok() : BadRequest();
        }

        [HttpPost("monthly/delete")]
        [HttpDelete("monthly/range")]
        public async Task<IActionResult> DeleteMonthlySalaryRange([FromBody] DeleteSalaryRequestDto dto, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.DeleteMonthlySalaryRangeAsync(dto, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("monthly/absents")]
        public async Task<IActionResult> GetTotalAbsents([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int empCardNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetTotalAbsentsAsync(fromDate, toDate, empCardNo, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("monthly/days")]
        public async Task<IActionResult> GetTotalDays([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int empCardNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetTotalDaysAsync(fromDate, toDate, empCardNo, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("monthly/pfund")]
        public async Task<IActionResult> GetTotalPFund([FromQuery] DateTime salaryDate, [FromQuery] int empCardNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetTotalPFundAsync(salaryDate, empCardNo, site);
            return Ok(result);
        }

        [HttpGet("monthly/pfschoolshare")]
        public async Task<IActionResult> GetTotalPfSchoolShare([FromQuery] DateTime salaryDate, [FromQuery] int empCardNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetTotalPfSchoolShareAsync(salaryDate, empCardNo, site);
            return Ok(result);
        }

        [HttpGet("monthly/info")]
        public async Task<IActionResult> GetMonthlySalary([FromQuery] int empCardNo, [FromQuery] DateTime salaryMonth, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetMonthlySalaryAsync(empCardNo, salaryMonth, site);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("monthly/email/total")]
        public async Task<IActionResult> GetTotalEmployeeSalarySlipForEmail([FromQuery] DateTime salaryDate, [FromQuery] int empCardNo, [FromQuery] int departmentID, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetTotalEmployeeSalarySlipForEmailAsync(salaryDate, empCardNo, departmentID, site);
            return Ok(result);
        }

        [HttpGet("monthly/email/list")]
        public async Task<IActionResult> GetEmployeeSalaryListForEmail([FromQuery] DateTime salaryDate, [FromQuery] int empCardNo, [FromQuery] int departmentID, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetEmployeeSalaryListForEmailAsync(salaryDate, empCardNo, departmentID, site);
            return Ok(result);
        }

        [HttpGet("monthly/list")]
        public async Task<IActionResult> GetSalaryReportList([FromQuery] int month, [FromQuery] int year, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetSalaryReportListAsync(month, year, ResolveSite(site));
            return Ok(result);
        }

        // ── Evening Salary ────────────────────────────────────────────────────────

        [HttpGet("evening/maxno")]
        public async Task<IActionResult> EveningSalaryMaxNO([FromQuery] string site = "SAFT")
        {
            var result = await _dal.EveningSalaryMaxNOAsync(site);
            return Ok(result);
        }

        [HttpPost("evening/master")]
        public async Task<IActionResult> SaveEveningSalaryMaster([FromBody] EveningSalaryMasterDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.SaveEveningSalaryMasterAsync(dto, site, userId);
            return Ok();
        }

        [HttpPost("evening/child")]
        public async Task<IActionResult> SaveEveningSalaryChild([FromBody] EveningSalaryChildDto dto, [FromQuery] string site = "SAFT")
        {
            await _dal.SaveEveningSalaryChildAsync(dto, site);
            return Ok();
        }

        [HttpGet("evening/master/{transactionNo}")]
        public async Task<IActionResult> GetEveningSalaryInfo(int transactionNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetEveningSalaryInfoAsync(transactionNo, site);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("evening/child/{transactionNo}")]
        public async Task<IActionResult> GetEveningSalaryChildInfo(int transactionNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetEveningSalaryChildInfoAsync(transactionNo, site);
            return Ok(result);
        }

        [HttpDelete("evening/child/{transactionNo}")]
        public async Task<IActionResult> DeleteEveningSalaryChild(int transactionNo, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteEveningSalaryChildAsync(transactionNo, site);
            return Ok();
        }

        // ── Special Allowance ─────────────────────────────────────────────────────

        [HttpGet("specialallowance/maxno")]
        public async Task<IActionResult> SpecialAllowanceMaxNo([FromQuery] string site = "SAFT")
        {
            var result = await _dal.SpecialAllowanceMaxNoAsync(site);
            return Ok(result);
        }

        [HttpPost("specialallowance/master")]
        public async Task<IActionResult> SaveSpecialAllowanceMaster([FromBody] SpecialAllowanceMasterDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.SaveSpecialAllowanceMasterAsync(dto, site, userId);
            return Ok();
        }

        [HttpPost("specialallowance/child")]
        public async Task<IActionResult> SaveSpecialAllowanceChild([FromBody] SpecialAllowanceChildDto dto, [FromQuery] string site = "SAFT")
        {
            await _dal.SaveSpecialAllowanceChildAsync(dto, site);
            return Ok();
        }

        [HttpGet("specialallowance/master/{transactionNo}")]
        public async Task<IActionResult> GetSpecialAllowanceInfo(int transactionNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetSpecialAllowanceInfoAsync(transactionNo, site);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("specialallowance/child/{transactionNo}")]
        public async Task<IActionResult> GetSpecialAllowanceChildInfo(int transactionNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetSpecialAllowanceChildInfoAsync(transactionNo, site);
            return Ok(result);
        }

        [HttpDelete("specialallowance/child/{transactionNo}")]
        public async Task<IActionResult> DeleteSpecialAllowanceChild(int transactionNo, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteSpecialAllowanceChildAsync(transactionNo, site);
            return Ok();
        }

        // ── OverTime ──────────────────────────────────────────────────────────────

        [HttpGet("overtime/maxno")]
        public async Task<IActionResult> OverTimeMaxNO([FromQuery] string site = "SAFT")
        {
            var result = await _dal.OverTimeMaxNOAsync(site);
            return Ok(result);
        }

        [HttpPost("overtime/master")]
        public async Task<IActionResult> SaveOverTimeMaster([FromBody] OverTimeMasterDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.SaveOverTimeMasterAsync(dto, site, userId);
            return Ok();
        }

        [HttpPost("overtime/child")]
        public async Task<IActionResult> SaveOverTimechild([FromBody] OverTimeChildDto dto, [FromQuery] string site = "SAFT")
        {
            await _dal.SaveOverTimechildAsync(dto, site);
            return Ok();
        }

        [HttpDelete("overtime/child/{overTimeNo}")]
        public async Task<IActionResult> DeleteOverTimeChild(int overTimeNo, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteOverTimeChildAsync(overTimeNo, site);
            return Ok();
        }

        [HttpGet("overtime/master/{srno}")]
        public async Task<IActionResult> EditOverTimeMaster(int srno, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.EditOverTimeMasterAsync(srno, site);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("overtime/child/{srno}")]
        public async Task<IActionResult> EditOverTimeChild(int srno, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.EditOverTimeChildAsync(srno, site);
            return Ok(result);
        }

        // ── Update Salary Breakup ─────────────────────────────────────────────────

        [HttpGet("breakup/maxno")]
        public async Task<IActionResult> UpdateSalaryBreakupMaxNo([FromQuery] string site = "SAFT")
        {
            var result = await _dal.UpdateSalaryBreakupMaxNoAsync(site);
            return Ok(result);
        }

        [HttpPost("breakup/master")]
        public async Task<IActionResult> SaveUpdateSalaryBreakupMaster([FromBody] UpdateSalaryBreakupMasterDto dto, [FromQuery] string site = "SAFT", [FromQuery] string userId = "1")
        {
            await _dal.SaveUpdateSalaryBreakupMasterAsync(dto, site, userId);
            return Ok();
        }

        [HttpPost("breakup/child")]
        public async Task<IActionResult> SaveUpdateSalaryBreakupChild([FromBody] UpdateSalaryBreakupChildDto dto, [FromQuery] string site = "SAFT")
        {
            await _dal.SaveUpdateSalaryBreakupChildAsync(dto, site);
            return Ok();
        }

        [HttpGet("breakup/master/{transactionNo}")]
        public async Task<IActionResult> GetUpdateSalaryBreakupMasterInfo(int transactionNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetUpdateSalaryBreakupMasterInfoAsync(transactionNo, site);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("breakup/child/{transactionNo}")]
        public async Task<IActionResult> GetUpdateSalaryBreakupChildInfo(int transactionNo, [FromQuery] string site = "SAFT")
        {
            var result = await _dal.GetUpdateSalaryBreakupChildInfoAsync(transactionNo, site);
            return Ok(result);
        }

        [HttpDelete("breakup/child/{transactionNo}")]
        public async Task<IActionResult> DeleteUpdateSalaryBreakupChild(int transactionNo, [FromQuery] string site = "SAFT")
        {
            await _dal.DeleteUpdateSalaryBreakupChildAsync(transactionNo, site);
            return Ok();
        }

        [HttpPut("breakup/employee")]
        public async Task<IActionResult> UpdateEmployeeSalaryBreakup([FromBody] UpdateSalaryBreakupChildDto dto, [FromQuery] string site = "SAFT")
        {
            await _dal.UpdateEmployeeSalaryBreakupAsync(dto, site);
            return Ok();
        }

        private string ResolveSite(string? querySite = null)
        {
            var claimSite = User.FindFirst("Site")?.Value;
            return !string.IsNullOrWhiteSpace(claimSite) ? claimSite
                 : !string.IsNullOrWhiteSpace(querySite) ? querySite
                 : "SAFT";
        }

        [HttpGet("report/salary")]
        public async Task<IActionResult> GetSalaryReport(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] int? employeeId = null,
            [FromQuery] string? departmentCode = null,
            [FromQuery] string? category = null,
            [FromQuery] string reportType = "All",
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateSalaryReportAsync(ResolveSite(site), month, year, employeeId, departmentCode, category, reportType);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/slips")]
        public async Task<IActionResult> GetSalarySlips(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] int? employeeId = null,
            [FromQuery] string? departmentCode = null,
            [FromQuery] int? designationCode = null,
            [FromQuery] string? category = null,
            [FromQuery] string reportType = "EmployeeWise",
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateSalarySlipsAsync(ResolveSite(site), month, year, employeeId, departmentCode, designationCode, category, reportType);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/summary")]
        public async Task<IActionResult> GetSalarySummary(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateSalarySummaryAsync(ResolveSite(site), month, year, category);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/bank-transfer")]
        public async Task<IActionResult> GetBankTransferReport(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateBankTransferReportAsync(ResolveSite(site), month, year, category);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/pf-list")]
        public async Task<IActionResult> GetPfListReport(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GeneratePfListReportAsync(ResolveSite(site), month, year, category);
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/sp-allow-transfer")]
        public async Task<IActionResult> GetSpecialAllowTransferReport(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] string? category = null,
            [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateSpecialAllowTransferReportAsync(ResolveSite(site), month, year, category);
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
