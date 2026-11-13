using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/hr/transaction/[controller]")]
    [ApiController]
    [Authorize]
    public class SettlementController : ControllerBase
    {
        private readonly ISettlementDAL _dal;
        private readonly SaftHR.API.Services.SettlementReportService _reportService;

        public SettlementController(ISettlementDAL dal, SaftHR.API.Services.SettlementReportService reportService)
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

        [HttpGet("maxno")]
        public async Task<IActionResult> FinalSettlementMaxNO([FromQuery] string? site = null)
        {
            var result = await _dal.FinalSettlementMaxNOAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("check/{cardNo}")]
        public async Task<IActionResult> CheckSettlement(int cardNo, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckSettlementAsync(cardNo, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("overtime/{cardNo}")]
        public async Task<IActionResult> GetOverTime(int cardNo, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] string? site = null)
        {
            var result = await _dal.GetOverTimeAsync(cardNo, fromDate, toDate, ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveFinalSettlement([FromBody] FinalSettlementDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveFinalSettlementAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpGet("{settlementNo}")]
        public async Task<IActionResult> EditFinalSettlement(int settlementNo, [FromQuery] string? site = null)
        {
            var result = await _dal.EditFinalSettlementAsync(settlementNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("card/{cardNo}")]
        public async Task<IActionResult> EditFinalSettlementCardNo(int cardNo, [FromQuery] string? site = null)
        {
            var result = await _dal.EditFinalSettlementCardNoAsync(cardNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetFinalSettlementsList([FromQuery] string? site = null)
        {
            var result = await _dal.GetFinalSettlementsListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("report/detail")]
        public async Task<IActionResult> GetSettlementDetailReport([FromQuery] int transactionNo, [FromQuery] string? site = null)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateSettlementDetailReportAsync(transactionNo, ResolveSite(site));
                Response.Headers["Content-Disposition"] = "inline";
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("report/summary")]
        public async Task<IActionResult> GetSettlementSummaryReport([FromQuery] string fromDate, [FromQuery] string toDate, [FromQuery] string? site = null)
        {
            try
            {
                if (!DateTime.TryParse(fromDate, out var start) || !DateTime.TryParse(toDate, out var end))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD.");
                }
                var pdfBytes = await _reportService.GenerateSettlementSummaryReportAsync(start, end, ResolveSite(site));
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
