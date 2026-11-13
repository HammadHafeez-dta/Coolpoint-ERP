using System.Security.Claims;
using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CPCRM.API.Controller;

[ApiController, Route("api/crm/projects"), Authorize, TypeFilter(typeof(CrmExceptionFilter))]
public class CrmProjectsController(CrmProjectService projects, ICrmAccessService access) : ControllerBase
{
    private async Task<CrmActor> Gate(string action = "View", bool adminOnly = false)
    {
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var site = User.FindFirstValue("Site");
        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(site)) throw new UnauthorizedAccessException();
        foreach (var value in new[] { Request.Headers["Site"].ToString(), Request.Headers["X-Site-Code"].ToString(), Request.Query["site"].ToString() })
            if (!string.IsNullOrEmpty(value) && !string.Equals(value, site, StringComparison.OrdinalIgnoreCase)) throw new UnauthorizedAccessException();
        var actor = new CrmActor(user, site, User.FindFirstValue("UserLevel") ?? "");
        if (adminOnly) CrmProjectService.Admin(actor);
        if (!await access.Allowed(actor, "Projects", "View") || !await access.Allowed(actor, "Projects", action)) throw new UnauthorizedAccessException();
        return actor;
    }
    [HttpGet] public async Task<IActionResult> List(string? search, int page = 1, int pageSize = 25) => Ok(await projects.List(await Gate(), search, page, pageSize));
    [HttpPost] public async Task<IActionResult> CreateProject(ProjectInput input) {
        var id = await projects.Create(input, await Gate("Add", true));
        return CreatedAtAction(nameof(Detail), new { id }, new { id });
    }
    [HttpGet("{id:int}")] public async Task<IActionResult> Detail(int id) => Ok(await projects.Detail(id, await Gate()));
    [HttpGet("assignees")] public async Task<IActionResult> Assignees() => Ok(await access.ProjectAssignees((await Gate(adminOnly: true)).Site));
    [HttpPost("{id:int}/tasks")] public async Task<IActionResult> Create(int id, ProjectTaskInput input) => Ok(await projects.SaveTask(id, null, input, await Gate("Add", true)));
    [HttpPatch("{id:int}/tasks/{taskId:int}")] public async Task<IActionResult> Edit(int id, int taskId, ProjectTaskInput input) => Ok(await projects.SaveTask(id, taskId, input, await Gate("Edit", true)));
    [HttpPost("{id:int}/tasks/{taskId:int}/status")] public async Task<IActionResult> Move(int id, int taskId, ProjectTaskState input) => Ok(await projects.Move(id, taskId, input, await Gate("Edit")));
}
