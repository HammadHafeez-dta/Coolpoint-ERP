using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using CPCRM.API.Controller;
using CPCRM.API.DAL;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using CPCRM.API.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

static class RouteChecks
{
    public static async Task<int> Run()
    {
        var builder = WebApplication.CreateSlimBuilder();
        builder.Logging.ClearProviders();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddAuthentication("Test").AddScheme<AuthenticationSchemeOptions, RouteAuth>("Test", _ => { });
        builder.Services.AddAuthorization();
        builder.Services.AddControllers().AddApplicationPart(typeof(CrmController).Assembly);
        builder.Services.AddDbContext<CRMDbContext>(options => options.UseSqlServer("Server=unused;Database=unused;Integrated Security=true"));
        builder.Services.AddScoped<ICrmDAL, CrmDAL>();
        builder.Services.AddScoped<CrmLifecycleService>();
        builder.Services.AddScoped<SalesOverviewService>();
        var access = new FakeAccess { Allow = true };
        builder.Services.AddSingleton<ICrmAccessService>(access);
        builder.Services.AddScoped<CrmProjectService>();
        await using var app = builder.Build();
        app.UseAuthentication(); app.UseAuthorization(); app.MapControllers();
        await app.StartAsync();
        using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
        var count = 0;
        foreach (var command in new[] { "send", "accept", "reject", "request-revision" })
        {
            // Missing required rowversion must reach MVC validation (400), never a missing route (404).
            // Validation happens before the handler, so no SQL connection is made.
            var response = await client.PostAsJsonAsync($"/api/Crm/quotations/1/{command}", new { });
            if (response.StatusCode != HttpStatusCode.BadRequest)
                throw new Exception($"Quotation route /{command}: expected validation 400, got {(int)response.StatusCode}.");
            count++;
        }
        foreach (var url in new[] { "/api/Crm/sales-overview?from=2026-11-11&to=2026-11-01", "/api/Crm/sales-overview?currency=INVALID" })
        {
            var response = await client.GetAsync(url);
            if (response.StatusCode != HttpStatusCode.BadRequest) throw new Exception("Dashboard must validate filters before accessing SQL.");
            count++;
        }
        var assignees = await client.GetAsync("/api/crm/projects/assignees");
        if (assignees.StatusCode != HttpStatusCode.OK) throw new Exception("Projects assignee route must resolve for administrators.");
        count++;
        client.DefaultRequestHeaders.Add("X-Test-Level", "U");
        foreach (var request in new[] {
            new HttpRequestMessage(HttpMethod.Post, "/api/crm/projects") { Content = JsonContent.Create(new { title = "Manual project" }) },
            new HttpRequestMessage(HttpMethod.Get, "/api/crm/projects/assignees"),
            new HttpRequestMessage(HttpMethod.Post, "/api/crm/projects/1/tasks") { Content = JsonContent.Create(new { title = "Test", assigneeUserId = "worker" }) },
            new HttpRequestMessage(HttpMethod.Patch, "/api/crm/projects/1/tasks/1") { Content = JsonContent.Create(new { title = "Test", assigneeUserId = "worker", rowVersion = "AQ==" }) }
        }) {
            using var response = await client.SendAsync(request);
            if (response.StatusCode != HttpStatusCode.Forbidden) throw new Exception("Limited user task creation/assignment must be denied even with page grants.");
            count++;
        }
        var invalidStatus = await client.PostAsJsonAsync("/api/crm/projects/1/tasks/1/status", new { status = "Review", rowVersion = "AQ==" });
        if (invalidStatus.StatusCode != HttpStatusCode.BadRequest) throw new Exception("Unknown task states must be rejected before SQL access.");
        count++;
        var missingVersion = await client.PostAsJsonAsync("/api/crm/projects/1/tasks/1/status", new { status = "Done" });
        if (missingVersion.StatusCode != HttpStatusCode.BadRequest) throw new Exception("Task status commands require rowVersion.");
        count++;
        var spoof = await client.GetAsync("/api/crm/projects?site=OTHER");
        if (spoof.StatusCode != HttpStatusCode.Forbidden) throw new Exception("Projects reject unsigned site selection.");
        count++;
        access.Allow = false;
        foreach (var url in new[] { "/api/crm/projects", "/api/crm/projects/1" }) {
            var response = await client.GetAsync(url);
            if (response.StatusCode != HttpStatusCode.Forbidden) throw new Exception("Projects View required.");
            count++;
        }
        var denied = await client.GetAsync("/api/Crm/sales-overview");
        if (denied.StatusCode != HttpStatusCode.Forbidden) throw new Exception("Dashboard must enforce Sales Analytics rights.");
        count++;
        await app.StopAsync();
        return count;
    }
}

sealed class RouteAuth(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("sub", "tester"), new Claim("Site", "TEST"), new Claim("UserLevel", Request.Headers["X-Test-Level"].FirstOrDefault() ?? "A") }, "Test"));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, "Test")));
    }
}
