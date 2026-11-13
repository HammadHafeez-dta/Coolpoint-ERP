using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CPCRM.API.Services;

public class CrmProjectService(CRMDbContext db, ICrmAccessService access)
{
    public static bool IsAdmin(CrmActor actor) => actor.UserLevel.Trim().Equals("A", StringComparison.OrdinalIgnoreCase);
    public static string Progress(IEnumerable<string> states)
    {
        var items = states.ToList();
        return items.Count == 0 || items.All(s => s == "Todo") ? "NotStarted" : items.All(s => s == "Done") ? "Completed" : "InProgress";
    }
    public static void ValidateStatus(string status)
    {
        if (status is not ("Todo" or "InProgress" or "Done")) throw new ArgumentException("Choose To do, In progress or Done.");
    }
    public static void Admin(CrmActor actor) { if (!IsAdmin(actor)) throw new UnauthorizedAccessException(); }
    public async Task<int> Create(ProjectInput input, CrmActor actor)
    {
        Admin(actor);
        if (string.IsNullOrWhiteSpace(input.Title)) throw new ArgumentException("Enter a project name.");
        var project = new CrmProject { Title = input.Title.Trim(), CustomerName = string.IsNullOrWhiteSpace(input.CustomerName) ? null : input.CustomerName.Trim(),
            Site = actor.Site, CreatedBy = actor.UserId };
        db.CrmProjects.Add(project); await db.SaveChangesAsync(); return project.Id;
    }
    // Called only inside the inquiry command transaction, after the lead has been saved.
    public static async Task EnsureQualified(CRMDbContext db, CrmLead lead, CrmActor actor)
    {
        if (lead.LifecycleStatus != "Qualified" || await db.CrmProjects.AnyAsync(x => x.LeadId == lead.Id)) return;
        db.CrmProjects.Add(new CrmProject { LeadId = lead.Id, Site = actor.Site, Title = lead.Title,
            CustomerName = lead.CustomerName, CreatedBy = actor.UserId });
        await db.SaveChangesAsync();
    }
    public IQueryable<CrmProject> VisibleProjects(CrmActor actor) => db.CrmProjects.Where(p => p.Site == actor.Site
        && (IsAdmin(actor) || p.Tasks.Any(t => t.Site == actor.Site && t.AssigneeUserId == actor.UserId)));
    public IQueryable<CrmProjectTask> VisibleTasks(int projectId, CrmActor actor) => db.CrmProjectTasks.Where(t =>
        t.ProjectId == projectId && t.Site == actor.Site && (IsAdmin(actor) || t.AssigneeUserId == actor.UserId));

    private static object TaskView(CrmProjectTask task) => new {
        task.Id, task.ProjectId, task.Title, task.Description, task.AssigneeUserId, task.AssigneeName,
        task.Status, task.Priority, task.DueDate, task.CreatedAt, task.UpdatedAt, task.RowVersion
    };
    public async Task<object> List(CrmActor actor, string? search, int page, int pageSize)
    {
        var admin = IsAdmin(actor);
        var query = VisibleProjects(actor).AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(p => p.Title.Contains(search) || (p.CustomerName != null && p.CustomerName.Contains(search)));
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        var total = await query.CountAsync();
        var rows = await query.OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).Select(p => new {
                p.Id, p.Title, p.CustomerName, LeadId = admin ? (int?)p.LeadId : null, p.CreatedAt,
                States = p.Tasks.Where(t => admin || t.AssigneeUserId == actor.UserId).Select(t => t.Status).ToList()
            }).ToListAsync();
        return new { items = rows.Select(p => new { p.Id, p.Title, p.CustomerName, p.LeadId, p.CreatedAt,
            status = Progress(p.States), totalTasks = p.States.Count, doneTasks = p.States.Count(s => s == "Done"), personal = !admin }),
            totalCount = total, page, pageSize };
    }
    public async Task<object> Detail(int id, CrmActor actor)
    {
        var project = await VisibleProjects(actor).AsNoTracking().SingleOrDefaultAsync(p => p.Id == id) ?? throw new CrmMissing();
        var tasks = await VisibleTasks(id, actor).AsNoTracking().OrderBy(t => t.Id).ToListAsync();
        return new { project.Id, project.Title, project.CustomerName, LeadId = IsAdmin(actor) ? (int?)project.LeadId : null,
            status = Progress(tasks.Select(t => t.Status)), personal = !IsAdmin(actor), tasks = tasks.Select(TaskView) };
    }
    public async Task<object> SaveTask(int projectId, int? taskId, ProjectTaskInput input, CrmActor actor)
    {
        Admin(actor);
        if (string.IsNullOrWhiteSpace(input.Title) || input.Priority is not ("Low" or "Medium" or "High"))
            throw new ArgumentException("Enter a task title and choose Low, Medium or High priority.");
        var assignee = (await access.ProjectAssignees(actor.Site)).FirstOrDefault(u => u.UserId.Equals(input.AssigneeUserId, StringComparison.OrdinalIgnoreCase))
            ?? throw new ArgumentException("Choose a limited web user with CRM Projects View and Edit access at this site.");
        await using var tx = await db.Database.BeginTransactionAsync();
        if (!await db.CrmProjects.AnyAsync(p => p.Id == projectId && p.Site == actor.Site)) throw new CrmMissing();
        var task = taskId.HasValue ? await db.CrmProjectTasks.SingleOrDefaultAsync(t => t.Id == taskId && t.ProjectId == projectId && t.Site == actor.Site) ?? throw new CrmMissing()
            : new CrmProjectTask { ProjectId = projectId, Site = actor.Site, CreatedBy = actor.UserId };
        if (taskId.HasValue) CrmLifecycleService.Expected(task.RowVersion, input.RowVersion);
        var oldAssignee = task.AssigneeUserId;
        task.Title = input.Title.Trim(); task.Description = input.Description?.Trim(); task.Priority = input.Priority;
        task.DueDate = input.DueDate?.Date; task.AssigneeUserId = assignee.UserId; task.AssigneeName = assignee.Name;
        task.UpdatedAt = DateTime.UtcNow; task.UpdatedBy = actor.UserId;
        if (!taskId.HasValue) db.CrmProjectTasks.Add(task);
        await db.SaveChangesAsync();
        Audit(task, actor, taskId.HasValue ? "TaskEdited" : "TaskCreated", taskId.HasValue ? "Task details updated" : $"Task assigned to {assignee.UserId}");
        if (taskId.HasValue && !oldAssignee.Equals(assignee.UserId, StringComparison.OrdinalIgnoreCase))
            Audit(task, actor, "TaskReassigned", $"Assignment changed from {oldAssignee} to {assignee.UserId}");
        await db.SaveChangesAsync(); await tx.CommitAsync(); return TaskView(task);
    }
    public async Task<object> Move(int projectId, int taskId, ProjectTaskState input, CrmActor actor)
    {
        ValidateStatus(input.Status);
        await using var tx = await db.Database.BeginTransactionAsync();
        var task = await VisibleTasks(projectId, actor).SingleOrDefaultAsync(t => t.Id == taskId) ?? throw new CrmMissing();
        CrmLifecycleService.Expected(task.RowVersion, input.RowVersion);
        if (task.Status != input.Status) {
            var before = task.Status; task.Status = input.Status; task.UpdatedAt = DateTime.UtcNow; task.UpdatedBy = actor.UserId;
            Audit(task, actor, "TaskStatusChanged", $"Status changed from {before} to {task.Status}");
            await db.SaveChangesAsync();
        }
        await tx.CommitAsync(); return TaskView(task);
    }
    private void Audit(CrmProjectTask task, CrmActor actor, string type, string summary) => db.CrmProjectTaskEvents.Add(new() {
        TaskId = task.Id, Site = actor.Site, ActorUserId = actor.UserId, Type = type, Summary = summary
    });
}
