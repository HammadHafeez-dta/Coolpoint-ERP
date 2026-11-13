using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using CPCRM.API.Controller;
using CPCRM.API.DAL;
using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using CPCRM.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

if (args.Length == 2 && args[0] == "--write-schema-check")
{
    SchemaContract.Write(args[1]);
    Console.WriteLine("Generated model-column check. No database connected or SQL executed.");
    return;
}

var checks = 0;
void Check(bool value, string name) { if (!value) throw new Exception("FAIL: " + name); checks++; }
void Conflict(Action action, string name) { try { action(); throw new Exception("Expected conflict: " + name); } catch (CrmConflict) { checks++; } }
CrmRules.LeadTransition("New", "Contacted"); checks++;
CrmRules.LeadTransition("Contacted", "Qualified"); checks++;
Conflict(() => CrmRules.LeadTransition("New", "Won"), "lead cannot win a deal");
foreach (var from in new[] { "New", "Contacted", "Qualified", "Disqualified" })
    foreach (var to in new[] { "New", "Contacted", "Qualified", "Disqualified" }) { CrmRules.LeadTransition(from, to); checks++; }
Conflict(() => CrmRules.LeadTransition("Qualified", "ProposalSent"), "deal stage is not an inquiry lifecycle");
foreach (var stage in new[] { "New", "Contacted", "Qualified", "ProposalSent" }) { CrmRules.DealTransition(stage, "Lost"); checks++; }
CrmRules.DealTransition("Contacted", "Qualified"); checks++;
foreach (var stage in new[] { "Won", "Lost" }) Conflict(() => CrmRules.DealTransition(stage, "Contacted"), "closed deal immutable");
Conflict(() => CrmRules.DealTransition("Qualified", "Won"), "win requires quotation command");
Conflict(() => CrmRules.DealTransition("New", "ProposalSent"), "send requires quotation command");
CrmLifecycleService.Expected(new byte[] { 1 }, "AQ=="); checks++;
Conflict(() => CrmLifecycleService.Expected(new byte[] { 1 }, "Ag=="), "stale version");
Conflict(() => CrmLifecycleService.Expected(new byte[] { 1 }, null), "missing version");
var validation = new List<ValidationResult>();
var invalidLine = new QuotationLineInput { ItemDescription="Unit", Quantity=-1, UnitPrice=-1 };
Check(!Validator.TryValidateObject(invalidLine, new ValidationContext(invalidLine), validation, true), "negative amounts/quantities invalid");

using var db = new CRMDbContext(new DbContextOptionsBuilder<CRMDbContext>().UseSqlServer("Server=unused;Database=unused;Integrated Security=true;TrustServerCertificate=true").Options);
checks += SchemaContract.VerifyDdl(db);
var overviewPeriod = new OverviewPeriod(new DateOnly(2026, 11, 1), new DateOnly(2026, 11, 3));
Check(overviewPeriod.StartUtc == new DateTime(2026, 10, 31, 19, 0, 0, DateTimeKind.Utc), "Karachi range starts at UTC minus five hours");
Check(overviewPeriod.EndUtc == new DateTime(2026, 11, 3, 19, 0, 0, DateTimeKind.Utc), "inclusive local end uses next-day exclusive UTC boundary");
var filled = OverviewPeriod.Fill(overviewPeriod, new[] { new OverviewBucket("2026-11-02", 100.25m, 2, 0) });
Check(filled.Count == 3 && filled[0].Deals == 0 && filled[2].Deals == 0 && filled[1].Amount == 100.25m, "zero-fill preserves real decimal values and empty calendar days");
try { new OverviewPeriod(new DateOnly(2026, 11, 2), new DateOnly(2026, 11, 1)).Validate(); throw new Exception("Reversed period accepted"); } catch (ArgumentException) { checks++; }
try { new OverviewPeriod(new DateOnly(2025, 1, 1), new DateOnly(2026, 11, 1)).Validate(); throw new Exception("Excessive period accepted"); } catch (ArgumentException) { checks++; }
Check(db.Model.FindEntityType(typeof(CrmQuotation))!.FindProperty("QuotationDate")!.IsNullable,
    "legacy quotation date may be unknown");
Check(db.Model.FindEntityType(typeof(CrmQuotation))!.FindProperty("ValidityDays")!.IsNullable,
    "legacy quotation validity may be unknown");
foreach (var type in new[] { typeof(CrmLead), typeof(CrmDeal), typeof(CrmQuotation) }) {
    var property = db.Model.FindEntityType(type)!.FindProperty("RowVersion")!;
    Check(property.IsConcurrencyToken, type.Name + " uses optimistic concurrency");
}
var dal = new CrmDAL(db);
var scopedDeals = db.CrmDeals.Where(x => x.Site == "SITE-A" && x.CurrencyCode == "PKR");
var scopedLeads = db.CrmLeads.Where(x => x.Site == "SITE-A" && x.CurrencyCode == "PKR");
var dailySql = SalesOverviewService.DailyWins(scopedDeals.Where(x => x.Stage == "Won"), overviewPeriod).ToQueryString();
Check(dailySql.Contains("GROUP BY") && dailySql.Contains("DATEADD") && dailySql.Contains("SITE-A") && dailySql.Contains("PKR"), "daily close totals compile to scoped SQL Server aggregation");
foreach (var wonOnly in new[] { false, true }) {
    var cohortSql = SalesOverviewService.MilestoneCohort(db, scopedLeads, scopedDeals, "SITE-A", "PKR", overviewPeriod, wonOnly).ToQueryString();
    Check(cohortSql.Contains("EXISTS") && cohortSql.Contains("SentAt") && cohortSql.Contains("SITE-A") && cohortSql.Contains("PKR"), "linked milestone query compiles with site and currency scope");
}
Check(dal.Leads("SITE-A").ToQueryString().Contains("SITE-A"), "DAL includes site in generated SQL");
var access = new FakeAccess(); var service = new CrmLifecycleService(db, dal);
var controller = new CrmController(db, service, access) { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
async Task Denied(Func<Task> action, string name) { try { await action(); throw new Exception("Expected denial: " + name); } catch (UnauthorizedAccessException) { checks++; } }
await Denied(() => controller.Owners(), "missing claims fail before database lookup");
controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("sub","tester"),new Claim("Site","SITE-A"),new Claim("UserLevel","U") }, "Test"));
controller.HttpContext.Request.Headers["X-Site-Code"] = "SITE-B";
await Denied(() => controller.Owners(), "site spoof rejected");
controller.HttpContext.Request.Headers.Remove("X-Site-Code"); access.Allow = false;
await Denied(() => controller.Owners(), "page rights enforced");
Check(access.LastActor?.Site == "SITE-A" && access.LastActor.UserId == "tester", "access adapter receives signed identity");
checks += await RouteChecks.Run();
checks += await ProjectChecks.Run(db);
if (Environment.GetEnvironmentVariable("CRM_PROJECTS_TEST_CONNECTION") is { Length: > 0 } sqlTestConnection)
    checks += await ProjectSqlChecks.Run(sqlTestConnection);
else Console.WriteLine("SKIP live Projects SQL transaction/backfill/concurrency checks: CRM_PROJECTS_TEST_CONNECTION is not configured.");
Console.WriteLine($"PASS {checks} CRM domain, HTTP routing, validation, SQL-declaration, model and access checks.");

sealed class FakeAccess : ICrmAccessService
{
    public List<CrmOwner> Assignees { get; set; } = [];
    public Task<List<CrmOwner>> ProjectAssignees(string site) => Task.FromResult(Assignees);
    public bool Allow { get; set; }
    public CrmActor? LastActor { get; set; }
    public Task<bool> Allowed(CrmActor actor, string page, string action) { LastActor = actor; return Task.FromResult(Allow); }
    public Task<List<CrmOwner>> Owners(string site) => Task.FromResult(new List<CrmOwner>());
}
