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
    public class DutyTimingController : ControllerBase
    {
        private readonly IDutyTimingDAL _dal;

        public DutyTimingController(IDutyTimingDAL dal)
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

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees(
            [FromQuery] int deptCode,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string? fromTime = null,
            [FromQuery] string? toTime = null,
            [FromQuery] string? site = null)
        {
            if (deptCode <= 0)
            {
                return BadRequest(new { message = "Valid Department Code is required." });
            }

            var result = await _dal.GetEmployeesForDutyTimingAsync(
                deptCode,
                fromDate,
                toDate,
                fromTime ?? "08:00",
                toTime ?? "14:00",
                ResolveSite(site));
            return Ok(result);
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
                return NotFound(new { message = $"Duty Timing transaction #{transNo} not found." });
            }

            return Ok(result);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveDutyTimingTransaction(
            [FromBody] SaveDutyTimingMasterDto dto,
            [FromQuery] string? site = null,
            [FromQuery] string? userId = null)
        {
            if (dto == null || dto.DepartmentCode <= 0)
            {
                return BadRequest(new { message = "Invalid duty timing assignment payload." });
            }

            try
            {
                var transNo = await _dal.SaveDutyTimingTransactionAsync(dto, ResolveSite(site), userId ?? ResolveUser());
                return Ok(new { message = "Duty timing transaction saved successfully.", transNo });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message, details = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message, details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to save duty timing transaction.", details = ex.Message });
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
                return NotFound(new { message = $"Duty timing transaction #{transNo} not found." });
            }

            return Ok(new { message = "Duty timing transaction deleted successfully." });
        }
    }
}
