using System.Security.Claims;
using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using CPCRM.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace CPCRM.API.Controller;

public class CrmExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, message) = context.Exception switch {
            CrmMissing => (404, "CRM record not found."),
            CrmConflict e => (409, e.Message),
            DbUpdateConcurrencyException => (409, "The record changed. Refresh and retry."),
            UnauthorizedAccessException => (403, "You do not have permission for this CRM action."),
            ArgumentException e => (400, e.Message),
            DbUpdateException e when e.InnerException is SqlException sql && sql.Number is 2601 or 2627 => (409, "A conflicting record already exists. Refresh and retry."),
            SqlException => (503, "CRM database unavailable or schema not installed. Contact your administrator."),
            _ => (500, "The CRM request could not be completed.")
        };
        context.Result = new ObjectResult(new { message, code = status == 403 ? "permission_denied" : "crm_error" }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}

[ApiController, Route("api/Crm"), Authorize, TypeFilter(typeof(CrmExceptionFilter))]
public class CrmController(CRMDbContext db, CrmLifecycleService lifecycle, ICrmAccessService access) : ControllerBase
{
    private async Task<CrmActor> Gate(string page, string action = "View")
    {
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var site = User.FindFirstValue("Site");
        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(site)) throw new UnauthorizedAccessException();
        foreach (var value in new[] { Request.Headers["Site"].ToString(), Request.Headers["X-Site-Code"].ToString(), Request.Query["site"].ToString() })
            if (!string.IsNullOrEmpty(value) && !string.Equals(value, site, StringComparison.OrdinalIgnoreCase)) throw new UnauthorizedAccessException();
        var a = new CrmActor(user, site, User.FindFirstValue("UserLevel") ?? "");
        if (!await access.Allowed(a, page, action)) throw new UnauthorizedAccessException();
        return a;
    }
    private async Task ValidateOwner(LeadInput input, CrmActor a)
    {
        if (!string.IsNullOrWhiteSpace(input.OwnerUserId) && !(await access.Owners(a.Site)).Any(x => x.UserId == input.OwnerUserId))
            throw new ArgumentException("Choose an owner from this site's users.");
        if (string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.CustomerName)) throw new ArgumentException("Inquiry and company names are required.");
    }
    [HttpGet("owners")]
    public async Task<IActionResult> Owners() => Ok(await access.Owners((await Gate("HVAC Inquiries")).Site));
    [HttpGet("leads")]
    public async Task<IActionResult> Leads(string? search, string? status, string? owner, int? page, int pageSize = 25, string? currency = null) => Ok(await lifecycle.Leads(await Gate("HVAC Inquiries"), search, status, owner, page, pageSize, currency));
    [HttpGet("leads/{id:int}")]
    public async Task<IActionResult> Lead(int id) => Ok(CrmLifecycleService.LeadView(await lifecycle.Lead(id, (await Gate("HVAC Inquiries")).Site)));
    [HttpGet("leads/{id:int}/detail")]
    public async Task<IActionResult> Detail(int id) {
        var a = await Gate("HVAC Inquiries"); return Ok(await lifecycle.Detail(id, a,
            await access.Allowed(a, "Deals Pipeline", "View"), await access.Allowed(a, "Project Quotations", "View"), await access.Allowed(a, "Projects", "View")));
    }
    [HttpPost("leads")]
    public async Task<IActionResult> CreateLead(LeadInput input) { var a = await Gate("HVAC Inquiries", "Add"); await ValidateOwner(input, a); return Ok(await lifecycle.SaveLead(null, input, a)); }
    [HttpPatch("leads/{id:int}")]
    public async Task<IActionResult> EditLead(int id, LeadInput input) { var a = await Gate("HVAC Inquiries", "Edit"); await ValidateOwner(input, a); return Ok(await lifecycle.SaveLead(id, input, a)); }
    [HttpPost("leads/{id:int}/lifecycle")]
    public async Task<IActionResult> LeadState(int id, StateCommand input) => Ok(await lifecycle.LeadState(id, input, await Gate("HVAC Inquiries", "Edit")));
    [HttpPatch("leads/{id:int}/stage")]
    public async Task<IActionResult> LegacyStage(int id, [FromBody] string stage) { await lifecycle.Lead(id, (await Gate("HVAC Inquiries", "Edit")).Site); throw new CrmConflict("Use inquiry lifecycle or deal commands with the current record version."); }
    [HttpGet("leads/{id:int}/activities")]
    public async Task<IActionResult> Activities(int id, int? beforeId, int pageSize = 30) {
        var a = await Gate("HVAC Inquiries"); await lifecycle.Lead(id, a.Site);
        var q = db.CrmActivities.AsNoTracking().Where(x => x.Site == a.Site && x.LeadId == id);
        if (beforeId.HasValue) q = q.Where(x => x.Id < beforeId.Value);
        var size = Math.Clamp(pageSize, 1, 100); var rows = await q.OrderByDescending(x => x.Id).Take(size + 1).ToListAsync();
        var more = rows.Count > size; var items = rows.Take(size).ToList(); return Ok(new { items, nextCursor = more ? (int?)items.Last().Id : null });
    }
    [HttpPost("leads/{id:int}/activities")]
    public async Task<IActionResult> AddActivity(int id, ActivityInput input) {
        var a = await Gate("HVAC Inquiries", "Edit"); await lifecycle.Lead(id, a.Site);
        if (string.IsNullOrWhiteSpace(input.Body)) throw new ArgumentException("Enter a note.");
        lifecycle.Event(a, id, input.Type, input.Type == "Call" ? "Manual call logged" : "Note added", body: input.Body.Trim(), manual: true);
        await db.SaveChangesAsync(); return Ok(new { message = "Activity recorded." });
    }
    [HttpGet("deals")]
    public async Task<IActionResult> Deals(string? stage, int page = 1, int pageSize = 100, string? currency = null, string? scope = null) {
        var a = await Gate("Deals Pipeline"); var q = db.CrmDeals.AsNoTracking().Where(x => x.Site == a.Site);
        if (!string.IsNullOrWhiteSpace(stage)) q = q.Where(x => x.Stage == stage);
        if (!string.IsNullOrWhiteSpace(currency)) q = q.Where(x => x.CurrencyCode == currency);
        if (scope == "open") q = q.Where(x => x.Stage != "Won" && x.Stage != "Lost");
        var size = Math.Clamp(pageSize, 1, 100); page = Math.Max(1, page);
        return Ok(new { items = await q.OrderByDescending(x => x.UpdatedAt).ThenByDescending(x => x.Id).Skip((page - 1) * size).Take(size).ToListAsync(), totalCount = await q.CountAsync(), page, pageSize = size });
    }
    [HttpPost("leads/{id:int}/deals")]
    public async Task<IActionResult> CreateDeal(int id, DealInput input) { var a = await Gate("Deals Pipeline", "Add"); await Gate("HVAC Inquiries"); return Ok(await lifecycle.CreateDeal(id, input, a)); }
    [HttpPost("deals/{id:int}/stage")]
    public async Task<IActionResult> DealStage(int id, StateCommand input) => Ok(await lifecycle.DealState(id, input, await Gate("Deals Pipeline", "Edit"), false));
    [HttpPost("deals/{id:int}/lose")]
    public async Task<IActionResult> Lose(int id, StateCommand input) => Ok(await lifecycle.DealState(id, input, await Gate("Deals Pipeline", "Edit"), true));
    [HttpGet("quotations")]
    public async Task<IActionResult> Quotations() {
        var a = await Gate("Project Quotations"); var rows = await db.CrmQuotations.AsNoTracking().Include(x => x.Items).Where(x => x.Site == a.Site).OrderByDescending(x => x.Id).Take(100).ToListAsync(); return Ok(rows.Select(CrmLifecycleService.QuoteView));
    }
    [HttpGet("quotations/{id:int}")]
    public async Task<IActionResult> Quotation(int id) => Ok(CrmLifecycleService.QuoteView(await lifecycle.Quote(id, (await Gate("Project Quotations")).Site)));
    [HttpPost("deals/{id:int}/quotations")]
    public async Task<IActionResult> CreateQuotation(int id, QuotationInput input) { var a = await Gate("Project Quotations", "Add"); await Gate("Deals Pipeline", "Edit"); return Ok(await lifecycle.SaveQuotation(id, null, input, a)); }
    [HttpPatch("quotations/{id:int}")]
    public async Task<IActionResult> EditQuotation(int id, QuotationInput input) {
        var a = await Gate("Project Quotations", "Edit"); await Gate("Deals Pipeline", "Edit");
        var q = await db.CrmQuotations.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Site == a.Site) ?? throw new CrmMissing();
        return Ok(await lifecycle.SaveQuotation(q.DealId ?? throw new CrmConflict("Legacy quotation requires deal linking."), id, input, a));
    }
    [HttpPost("quotations/{id:int}/{command}")]
    public async Task<IActionResult> QuoteAction(int id, string command, StateCommand input) { var a = await Gate("Project Quotations", "Edit"); await Gate("Deals Pipeline", "Edit"); return Ok(await lifecycle.QuotationState(id, command, input, a)); }
    [HttpGet("customers")]
    public async Task<IActionResult> Customers() { var a = await Gate("Commercial Clients"); return Ok(await db.CrmCustomers.AsNoTracking().Where(x => x.Site == a.Site).OrderBy(x => x.CompanyName).Take(100).ToListAsync()); }
    [HttpPost("customers")]
    public async Task<IActionResult> Customer(CreateCustomerDto input) {
        var a = await Gate("Commercial Clients", "Add");
        if (string.IsNullOrWhiteSpace(input.CompanyName) || input.CompanyName.Length > 200) throw new ArgumentException("Company name is required (200 characters maximum).");
        var c = new CrmCustomer { CompanyName = input.CompanyName.Trim(), Site = a.Site, CreatedBy = a.UserId, ContactPerson = input.ContactPerson, Email = input.Email, Phone = input.Phone, City = input.City, Industry = input.Industry, Address = input.Address, IsActive = true, CreatedAt = DateTime.UtcNow };
        db.CrmCustomers.Add(c); await db.SaveChangesAsync(); return Ok(c);
    }
    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> Stats(string currency = "PKR") {
        var a = await Gate("Sales Analytics"); var q = db.CrmDeals.AsNoTracking().Where(x => x.Site == a.Site && x.CurrencyCode == currency);
        var total = await q.CountAsync(); var won = await q.CountAsync(x => x.Stage == "Won");
        return Ok(new { currencyCode = currency, totalPipelineValue = await q.Where(x => x.Stage != "Lost" && x.Stage != "Won").SumAsync(x => (decimal?)x.Value) ?? 0,
            activeInquiriesCount = await q.CountAsync(x => x.Stage != "Lost" && x.Stage != "Won"), totalWonValue = await q.Where(x => x.Stage == "Won").SumAsync(x => x.WonValue) ?? 0,
            wonCount = won, conversionRate = total == 0 ? 0 : Math.Round(100d * won / total, 1) });
    }
    [HttpGet("sales-overview")]
    public async Task<IActionResult> Overview([FromServices] SalesOverviewService overview, string? currency, DateOnly? from, DateOnly? to)
    {
        var actor = await Gate("Sales Analytics");
        return Ok(await overview.Get(actor, currency, from, to,
            await access.Allowed(actor, "HVAC Inquiries", "View"),
            await access.Allowed(actor, "Deals Pipeline", "View"),
            await access.Allowed(actor, "Project Quotations", "View")));
    }
}
