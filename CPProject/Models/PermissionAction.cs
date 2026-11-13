namespace SaftProject.Models;

/// <summary>
/// Defines the possible action-level permission types checked by the
/// RequirePermissionAttribute and PermissionAuthorizeFilter.
/// </summary>
public enum PermissionAction
{
    View,
    Add,
    Edit,
    Delete,
    Export
}
