using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using CPCRM.API.Controller;
using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using CPCRM.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

static class ProjectChecks
{
    public static async Task<int> Run(CRMDbContext db)
    {
        var checks = 0;
        void Check(bool condition, string name) { if (!condition) throw new Exception("Project check failed: " + name); checks++; }
        Check(CrmProjectService.Progress([]) == "NotStarted", "empty project");
        Check(CrmProjectService.Progress(["Todo", "Todo"]) == "NotStarted", "all pending");
        Check(CrmProjectService.Progress(["Todo", "Done"]) == "InProgress", "mixed tasks");
        Check(CrmProjectService.Progress(["Done", "Done"]) == "Completed", "all complete");
        Check(CrmProjectService.Progress(["Done", "InProgress"]) == "InProgress", "reopen task");
        foreach (var status in new[] { "Todo", "InProgress", "Done" }) { CrmProjectService.ValidateStatus(status); checks++; }
        try { CrmProjectService.ValidateStatus("Review"); throw new Exception("Invalid status accepted"); } catch (ArgumentException) { checks++; }
        var invalid = new ProjectTaskInput { Title = new string('a', 251), AssigneeUserId = "" };
        Check(!Validator.TryValidateObject(invalid, new ValidationContext(invalid), [], true), "required assignee and title length");
        var access = new FakeAccess { Allow = true };
        var service = new CrmProjectService(db, access);
        var limited = new CrmActor("limited-user", "SITE-A", "U");
        var admin = new CrmActor("admin", "SITE-A", "A");
        var projectsSql = service.VisibleProjects(limited).ToQueryString();
        Check(projectsSql.Contains("SITE-A") && projectsSql.Contains("limited-user") && projectsSql.Contains("EXISTS"), "only projects with own assigned tasks");
        var tasksSql = service.VisibleTasks(5, limited).ToQueryString();
        Check(tasksSql.Contains("SITE-A") && tasksSql.Contains("limited-user") && tasksSql.Contains("[ProjectId] = @"), "task identity/site/project filtering");
        Check(!service.VisibleTasks(5, admin).ToQueryString().Contains("[AssigneeUserId] ="), "admin sees site board");
        var projectModel = db.Model.FindEntityType(typeof(CrmProject))!;
        Check(projectModel.GetIndexes().Any(i => i.IsUnique && i.Properties.SingleOrDefault()?.Name == "LeadId"), "one project per inquiry");
        Check(projectModel.FindProperty("LeadId")!.IsNullable && projectModel.GetIndexes().Any(i => i.IsUnique && i.GetFilter() == "[LeadId] IS NOT NULL"), "multiple standalone projects allowed without duplicate inquiry links");
        Check(db.Model.FindEntityType(typeof(CrmProjectTask))!.FindProperty("RowVersion")!.IsConcurrencyToken, "task concurrency");
        var controller = new CrmProjectsController(service, access) { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
        async Task Denied(Func<Task> action) { try { await action(); throw new Exception("Expected project denial"); } catch (UnauthorizedAccessException) { checks++; } }
        await Denied(() => controller.List(null));
        controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("sub", "limited-user"), new Claim("Site", "SITE-A"), new Claim("UserLevel", "U")], "Test"));
        await Denied(() => controller.Assignees());
        await Denied(() => controller.CreateProject(new ProjectInput { Title = "Not allowed" }));
        await Denied(() => controller.Create(1, new ProjectTaskInput()));
        await Denied(() => controller.Edit(1, 1, new ProjectTaskInput()));
        controller.Request.Headers["Site"] = "SITE-B";
        await Denied(() => controller.Detail(1));
        controller.Request.Headers.Remove("Site"); access.Allow = false;
        await Denied(() => controller.Move(1, 1, new ProjectTaskState { Status = "Done", RowVersion = "AQ==" }));
        return checks;
    }
}
