using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SaftProject.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class AdminOnlyAttribute : Attribute, IAsyncAuthorizationFilter
{
    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var level = context.HttpContext.User.FindFirst("UserLevel")?.Value
            ?? context.HttpContext.User.FindFirst("userLevel")?.Value;
        if (string.Equals(level, "A", StringComparison.OrdinalIgnoreCase))
            return Task.CompletedTask;

        context.Result = new ObjectResult(new
        {
            statusCode = StatusCodes.Status403Forbidden,
            code = "permission_denied",
            message = "Administrator access is required for User Access Management."
        })
        {
            StatusCode = StatusCodes.Status403Forbidden
        };
        return Task.CompletedTask;
    }
}
