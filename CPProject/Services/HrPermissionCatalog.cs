using SaftProject.DTO.Login;
using SaftProject.Models;

namespace SaftProject.Services;

public static class HrPermissionCatalog
{
    private static readonly (string Group, string[] Pages)[] Groups = [
        ("Define", ["Employee", "Department", "Designation", "Grade", "Location", "Shift", "Bank", "Scale", "Category", "Status", "Opening Balances", "Applicant", "Recommendation Letter", "Confirmation Letter", "Performance", "Job Post"]),
        ("Transactions", ["Leave Application", "Leave Approval", "Leave Balance Adjustment", "Gazetted Leaves", "Rest Day", "Duty Timings", "Manual Attendance", "Update Attendance", "Attendance Machine", "Loan & Advances", "Overtime", "Final Settlement", "Process Salary", "Salary Breakup"]),
        ("Reports", ["Employee Reports", "Salary Report", "Salary Summary Report", "Salary Slip", "Daily Attendance Report", "Machine Attendance Report", "Attendance Register Report", "Employee Time Card Report", "Employee Duty Timing Report", "Attendance Summary & Options", "Overtime Report", "Leave Application Report", "Leave Ledger Report", "Leave Register Report", "Loan Report", "Loan Register Report", "Loan Ledger Report", "Advance Salary Report", "Final Settlement Report"]),
        ("Settings", ["Attendance Policy"])
    ];

    public static List<FormNameDto> Forms() => Groups.SelectMany(group => group.Pages.Select(page => (group.Group, Page: page)))
        .Select((page, index) => new FormNameDto { Id = -(index + 1), Software = "HRMS", MainName = page.Group, RightsName = page.Page }).ToList();

    // HRMS rights are not financial-year scoped. Choose one deterministic row for
    // legacy duplicates; saves update every matching legacy year together.
    public static List<UserRightResponseDto> Saved(IEnumerable<TblUserRight> rights, IEnumerable<TblFormName> forms)
    {
        var catalog = forms.Where(form => form.Software.Trim().Equals("HRMS", StringComparison.OrdinalIgnoreCase)).ToList();
        var fallback = Forms();
        return rights.GroupBy(right => HrPagePermissions.Normalize(right.Name))
            .Select(group => group.OrderByDescending(right => right.Year, StringComparer.Ordinal).First())
            .Select(right => {
                var form = catalog.FirstOrDefault(form => HrPagePermissions.Normalize(form.RightsName ?? "") == HrPagePermissions.Normalize(right.Name));
                var builtIn = fallback.FirstOrDefault(form => HrPagePermissions.Normalize(form.RightsName ?? "") == HrPagePermissions.Normalize(right.Name));
                return new UserRightResponseDto {
                    UserID = right.UserId, Site = right.Site, Software = right.Software, Year = right.Year, FormName = right.Name,
                    Enter = right.Enter ?? false, Addition = right.Addition ?? false, Updation = right.Updation ?? false,
                    Deletion = right.Delition ?? false, MainName = form?.MainName ?? builtIn?.MainName,
                    RightsName = form?.RightsName ?? builtIn?.RightsName ?? right.Name, Id = form?.Id ?? builtIn?.Id ?? 0
                };
            }).ToList();
    }
}
