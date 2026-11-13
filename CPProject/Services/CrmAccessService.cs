using CPCRM.API.Interface;
using Microsoft.EntityFrameworkCore;
using SaftProject.Interface;
using SaftProject.Models;
using System.Linq.Expressions;

namespace SaftProject.Services;

public class CrmAccessService(IPermissionService permissions, CommonDbContext common) : ICrmAccessService
{
    // Web-created legacy accounts have NULL Web_User; FALSE is an explicit opt-out.
    public static readonly Expression<Func<TblUser, bool>> LimitedWebUser = x =>
        x.UserId != null && x.UserId.Trim() != "" && x.WebUser != false
        && ((x.UserLevel != null && x.UserLevel.Trim().ToUpper() == "U") || x.TeacherId != null);

    public static IQueryable<TblUser> ProjectCandidates(CommonDbContext db, string site) => db.TblUsers.AsNoTracking()
        .Where(LimitedWebUser)
        .Where(x => x.Site == site || db.TblUsersChildren.Any(c => c.UserNo == x.UserNo && c.Site == site));

    public static bool CanAssignProjects(UserPermissionBundleDto bundle) =>
        bundle.AccessibleModules.Any(x => x.Trim().Equals("CRM", StringComparison.OrdinalIgnoreCase))
        && bundle.Pages.Any(p => p.Software.Trim().Equals("CRM", StringComparison.OrdinalIgnoreCase)
            && p.PageName.Trim().Equals("Projects", StringComparison.OrdinalIgnoreCase) && p.CanView && p.CanEdit);
    public Task<bool> Allowed(CrmActor actor, string page, string action) =>
        permissions.HasPermissionAsync(actor.UserId, actor.Site, actor.UserLevel, "CRM", page,
            Enum.Parse<PermissionAction>(action));

    public async Task<List<CrmOwner>> Owners(string site) => await common.TblUsers.AsNoTracking()
        .Where(x => x.Site == site && x.UserId != null && x.WebUser == true)
        .Select(x => new CrmOwner(x.UserId!, x.UserName ?? x.UserId!)).Distinct().ToListAsync();

    public async Task<List<CrmOwner>> ProjectAssignees(string site)
    {
        var candidates = await ProjectCandidates(common, site)
            .Select(x => new { x.UserId, x.UserName }).Distinct().ToListAsync();
        var result = new List<CrmOwner>();
        foreach (var candidate in candidates)
        {
            var bundle = await permissions.GetUserPermissionBundleAsync(candidate.UserId!, site, "U");
            if (CanAssignProjects(bundle))
                result.Add(new CrmOwner(candidate.UserId!, candidate.UserName ?? candidate.UserId!));
        }
        return result.DistinctBy(x => x.UserId, StringComparer.OrdinalIgnoreCase).OrderBy(x => x.Name).ToList();
    }
}
