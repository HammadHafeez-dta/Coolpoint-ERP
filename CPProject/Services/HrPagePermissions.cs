using Microsoft.AspNetCore.Mvc.Controllers;

namespace SaftProject.Services;

/// <summary>Page requirements for HR controllers hosted from the separate HR assembly.</summary>
public static class HrPagePermissions
{
    public static string Normalize(string page)
    {
        var key = page.Trim().ToLowerInvariant();
        if (key.EndsWith(" page")) key = key[..^5];
        return key switch
        {
            "employees" => "employee", "bank (hr)" => "bank", "salary reports" => "salary report",
            "gazetted holiday report" => "gazetted leaves", "employee opening balances" => "opening balances",
            _ => key
        };
    }

    // Shared selectors support authorized forms; they do not grant access to their source page.
    private static readonly string[] EmployeeConsumers = ["Employee", "Opening Balances", "Leave Application", "Leave Approval",
        "Leave Balance Adjustment", "Duty Timings", "Rest Day", "Manual Attendance", "Update Attendance", "Loan & Advances",
        "Final Settlement", "Overtime", "Process Salary", "Salary Breakup", "Employee Reports", "Salary Report", "Salary Slip",
        "Salary Summary Report", "Daily Attendance Report", "Attendance Register Report", "Employee Time Card Report",
        "Employee Duty Timing Report", "Attendance Summary & Options", "Leave Application Report", "Leave Ledger Report",
        "Leave Register Report", "Loan Report", "Loan Register Report", "Loan Ledger Report", "Final Settlement Report", "Overtime Report", "Advance Salary Report"];

    public static string[]? RequiredPages(ControllerActionDescriptor? action, string method)
    {
        if (action?.ControllerTypeInfo.Namespace?.StartsWith("SaftHR.API.Controller", StringComparison.Ordinal) != true)
            return null;
        var route = action.AttributeRouteInfo?.Template?.Trim('/').ToLowerInvariant() ?? "";
        // Attendance devices use a separate machine protocol, not the interactive HR workspace.
        if (action.ControllerName == "ZkTecoADMS") return null;
        return ForRoute(route, method);
    }

    public static string[] ForRoute(string route, string method)
    {
        route = route.Trim('/').ToLowerInvariant();
        if (route.StartsWith("api/leaveapproval")) return ["Leave Approval"];
        if (route.StartsWith("api/hr/define/"))
        {
            var rest = route[14..];
            var resource = rest.Split('/')[0];
            if (resource == "employee")
            {
                if (rest.Contains("/report/")) return ["Employee Reports"];
                if (rest.Contains("opening-balances") || rest.Contains("pf-opening")) return ["Opening Balances"];
                if (rest.Contains("salary")) return ["Salary Breakup", "Employee"];
                if (method == "GET" && (rest == "employee/list" || rest.EndsWith("/lite"))) return EmployeeConsumers;
                return ["Employee"];
            }
            var page = resource switch
            {
                "department" => "Department", "designation" => "Designation", "location" => "Location", "grade" => "Grade",
                "shift" => "Shift", "bank" => "Bank", "scale" => "Scale", "category" => "Category", "status" => "Status",
                _ => ""
            };
            if (page.Length == 0) return []; // New endpoints require an explicit catalog mapping.
            if (method == "GET" && rest.EndsWith("/list")) return [page, .. EmployeeConsumers];
            return [page];
        }
        const string prefix = "api/hr/transaction/";
        if (!route.StartsWith(prefix)) return [];
        var parts = route[prefix.Length..].Split('/');
        var endpoint = string.Join('/', parts.Skip(1));
        return parts[0] switch
        {
            "dutytiming" => ["Duty Timings"], "restday" => ["Rest Day"],
            "settlement" => [endpoint.StartsWith("report/") ? "Final Settlement Report" : "Final Settlement"],
            "loan" => endpoint switch
            {
                "report/register" => ["Loan Register Report", "Loan Report"], "report/ledger" => ["Loan Ledger Report"],
                _ => ["Loan & Advances"]
            },
            "leave" => endpoint switch
            {
                "report/application" => ["Leave Application Report"], "report/ledger" => ["Leave Ledger Report"],
                "report/register" => ["Leave Register Report"], "adjustment" => ["Leave Balance Adjustment"],
                _ when endpoint.StartsWith("gazetted/") || endpoint == "gazetted" => ["Gazetted Leaves"],
                _ when method == "GET" && (endpoint == "types" || endpoint.StartsWith("balance/")) => ["Leave Application", "Leave Approval", "Leave Balance Adjustment"],
                _ => ["Leave Application"]
            },
            "salary" => endpoint switch
            {
                "report/salary" => ["Salary Report"], "report/slips" => ["Salary Slip", "Salary Report"],
                "report/summary" => ["Salary Summary Report", "Salary Report"],
                _ when endpoint.StartsWith("report/") => ["Salary Report"],
                _ when endpoint.StartsWith("overtime/") => ["Overtime"],
                _ when endpoint.StartsWith("breakup/") => ["Salary Breakup"],
                _ => ["Process Salary"]
            },
            "attendance" => endpoint switch
            {
                "report/daily" or "daily-report" => ["Daily Attendance Report"],
                "report/machine" => ["Machine Attendance Report"], "report/register" => ["Attendance Register Report"],
                "report/overtime" => ["Overtime Report"], "report/time-card" => ["Employee Time Card Report"],
                "report/duty-timing" => ["Employee Duty Timing Report"],
                _ when endpoint.StartsWith("report/") => ["Attendance Summary & Options"],
                _ when endpoint.StartsWith("machine/") => ["Manual Attendance"],
                "machine" => ["Attendance Machine", "Manual Attendance", "Update Attendance"],
                _ => ["Update Attendance", "Manual Attendance"]
            },
            _ => []
        };
    }
}
