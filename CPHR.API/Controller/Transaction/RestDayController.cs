using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/hr/transaction/[controller]")]
    [ApiController]
    [Authorize]
    public class RestDayController : ControllerBase
    {
        private readonly IRestDayDAL _dal;

        public RestDayController(IRestDayDAL dal)
        {
            _dal = dal;
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

        [HttpGet("maxno")]
        public async Task<IActionResult> GetMaxNo([FromQuery] string? site = null)
        {
            var nextNo = await _dal.GetNextTransNoAsync(ResolveSite(site));
            return Ok(nextNo);
        }

        [HttpGet("weekly-maxno")]
        public async Task<IActionResult> GetWeeklyMaxNo([FromQuery] string? site = null)
        {
            return Ok(await _dal.GetNextWeeklyTransNoAsync(ResolveSite(site)));
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees([FromQuery] int deptCode, [FromQuery] DateTime date, [FromQuery] string? site = null)
        {
            if (deptCode <= 0)
            {
                return BadRequest(new { message = "Valid Department Code is required." });
            }

            var result = await _dal.GetEmployeesForRestDayAsync(deptCode, date, ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("weekly-schedule")]
        public async Task<IActionResult> SaveWeeklySchedule([FromBody] SaveWeeklyRestDayScheduleDto dto, [FromQuery] string? site = null)
        {
            if (dto == null || dto.DepartmentCode <= 0 || dto.EmpCardNos == null || dto.EmpCardNos.Count == 0)
                return BadRequest(new { message = "Select a department and at least one employee." });

            try
            {
                var transNo = await _dal.SaveWeeklyRestDayScheduleAsync(dto, ResolveSite(site), ResolveUser());
                return Ok(new { message = "Weekly rest days saved successfully.", transNo, updatedCount = dto.EmpCardNos.Distinct().Count() });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Could not save weekly rest days. Please try again or contact support." });
            }
        }

        [HttpGet("transaction/{transNo}")]
        public async Task<IActionResult> GetTransaction(int transNo, [FromQuery] string? site = null)
        {
            if (transNo <= 0)
            {
                return BadRequest(new { message = "Valid Transaction No is required." });
            }

            var result = await _dal.GetTransactionByNoAsync(transNo, ResolveSite(site));
            if (result == null)
            {
                return NotFound(new { message = $"Rest Day transaction #{transNo} not found." });
            }

            return Ok(result);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveRestDayTransaction([FromBody] SaveRestDayMasterDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            if (dto == null || dto.DepartmentCode <= 0)
            {
                return BadRequest(new { message = "Invalid rest day assignment payload." });
            }

            try
            {
                var transNo = await _dal.SaveRestDayTransactionAsync(dto, ResolveSite(site), userId ?? ResolveUser());
                return Ok(new { message = "Rest day transaction saved successfully.", transNo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to save rest day transaction.", details = ex.Message });
            }
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentTransactions([FromQuery] string? site = null, [FromQuery] int count = 20)
        {
            var result = await _dal.GetRecentTransactionsAsync(ResolveSite(site), count);
            return Ok(result);
        }

        [HttpDelete("{transNo}")]
        public async Task<IActionResult> DeleteTransaction(int transNo, [FromQuery] string? site = null)
        {
            var success = await _dal.DeleteTransactionAsync(transNo, ResolveSite(site));
            if (!success)
            {
                return NotFound(new { message = $"Rest day transaction #{transNo} not found." });
            }

            return Ok(new { message = "Rest day transaction deleted successfully." });
        }
    }
}
