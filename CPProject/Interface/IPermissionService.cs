using SaftProject.Models;

namespace SaftProject.Interface;

/// <summary>
/// Evaluates a user's permission to perform a specific action on a page/module.
/// Acts as the backend source-of-truth for all permission checks.
/// Results are cached per (UserId, Site) for performance.
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// Returns true if the user has the requested action permission on the given page/software.
    /// Admin users (UserLevel = "A") always return true.
    /// </summary>
    Task<bool> HasPermissionAsync(string userId, string site, string userLevel, string software, string pageName, PermissionAction action, string year = "");

    /// <summary>
    /// Returns the complete structured permissions bundle for a user (all modules, pages, action flags).
    /// Used to hydrate the frontend permission store on login.
    /// </summary>
    Task<UserPermissionBundleDto> GetUserPermissionBundleAsync(string userId, string site, string userLevel);

    /// <summary>
    /// Invalidates all cached permissions for a specific user and site.
    /// Must be called whenever user rights are modified via the Admin screen.
    /// </summary>
    void InvalidateUserPermissions(string userId, string site);
}

// ──────────────────────────────────────────────────────────────────────────────
// DTO for structured permission bundle returned to the frontend
// ──────────────────────────────────────────────────────────────────────────────

public class UserPermissionBundleDto
{
    public string UserId    { get; set; } = string.Empty;
    public string Site      { get; set; } = string.Empty;
    public string UserLevel { get; set; } = string.Empty;
    public bool   IsAdmin   { get; set; }

    /// <summary>Software module IDs the user can access (e.g. "FMS", "HRMS", "Accounts").</summary>
    public List<string> AccessibleModules { get; set; } = new();

    /// <summary>Flat list of page permissions across all modules.</summary>
    public List<PagePermissionDto> Pages { get; set; } = new();
}

public class PagePermissionDto
{
    public string Software    { get; set; } = string.Empty;
    public string PageName    { get; set; } = string.Empty;
    public string? MainGroup  { get; set; }
    public bool   CanView     { get; set; }
    public bool   CanAdd      { get; set; }
    public bool   CanEdit     { get; set; }
    public bool   CanDelete   { get; set; }
    public bool   CanExport   { get; set; }
}
