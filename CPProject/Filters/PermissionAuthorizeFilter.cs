using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SaftProject.Attributes;
using SaftProject.Interface;
using SaftProject.Models;
using SaftProject.Services;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace SaftProject.Filters;

/// <summary>
/// Global ASP.NET Core action filter that enforces [RequirePermission] attributes.
///
/// When a controller action is decorated with [RequirePermission(software, page, action)],
/// this filter:
///   1. Skips if the user is an Admin (UserLevel claim == "A").
///   2. Reads the userId, site, userLevel from the validated JWT claims.
///   3. Calls IPermissionService to evaluate rights (using cached data).
///   4. Returns 403 Forbidden with a standardized JSON message if access is denied.
///
/// If no [RequirePermission] attribute is present, the filter passes through.
/// JWT validity is enforced separately by the [Authorize] attribute.
/// </summary>
public class PermissionAuthorizeFilter : IAsyncActionFilter
{
    private readonly IPermissionService _permissionService;

    public PermissionAuthorizeFilter(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Look for [RequirePermission] on the action or controller
        var permAttr = context.ActionDescriptor.EndpointMetadata
            .OfType<RequirePermissionAttribute>()
            .FirstOrDefault();

        var hrPages = HrPagePermissions.RequiredPages(context.ActionDescriptor as ControllerActionDescriptor,
            context.HttpContext.Request.Method);

        // HR controllers live in a separate assembly and use the central route catalog.
        if (permAttr == null && hrPages == null)
        {
            await next();
            return;
        }

        // Extract claims from the validated JWT token
        var user      = context.HttpContext.User;
        var userId    = user.FindFirst("sub")?.Value
                     ?? user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? "";
        var site      = user.FindFirst("Site")?.Value ?? "";
        var userLevel = user.FindFirst("UserLevel")?.Value ?? "";

        if (string.IsNullOrEmpty(userId))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                statusCode = 401,
                message    = "Authentication required."
            });
            return;
        }

        // Check permission
        var allowed = false;
        if (permAttr != null)
            allowed = await _permissionService.HasPermissionAsync(userId, site, userLevel,
                permAttr.Software, permAttr.PageName, permAttr.Action);
        else if (string.Equals(userLevel, "A", StringComparison.OrdinalIgnoreCase))
            allowed = true;
        else
            foreach (var page in hrPages!)
                if (await _permissionService.HasPermissionAsync(userId, site, userLevel, "HRMS", page, PermissionAction.View))
                {
                    allowed = true;
                    break;
                }

        if (!allowed)
        {
            context.Result = new ObjectResult(new
            {
                statusCode = 403,
                code       = "permission_denied",
                message    = permAttr != null
                    ? $"Access Denied: You do not have '{permAttr.Action}' permission for '{permAttr.PageName}'."
                    : "Access Denied: You do not have View permission for this HRMS page."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        await next();
    }
}
