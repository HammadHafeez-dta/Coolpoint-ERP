using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO.Transaction;
using SaftHR.API.Interface.Transaction;

namespace SaftHR.API.Controller.Transaction
{
    [Route("api/hr/transaction/[controller]")]
    [ApiController]
    [Authorize]
    public class LoanController : ControllerBase
    {
        private readonly ILoanDAL _dal;
        private readonly SaftHR.API.Services.LoanReportService _reportService;

        public LoanController(ILoanDAL dal, SaftHR.API.Services.LoanReportService reportService)
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

        // ── Loans ─────────────────────────────────────────────────────────────────

        [HttpGet("types")]
        public async Task<IActionResult> GetLoanTypes()
        {
            var result = await _dal.GetLoanTypesAsync();
            return Ok(result);
        }

        [HttpGet("maxno")]
        public async Task<IActionResult> LoanMaxNO([FromQuery] string? site = null)
        {
            var result = await _dal.LoanMaxNOAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveLoans([FromBody] LoanDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLoansAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpGet("{transactionNo}")]
        public async Task<IActionResult> GetLoanInfo(int transactionNo, [FromQuery] string? site = null)
        {
            var result = await _dal.GetLoanInfoAsync(transactionNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetLoansList([FromQuery] string? site = null)
        {
            var result = await _dal.GetLoansListAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("check/longterm/{empcard}")]
        public async Task<IActionResult> CheckEmpLongTermLoan(int empcard, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckEmpLongTermLoanAsync(empcard, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("check/providentfund/{empcard}")]
        public async Task<IActionResult> CheckEmpProvidentFundLoan(int empcard, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckEmpProvidentFundLoanAsync(empcard, ResolveSite(site));
            return Ok(result);
        }

        // ── Loan Ledger ───────────────────────────────────────────────────────────

        [HttpPost("ledger/temp")]
        public async Task<IActionResult> SaveLoanLedgerTemp([FromBody] LoanLedgerDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveLoanLedgerTempAsync(dto, ResolveSite(site));
            return Ok();
        }

        [HttpDelete("ledger/temp")]
        public async Task<IActionResult> DeleteLoanLedgerTemp()
        {
            await _dal.DeleteLoanLedgerTempAsync();
            return Ok();
        }

        [HttpPost("ledger")]
        public async Task<IActionResult> SaveLoanLedger([FromBody] LoanLedgerDto dto, [FromQuery] string? site = null)
        {
            await _dal.SaveLoanLedgerAsync(dto, ResolveSite(site));
            return Ok();
        }

        [HttpDelete("ledger/{loanTransactionNo}")]
        public async Task<IActionResult> DeleteLoanLedger(int loanTransactionNo, [FromQuery] string? site = null)
        {
            await _dal.DeleteLoanLedgerAsync(loanTransactionNo, ResolveSite(site));
            return Ok();
        }

        // ── Loan Deductions ───────────────────────────────────────────────────────

        [HttpGet("deductions/maxno")]
        public async Task<IActionResult> LoanDeductionsMaxNO([FromQuery] string? site = null)
        {
            var result = await _dal.LoanDeductionsMaxNOAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("deductions")]
        public async Task<IActionResult> SaveLoanDeductions([FromBody] LoanDeductionDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLoanDeductionsAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpDelete("deductions/{transactionNo}")]
        public async Task<IActionResult> DeleteLoanDeductions(int transactionNo, [FromQuery] string? site = null)
        {
            await _dal.DeleteLoanDeductionsAsync(transactionNo, ResolveSite(site));
            return Ok();
        }

        [HttpGet("deductions/info/{transactionNo}")]
        public async Task<IActionResult> GetLoanDeductionsInfo(int transactionNo, [FromQuery] string? site = null)
        {
            var result = await _dal.GetLoanDeductionsInfoAsync(transactionNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("deductions/list/{transactionNo}")]
        public async Task<IActionResult> GetLoansDeductions(int transactionNo, [FromQuery] string? site = null)
        {
            var result = await _dal.GetLoansDeductionsAsync(transactionNo, ResolveSite(site));
            return Ok(result);
        }

        // ── Loan Returns & Instalments ────────────────────────────────────────────

        [HttpGet("instalment/check/{empcard}")]
        public async Task<IActionResult> CheckEmpLoanInstalment(int empcard, [FromQuery] string? site = null)
        {
            var result = await _dal.CheckEmpLoanInstalmentAsync(empcard, ResolveSite(site));
            return Ok(result);
        }

        [HttpGet("return/maxno")]
        public async Task<IActionResult> LoanReturnMaxNO([FromQuery] string? site = null)
        {
            var result = await _dal.LoanReturnMaxNOAsync(ResolveSite(site));
            return Ok(result);
        }

        [HttpPost("return")]
        public async Task<IActionResult> SaveLoanReturn([FromBody] LoanReturnDto dto, [FromQuery] string? site = null, [FromQuery] string? userId = null)
        {
            await _dal.SaveLoanReturnAsync(dto, ResolveSite(site), userId ?? ResolveUser());
            return Ok();
        }

        [HttpGet("return/info/{transactionNo}")]
        public async Task<IActionResult> GetPfLoanReturnInfo(int transactionNo, [FromQuery] string? site = null)
        {
            var result = await _dal.GetPfLoanReturnInfoAsync(transactionNo, ResolveSite(site));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("report/register")]
        public async Task<IActionResult> GetLoanRegisterReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string userName = "Admin",
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateLoanRegisterReportAsync(ResolveSite(site), fromDate, toDate, userName);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }

        [HttpGet("report/ledger")]
        public async Task<IActionResult> GetLoanLedgerReport(
            [FromQuery] int empCardNo,
            [FromQuery] string loanType,
            [FromQuery] string userName = "Admin",
            [FromQuery] string? site = null)
        {
            var pdfBytes = await _reportService.GenerateLoanLedgerReportAsync(ResolveSite(site), empCardNo, loanType, userName);
            Response.Headers["Content-Disposition"] = "inline";
            return File(pdfBytes, "application/pdf");
        }
    }
}
