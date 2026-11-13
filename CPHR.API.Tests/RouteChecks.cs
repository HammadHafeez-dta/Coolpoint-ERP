using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SaftHR.API.Models;
using SaftHR.API.Services;
using SaftProject.Controller;
using SaftProject.Interface;
using SaftProject.Models;

static class RouteChecks
{
    public static async Task<int> Run()
    {
        var builder = WebApplication.CreateSlimBuilder(); builder.Logging.ClearProviders(); builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddAuthentication("Test").AddScheme<AuthenticationSchemeOptions, TestAuth>("Test", _ => { });
        builder.Services.AddAuthorization(); builder.Services.AddControllers().AddApplicationPart(typeof(HrDashboardController).Assembly);
        builder.Services.AddDbContext<HRMSDbContext>(o => o.UseSqlServer("Server=unused;Database=unused;Integrated Security=true"));
        builder.Services.AddScoped<HrDashboardService>(); builder.Services.AddSingleton<IPermissionService, DeniedPermissions>();
        await using var app = builder.Build(); app.UseAuthentication(); app.UseAuthorization(); app.MapControllers(); await app.StartAsync();
        using var client = new HttpClient { BaseAddress = new(app.Urls.Single()) };
        var checks = 0;
        foreach (var (url, expected) in new[] {
            ("/api/hr/dashboard", HttpStatusCode.Forbidden),
            ("/api/hr/dashboard/employees/1/photo", HttpStatusCode.Forbidden),
            ("/api/hr/dashboard/employees/1/photo?site=OTHER", HttpStatusCode.Forbidden),
            ("/api/hr/dashboard?site=OTHER", HttpStatusCode.Forbidden),
            ("/api/hr/dashboard?from=invalid", HttpStatusCode.BadRequest),
            ("/api/hr/dashboard?from=2026-11-11&to=2026-01-01", HttpStatusCode.BadRequest),
            ("/api/hr/dashboard?from=2026-02-30", HttpStatusCode.BadRequest) })
        {
            var response = await client.GetAsync(url);
            if (response.StatusCode != expected) throw new Exception($"{url}: expected {expected}, got {response.StatusCode}"); checks++;
        }
        using var crossSite = new HttpRequestMessage(HttpMethod.Get, "/api/hr/dashboard"); crossSite.Headers.Add("X-Site-Code", "OTHER");
        if ((await client.SendAsync(crossSite)).StatusCode != HttpStatusCode.Forbidden) throw new Exception("Cross-site header accepted"); checks++;
        client.DefaultRequestHeaders.Add("No-Auth", "1");
        if ((await client.GetAsync("/api/hr/dashboard")).StatusCode != HttpStatusCode.Unauthorized) throw new Exception("Anonymous dashboard access accepted"); checks++;
        await app.StopAsync(); return checks;
    }
}
sealed class DeniedPermissions : IPermissionService
{
    public Task<bool> HasPermissionAsync(string userId, string site, string level, string software, string page, PermissionAction action, string year = "") => Task.FromResult(false);
    public Task<UserPermissionBundleDto> GetUserPermissionBundleAsync(string userId, string site, string level) => Task.FromResult(new UserPermissionBundleDto());
    public void InvalidateUserPermissions(string userId, string site) { }
}
sealed class TestAuth(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (Request.Headers.ContainsKey("No-Auth")) return Task.FromResult(AuthenticateResult.NoResult());
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "tester"), new Claim("Site", "SITE-A"), new Claim("UserLevel", "U") }, "Test"));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, "Test")));
    }
}
