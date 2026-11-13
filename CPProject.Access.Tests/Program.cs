using Microsoft.EntityFrameworkCore;
using SaftProject.Interface;
using SaftProject.Models;
using SaftProject.Services;
using SaftProject.Attributes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Controllers;
using SaftProject.Filters;
using SaftHR.API.Controller.Define;

var checks = 0;
void Check(bool value, string name) { if (!value) throw new Exception(name); checks++; }
var eligible = CrmAccessService.LimitedWebUser.Compile();
Check(eligible(new TblUser { UserId = "worker", UserLevel = "U", WebUser = null }), "Legacy limited web account remains assignable");
Check(eligible(new TblUser { UserId = "worker", UserLevel = " u ", WebUser = true }), "Padded/lowercase limited role supported");
Check(!eligible(new TblUser { UserId = "worker", UserLevel = "U", WebUser = false }), "Explicit web exclusion preserved");
Check(!eligible(new TblUser { UserId = "admin", UserLevel = "A", WebUser = null }), "Ordinary administrators excluded");
Check(eligible(new TblUser { UserId = "teacher", UserLevel = "A", TeacherId = 1, WebUser = null }), "Teacher link retains effective limited-user behavior");
Check(!eligible(new TblUser { UserId = "  ", UserLevel = "U" }), "Blank login not assignable");
var bundle = new UserPermissionBundleDto { AccessibleModules = ["CRM"], Pages = [new PagePermissionDto { Software = "CRM", PageName = "Projects", CanView = true, CanEdit = true }] };
Check(CrmAccessService.CanAssignProjects(bundle), "Projects View/Edit account eligible");
bundle.Pages[0].CanEdit = false;
Check(!CrmAccessService.CanAssignProjects(bundle), "View-only account excluded");
bundle.Pages[0].CanEdit = true; bundle.Pages[0].CanView = false;
Check(!CrmAccessService.CanAssignProjects(bundle), "Edit without View excluded");
bundle.Pages[0].CanView = true; bundle.AccessibleModules.Clear();
Check(!CrmAccessService.CanAssignProjects(bundle), "Missing CRM access excluded");
using var db = new CommonDbContext(new DbContextOptionsBuilder<CommonDbContext>().UseSqlServer("Server=unused;Database=unused;Integrated Security=true").Options);
var sql = CrmAccessService.ProjectCandidates(db, "TEST-SITE").ToQueryString();
Check(sql.Contains("TEST-SITE") && sql.Contains("EXISTS") && sql.Contains("Web_User") && sql.Contains("IS NULL"), "SQL candidate query preserves site/child access and nullable web compatibility");
foreach (var level in new[] { "U", "", "A" })
{
    var http = new DefaultHttpContext();
    http.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("UserLevel", level)], "test"));
    var context = new AuthorizationFilterContext(new ActionContext(http, new RouteData(), new ActionDescriptor()), []);
    await new AdminOnlyAttribute().OnAuthorizationAsync(context);
    Check(level == "A" ? context.Result is null : context.Result is ObjectResult { StatusCode: 403 }, $"UAM admin guard for role '{level}'");
    if (context.Result is ObjectResult denied)
        Check(System.Text.Json.JsonSerializer.SerializeToElement(denied.Value).GetProperty("code").GetString() == "permission_denied", "Admin denial identifies a permission error rather than a license failure");
}
var loginController = typeof(CommonDbContext).Assembly.GetTypes().Single(type => type.Name == "LoginController");
Check(loginController.GetMethod("DeleteUser")!.IsDefined(typeof(AdminOnlyAttribute), true), "Delete endpoint requires administrator access");
Check(loginController.GetMethod("BatchSaveUserRights")!.IsDefined(typeof(AdminOnlyAttribute), true), "Rights endpoint requires administrator access");

async Task CheckHrAccess(string route, string[] granted, bool expected, string level = "U", bool authenticated = true)
{
    var http = new DefaultHttpContext();
    http.Request.Method = "GET";
    if (authenticated) http.User = new ClaimsPrincipal(new ClaimsIdentity([
        new Claim(ClaimTypes.NameIdentifier, "LimitedUsr"), new Claim("Site", "TEST"), new Claim("UserLevel", level)], "test"));
    var descriptor = new ControllerActionDescriptor {
        ControllerName = "Define", ControllerTypeInfo = typeof(DefineController).GetTypeInfo(),
        AttributeRouteInfo = new Microsoft.AspNetCore.Mvc.Routing.AttributeRouteInfo { Template = route }
    };
    var action = new ActionContext(http, new RouteData(), descriptor);
    var executing = new ActionExecutingContext(action, [], new Dictionary<string, object?>(), new object());
    var invoked = false;
    await new PermissionAuthorizeFilter(new GrantedPages(granted)).OnActionExecutionAsync(executing, () => {
        invoked = true;
        return Task.FromResult(new ActionExecutedContext(action, [], new object()));
    });
    Check(invoked == expected, $"HR API {route}, grants [{string.Join(',', granted)}], role {level}, authenticated {authenticated}");
    if (!expected) Check(executing.Result is ObjectResult { StatusCode: 401 or 403 }, "Denied HR requests stop before controller execution");
}
await CheckHrAccess("api/hr/define/employee/{empId}", ["Department"], false);
await CheckHrAccess("api/hr/define/department/{id}", ["Department"], true);
await CheckHrAccess("api/hr/define/employee/{empId}", [], false);
await CheckHrAccess("api/hr/define/employee/{empId}", [], true, "A");
await CheckHrAccess("api/hr/define/employee/{empId}", ["Employee"], false, authenticated: false);
await CheckHrAccess("api/hr/transaction/Salary/report/salary", ["Employee"], false);
await CheckHrAccess("api/hr/transaction/Salary/report/salary", ["Salary Report"], true);
await CheckHrAccess("api/LeaveApproval/pending", ["Leave Application"], false);
await CheckHrAccess("api/hr/transaction/Leave/master/{applicationNo}", ["Leave Application"], true);
await CheckHrAccess("api/hr/define/employee/list", ["Leave Application"], true);
await CheckHrAccess("api/hr/define/new-resource/list", ["Employee"], false);
Check(HrPagePermissions.Normalize("Employees Page") == HrPagePermissions.Normalize("Employee"), "Legacy employee catalog names agree");
Check(HrPagePermissions.Normalize("Bank (HR)") == HrPagePermissions.Normalize("Bank Page"), "Bank navigation and catalog names agree");
var savedWithoutCatalog = HrPermissionCatalog.Saved([
    new TblUserRight { UserId = "LimitedUsr", Site = "TEST", Software = "HRMS", Year = "2026", Name = "Employees Page", Enter = true, Delition = true },
    new TblUserRight { UserId = "LimitedUsr", Site = "TEST", Software = "HRMS", Year = "2025", Name = "Employee", Enter = false },
    new TblUserRight { UserId = "LimitedUsr", Site = "TEST", Software = "HRMS", Year = "2026", Name = "Leave Application", Enter = true }
], []);
Check(savedWithoutCatalog.Count == 2, "Legacy HR aliases and year duplicates produce one page each");
Check(savedWithoutCatalog.Single(row => row.RightsName == "Employee") is { Enter: true, Deletion: true }, "Saved view/delete grants survive an empty HR catalog");
Check(savedWithoutCatalog.Single(row => row.FormName == "Leave Application").Enter, "Leave grant survives a missing catalog join");
Check(HrPermissionCatalog.Forms().Any(form => form.RightsName == "Leave Approval"), "Built-in catalog supports editing saved HR grants");

// Optional diagnostic: reads existing rights and validates both consumers; never writes to the database.
if (args.Length == 4 && args[0] == "--verify-hrms-read-only")
{
    using var settings = System.Text.Json.JsonDocument.Parse(File.ReadAllText(args[3]), new System.Text.Json.JsonDocumentOptions { CommentHandling = System.Text.Json.JsonCommentHandling.Skip, AllowTrailingCommas = true });
    var connection = settings.RootElement.GetProperty("ConnectionStrings").GetProperty("CommonConnection").GetString();
    using var actualDb = new CommonDbContext(new DbContextOptionsBuilder<CommonDbContext>().UseSqlServer(connection).Options);
    using var memory = new Microsoft.Extensions.Caching.Memory.MemoryCache(new Microsoft.Extensions.Caching.Memory.MemoryCacheOptions());
    var service = new PermissionService(actualDb, memory);
    var dal = (SaftProject.Interface.Login.ILoginDAL)Activator.CreateInstance(typeof(SaftProject.DAL.Login.LoginDAL), actualDb, null, null, service)!;
    var saved = await dal.GetSavedRightsAsync(args[1], "2026", "HRMS", args[2]);
    var forms = await dal.GetFormNamesAsync("HRMS");
    var actualBundle = await service.GetUserPermissionBundleAsync(args[1], args[2], "U");
    Check(forms.Count > 0, "Actual HR permission editor has a catalog");
    Check(saved.Any(row => row.Enter), "Actual account has saved HR View grants");
    foreach (var row in saved)
    {
        var page = actualBundle.Pages.Single(page => page.Software == "HRMS" && HrPagePermissions.Normalize(page.PageName) == HrPagePermissions.Normalize(row.FormName));
        Check(page.CanView == row.Enter && page.CanDelete == row.Deletion, "Actual editor rights match login bundle");
        Check(await service.HasPermissionAsync(args[1], args[2], "U", "HRMS", row.RightsName ?? row.FormName, PermissionAction.View) == row.Enter, "Actual API authorization matches saved View permission");
    }
    Console.WriteLine($"PASS read-only HRMS verification: {saved.Count} saved pages, {saved.Count(row => row.Enter)} View grants. No database changes.");
}
Console.WriteLine($"PASS {checks} project assignee and UAM authorization checks. No database changes.");

sealed class GrantedPages(string[] pages) : IPermissionService
{
    public Task<bool> HasPermissionAsync(string userId, string site, string userLevel, string software, string pageName, PermissionAction action, string year = "")
        => Task.FromResult(pages.Contains(pageName));
    public Task<UserPermissionBundleDto> GetUserPermissionBundleAsync(string userId, string site, string userLevel)
        => throw new NotSupportedException();
    public void InvalidateUserPermissions(string userId, string site) => throw new NotSupportedException();
}
