using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SaftProject.Interface;
using SaftProject.Models;
using SaftProject.Utilities;

namespace SaftProject.Services;

/// <summary>
/// Centralized permission evaluation service.
/// Reads from vew_UserRights and tbl_Users_Child (for module access).
/// Results are memory-cached per (UserId+Site) with a 10-minute sliding expiry.
/// Cache is explicitly invalidated when rights are updated via the Admin screen.
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly CommonDbContext _db;
    private readonly IMemoryCache    _cache;

    // Module soft-names as stored in tbl_Users_Child.Software_Name
    private static readonly IReadOnlyDictionary<string, string> SoftwareModuleMap =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "HRMS",     "Human Resources" },
            { "CRM",      "Commercial CRM" },
            { "UAM",      "User Access Management" },
        };

    public PermissionService(CommonDbContext db, IMemoryCache cache)
    {
        _db    = db;
        _cache = cache;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Single permission check (used by PermissionAuthorizeFilter per request)
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<bool> HasPermissionAsync(
        string userId, string site, string userLevel,
        string software, string pageName, PermissionAction action, string year = "")
    {
        // Admin users bypass all restrictions
        if (string.Equals(userLevel, "A", StringComparison.OrdinalIgnoreCase))
            return true;

        // Get or build the permission bundle from cache
        var bundle = await GetOrBuildBundleAsync(userId, site, userLevel);

        var page = bundle.Pages.FirstOrDefault(p =>
            string.Equals(p.Software, software, StringComparison.OrdinalIgnoreCase) &&
            (string.Equals(software, "HRMS", StringComparison.OrdinalIgnoreCase)
                ? HrPagePermissions.Normalize(p.PageName) == HrPagePermissions.Normalize(pageName)
                : string.Equals(p.PageName, pageName, StringComparison.OrdinalIgnoreCase)));

        if (page == null) return false;

        return action switch
        {
            PermissionAction.View   => page.CanView,
            PermissionAction.Add    => page.CanAdd,
            PermissionAction.Edit   => page.CanEdit,
            PermissionAction.Delete => page.CanDelete,
            PermissionAction.Export => page.CanExport,
            _                       => false
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Full permission bundle (sent to frontend on login / on demand)
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<UserPermissionBundleDto> GetUserPermissionBundleAsync(
        string userId, string site, string userLevel)
    {
        bool isAdmin = string.Equals(userLevel, "A", StringComparison.OrdinalIgnoreCase);

        if (isAdmin)
        {
            // Admin → grant everything for all known modules/pages
            return await BuildAdminBundleAsync(userId, site);
        }

        return await GetOrBuildBundleAsync(userId, site, userLevel);
    }

    public void InvalidateUserPermissions(string userId, string site)
    {
        _cache.Remove(CacheKey(userId, site));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────────────────────────

    private async Task<UserPermissionBundleDto> GetOrBuildBundleAsync(
        string userId, string site, string userLevel)
    {
        string key = CacheKey(userId, site);

        if (_cache.TryGetValue(key, out UserPermissionBundleDto? cached) && cached != null)
            return cached;

        var bundle = await BuildUserBundleAsync(userId, site, userLevel);

        _cache.Set(key, bundle, new MemoryCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromMinutes(10)
        });

        return bundle;
    }

    private async Task<UserPermissionBundleDto> BuildUserBundleAsync(
        string userId, string site, string userLevel)
    {
        // 1. Determine which software modules the user has access to
        var userModules = await _db.TblUsersChildren
            .Where(c => c.UserNo == _db.TblUsers
                .Where(u => u.UserId == userId && u.Site == site)
                .Select(u => (int?)u.UserNo)
                .FirstOrDefault()
                && c.Site == site)
            .Select(c => c.SoftwareName)
            .ToListAsync();

        // Also include the user's primary site module (from tbl_Users itself)
        var primaryUser = await _db.TblUsers
            .FirstOrDefaultAsync(u => u.UserId == userId && u.Site == site);

        var accessibleModules = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var mod in userModules)
        {
            if (WorkspaceModuleAccess.TryNormalize(mod, out var canonical))
                accessibleModules.Add(canonical);
        }

        // 2. Load all page rights for this user
        var rights = await _db.VewUserRights
            .Where(r => r.UserId == userId && r.Site == site && r.Software != "HRMS")
            .ToListAsync();

        // 3. Build page permissions
        var pages = rights.Select(r => new PagePermissionDto
        {
            Software  = r.Software,
            PageName  = r.Name,
            MainGroup = r.MainName,
            CanView   = r.Enter     ?? false,
            CanAdd    = r.Addition  ?? false,
            CanEdit   = r.Updation  ?? false,
            CanDelete = r.Delition  ?? false,
            // Export follows View unless a specific Export column is added later
            CanExport = r.Enter     ?? false,
        }).ToList();

        // The legacy view inner-joins the page catalog. Saved HRMS grants must
        // remain effective even when that catalog is empty or incomplete.
        var hrRights = await _db.TblUserRights.AsNoTracking()
            .Where(right => right.UserId == userId && right.Site == site && right.Software == "HRMS").ToListAsync();
        var hrForms = await _db.TblFormNames.AsNoTracking().Where(form => form.Software == "HRMS").ToListAsync();
        pages.AddRange(HrPermissionCatalog.Saved(hrRights, hrForms).Select(right => new PagePermissionDto {
            Software = "HRMS", PageName = right.FormName, MainGroup = right.MainName,
            CanView = right.Enter, CanAdd = right.Addition, CanEdit = right.Updation,
            CanDelete = right.Deletion, CanExport = right.Enter
        }));

        // 4. Derive accessible modules from rights (if a user has any page right, they can access that module)
        foreach (var p in pages.Where(p => p.CanView))
        {
            if (WorkspaceModuleAccess.TryNormalize(p.Software, out var canonical))
                accessibleModules.Add(canonical);
        }

        return new UserPermissionBundleDto
        {
            UserId           = userId,
            Site             = site,
            UserLevel        = userLevel,
            IsAdmin          = false,
            AccessibleModules = accessibleModules.ToList(),
            Pages            = pages
        };
    }

    private async Task<UserPermissionBundleDto> BuildAdminBundleAsync(string userId, string site)
    {
        // Admin gets all form names from the catalog with all permissions set to true
        var allForms = await _db.TblFormNames.ToListAsync();

        var pages = allForms.Select(f => new PagePermissionDto
        {
            Software  = f.Software,
            PageName  = f.RightsName ?? f.MainName ?? "",
            MainGroup = f.MainName,
            CanView   = true,
            CanAdd    = true,
            CanEdit   = true,
            CanDelete = true,
            CanExport = true,
        }).ToList();

        // Admin can access all known modules
        var allModules = SoftwareModuleMap.Keys.ToList();

        return new UserPermissionBundleDto
        {
            UserId            = userId,
            Site              = site,
            UserLevel         = "A",
            IsAdmin           = true,
            AccessibleModules = allModules,
            Pages             = pages
        };
    }

    private static string CacheKey(string userId, string site)
        => $"user_permissions::{userId.ToLowerInvariant()}::{site.ToLowerInvariant()}";
}
