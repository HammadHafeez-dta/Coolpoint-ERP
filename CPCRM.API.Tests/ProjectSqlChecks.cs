using CPCRM.API.DAL;
using CPCRM.API.DTO;
using CPCRM.API.Interface;
using CPCRM.API.Models;
using CPCRM.API.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

// Opt-in: a SQL Server test login with CREATE DATABASE permission. Never uses app credentials.
// Creates and drops only its own uniquely named disposable database.
static class ProjectSqlChecks
{
    public static async Task<int> Run(string connection)
    {
        var name = "Coolpoint_Projects_Test_" + Guid.NewGuid().ToString("N");
        var master = new SqlConnectionStringBuilder(connection) { InitialCatalog = "master" };
        await using var host = new SqlConnection(master.ConnectionString); await host.OpenAsync();
        await new SqlCommand($"CREATE DATABASE [{name}]", host).ExecuteNonQueryAsync();
        var target = new SqlConnectionStringBuilder(connection) { InitialCatalog = name };
        CRMDbContext Context() => new(new DbContextOptionsBuilder<CRMDbContext>().UseSqlServer(target.ConnectionString).Options);
        var checks = 0;
        void Check(bool condition, string message) { if (!condition) throw new Exception("SQL project check: " + message); checks++; }
        try {
            await using var db = Context();
            var root = new DirectoryInfo(AppContext.BaseDirectory); while (root != null && !Directory.Exists(Path.Combine(root.FullName, "sql"))) root = root.Parent;
            async Task Install(string file) {
                var script = File.ReadAllText(Path.Combine(root!.FullName, "sql", file)).Replace("Coolpoint_CRM", name);
                foreach (var batch in System.Text.RegularExpressions.Regex.Split(script, @"^GO\s*$", System.Text.RegularExpressions.RegexOptions.Multiline | System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                    if (!string.IsNullOrWhiteSpace(batch)) await db.Database.ExecuteSqlRawAsync(batch);
            }
            await Install("00_crm_base_tables.sql"); await Install("02_crm_schema.sql"); await Install("09_crm_projects.sql");
            var admin = new CrmActor("administrator", "TEST", "A");
            var worker = new CrmActor("worker", "TEST", "U");
            var access = new FakeAccess { Allow = true, Assignees = [new CrmOwner("worker", "Worker"), new CrmOwner("other", "Other worker")] };
            var lifecycle = new CrmLifecycleService(db, new CrmDAL(db));
            var projects = new CrmProjectService(db, access);
            var lead = new CrmLead { Site = "TEST", Title = "Initial qualified", CustomerName = "Test client", LifecycleStatus = "Qualified", LeadNumber = Guid.NewGuid().ToString() };
            db.CrmLeads.Add(lead); await db.SaveChangesAsync();
            await using (var tx = await db.Database.BeginTransactionAsync()) { await CrmProjectService.EnsureQualified(db, lead, admin); await CrmProjectService.EnsureQualified(db, lead, admin); await tx.CommitAsync(); }
            Check(await db.CrmProjects.CountAsync() == 1, "repeated conversion creates exactly one project");
            var project = await db.CrmProjects.SingleAsync();
            await projects.SaveTask(project.Id, null, new ProjectTaskInput { Title = "Commission unit", AssigneeUserId = "worker" }, admin);
            var task = await db.CrmProjectTasks.SingleAsync(); var firstVersion = Convert.ToBase64String(task.RowVersion);
            await projects.Move(project.Id, task.Id, new ProjectTaskState { Status = "Done", RowVersion = firstVersion }, worker);
            Check(task.Status == "Done", "worker status persists");
            Check(await db.CrmProjectTaskEvents.CountAsync() == 2, "creation/status audit rows persist");
            try { await projects.Move(project.Id, task.Id, new ProjectTaskState { Status = "Todo", RowVersion = firstVersion }, worker); throw new Exception("Stale write accepted"); } catch (CrmConflict) { checks++; }
            try { await projects.Move(project.Id, task.Id, new ProjectTaskState { Status = "Todo", RowVersion = Convert.ToBase64String(task.RowVersion) }, new CrmActor("other", "TEST", "U")); throw new Exception("Other user's task changed"); } catch (CrmMissing) { checks++; }
            try { await projects.Detail(project.Id, new CrmActor("administrator", "OTHER", "A")); throw new Exception("Other site visible"); } catch (CrmMissing) { checks++; }
            await projects.SaveTask(project.Id, task.Id, new ProjectTaskInput { Title = task.Title, AssigneeUserId = "other", RowVersion = Convert.ToBase64String(task.RowVersion) }, admin);
            Check(!await projects.VisibleTasks(project.Id, worker).AnyAsync(), "reassignment removes prior assignee access");
            try { await projects.SaveTask(project.Id, null, new ProjectTaskInput { Title = "Invalid assignee", AssigneeUserId = "not-eligible" }, admin); throw new Exception("Invalid assignee accepted"); } catch (ArgumentException) { checks++; }
            await lifecycle.LeadState(lead.Id, new StateCommand { Stage = "Disqualified", RowVersion = Convert.ToBase64String(lead.RowVersion) }, admin);
            Check(await db.CrmProjects.CountAsync() == 1 && await db.CrmProjectTasks.CountAsync() == 1, "disqualification preserves work");

            // A genuinely concurrent status edit: only one supplied row version can win.
            db.ChangeTracker.Clear(); var current = await db.CrmProjectTasks.AsNoTracking().SingleAsync();
            async Task<bool> ConcurrentMove(string status) {
                await using var contender = Context();
                try { await new CrmProjectService(contender, access).Move(project.Id, current.Id, new ProjectTaskState { Status = status, RowVersion = Convert.ToBase64String(current.RowVersion) }, admin); return true; }
                catch (Exception e) when (e is CrmConflict or DbUpdateConcurrencyException) { return false; }
            }
            var outcomes = await Task.WhenAll(ConcurrentMove("Todo"), ConcurrentMove("InProgress"));
            Check(outcomes.Count(x => x) == 1, "concurrent task updates have one winner");

            // Run the shipped migration twice against existing rows to check historical backfill.
            var historical = new CrmLead { Site = "TEST", Title = "Historical", CustomerName = "Test", LifecycleStatus = "Qualified", LeadNumber = Guid.NewGuid().ToString() };
            db.CrmLeads.Add(historical); await db.SaveChangesAsync();
            await Install("09_crm_projects.sql"); await Install("09_crm_projects.sql");
            Check(await db.CrmProjects.CountAsync(p => p.LeadId == historical.Id) == 1, "historical backfill is idempotent");

            await lifecycle.SaveLead(null, new LeadInput { Title = "Created qualified", CustomerName = "Test client", LifecycleStatus = "Qualified" }, admin);
            Check(await db.CrmProjects.AnyAsync(p => p.Title == "Created qualified"), "creating an inquiry as Qualified creates a project");
            await lifecycle.SaveLead(null, new LeadInput { Title = "Concurrent qualification", CustomerName = "Test client" }, admin);
            var pending = await db.CrmLeads.AsNoTracking().SingleAsync(l => l.Title == "Concurrent qualification");
            async Task<bool> Qualify() {
                await using var contender = Context();
                try { await new CrmLifecycleService(contender, new CrmDAL(contender)).LeadState(pending.Id, new StateCommand { Stage = "Qualified", RowVersion = Convert.ToBase64String(pending.RowVersion) }, admin); return true; }
                catch (Exception e) when (e is CrmConflict or DbUpdateConcurrencyException) { return false; }
            }
            var conversions = await Task.WhenAll(Qualify(), Qualify());
            Check(conversions.Count(x => x) == 1 && await db.CrmProjects.CountAsync(p => p.LeadId == pending.Id) == 1, "concurrent qualification creates one project");
            db.ChangeTracker.Clear(); var qualified = await db.CrmLeads.SingleAsync(l => l.Id == pending.Id);
            await lifecycle.LeadState(qualified.Id, new StateCommand { Stage = "Qualified", RowVersion = Convert.ToBase64String(qualified.RowVersion) }, admin);
            Check(await db.CrmProjects.CountAsync(p => p.LeadId == pending.Id) == 1, "repeated qualification remains idempotent");
            await lifecycle.SaveLead(null, new LeadInput { Title = "Rollback qualification", CustomerName = "Test client" }, admin);
            var rollbackLead = await db.CrmLeads.SingleAsync(l => l.Title == "Rollback qualification");
            await using (var tx = await db.Database.BeginTransactionAsync()) {
                rollbackLead.LifecycleStatus = "Qualified"; await db.SaveChangesAsync();
                await CrmProjectService.EnsureQualified(db, rollbackLead, admin); await tx.RollbackAsync();
            }
            await using (var verify = Context()) Check(!await verify.CrmProjects.AnyAsync(p => p.LeadId == rollbackLead.Id)
                && (await verify.CrmLeads.FindAsync(rollbackLead.Id))!.LifecycleStatus == "New", "qualification and project roll back together");
            db.ChangeTracker.Clear();
            // Reproduce the originally shipped schema before exercising its upgrade.
            await db.Database.ExecuteSqlRawAsync("DROP INDEX UX_CRM_Projects_LeadId ON dbo.CRM_Projects; ALTER TABLE dbo.CRM_Projects ALTER COLUMN LeadId int NOT NULL; ALTER TABLE dbo.CRM_Projects ADD CONSTRAINT UQ_CRM_Projects_Lead UNIQUE(LeadId);");
            await Install("11_crm_manual_projects.sql"); await Install("11_crm_manual_projects.sql");
            var standalone = await projects.Create(new ProjectInput { Title = "Manual installation", CustomerName = "Test client" }, admin);
            var secondStandalone = await projects.Create(new ProjectInput { Title = "Another manual project" }, admin);
            Check(standalone != secondStandalone && await db.CrmProjects.CountAsync(p => p.LeadId == null) == 2, "multiple standalone projects persist");
            await projects.SaveTask(standalone, null, new ProjectTaskInput { Title = "Standalone task", AssigneeUserId = "worker" }, admin);
            Check(await projects.VisibleProjects(worker).AnyAsync(p => p.Id == standalone), "standalone task uses normal ownership access");
            try { await projects.Create(new ProjectInput { Title = "Limited project" }, worker); throw new Exception("Limited account created a project"); } catch (UnauthorizedAccessException) { checks++; }
            Console.WriteLine($"PASS {checks} live SQL Projects checks in disposable database."); return checks;
        } finally {
            SqlConnection.ClearAllPools();
            await new SqlCommand($"ALTER DATABASE [{name}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{name}]", host).ExecuteNonQueryAsync();
        }
    }
}
