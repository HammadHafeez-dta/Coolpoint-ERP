using Microsoft.AspNetCore.Mvc;
using SaftProject.Models;

namespace SaftProject.Attributes;

/// <summary>
/// Declares a permission requirement for a controller action.
/// The PermissionAuthorizeFilter will evaluate this attribute and
/// return 403 Forbidden if the calling user lacks the required permission.
///
/// Usage: [RequirePermission("FMS", "Define Class", PermissionAction.Add)]
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequirePermissionAttribute : Attribute
{
    public string Software { get; }
    public string PageName { get; }
    public PermissionAction Action { get; }

    public RequirePermissionAttribute(string software, string pageName, PermissionAction action)
    {
        Software = software;
        PageName = pageName;
        Action   = action;
    }
}
