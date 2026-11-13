using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaftHR.API.DTO;
using SaftHR.API.Services;
using SaftProject.Interface;
using SaftProject.Models;

namespace SaftProject.Controller;

[ApiController, Authorize, Route("api/hr/dashboard")]
public class HrDashboardController(HrDashboardService dashboard, IPermissionService permissions) : ControllerBase
{
    [HttpGet("employees/{employeeId:int}/photo")]
    public async Task<IActionResult> Photo(int employeeId, CancellationToken ct)
    {
        var site = User.FindFirstValue("Site");
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(site) || string.IsNullOrWhiteSpace(user)) return Forbid();
        foreach (var supplied in new[] { Request.Query["site"].ToString(), Request.Headers["Site"].ToString(), Request.Headers["X-Site-Code"].ToString() })
            if (!string.IsNullOrEmpty(supplied) && !string.Equals(supplied, site, StringComparison.OrdinalIgnoreCase)) return Forbid();
        if (!await permissions.HasPermissionAsync(user, site, User.FindFirstValue("UserLevel") ?? "", "HRMS", "Employee", PermissionAction.View)) return Forbid();
        var bytes = await dashboard.EmployeePhoto(site, employeeId, ct);
        var contentType = bytes == null ? null : HrDashboardService.PhotoContentType(bytes);
        if (contentType == null) return NotFound();
        Response.Headers.CacheControl = "private, no-store";
        return File(bytes!, contentType);
    }
    [HttpGet]
    public async Task<IActionResult> Get(string? from, string? to, CancellationToken ct)
    {
        var site = User.FindFirstValue("Site");
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(site) || string.IsNullOrWhiteSpace(user)) return Forbid();
        foreach (var supplied in new[] { Request.Query["site"].ToString(), Request.Headers["Site"].ToString(), Request.Headers["X-Site-Code"].ToString() })
            if (!string.IsNullOrEmpty(supplied) && !string.Equals(supplied, site, StringComparison.OrdinalIgnoreCase)) return Forbid();
        var today = HrDashboardService.PakistanToday(DateTimeOffset.UtcNow);
        DateTime first = new(today.Year, today.Month, 1); first = first.AddMonths(-5);
        DateTime last = today;
        if ((from != null && !DateTime.TryParseExact(from, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out first)) ||
            (to != null && !DateTime.TryParseExact(to, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out last)))
            return BadRequest(new { message = "Use valid dates in yyyy-MM-dd format." });
        try { HrDashboardService.ValidatePeriod(first, last, today); }
        catch (ArgumentException e) { return BadRequest(new { message = e.Message }); }
        Task<bool> Can(string page) => permissions.HasPermissionAsync(user, site, User.FindFirstValue("UserLevel") ?? "", "HRMS", page, PermissionAction.View);
        // Reuse the existing Common permissions catalog, without adding a new grant.
        var rights = new HrDashboardRights(await Can("Employee"), await Can("Daily Attendance Report"), await Can("Leave Approval"), await Can("Gazetted Leaves"));
        if (!rights.Employees && !rights.Attendance && !rights.Leaves && !rights.Holidays) return Forbid();
        return Ok(await dashboard.Get(site, first, last, rights, ct));
    }
}
