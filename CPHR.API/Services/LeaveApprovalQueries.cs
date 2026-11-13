using SaftHR.API.Models;

namespace SaftHR.API.Services;

// Shared by the approval screen and its dashboard queue count.
public static class LeaveApprovalQueries
{
    public static IQueryable<HrmVewLeaf> Filter(IQueryable<HrmVewLeaf> query, string status, DateTime? fromDate, DateTime? toDate)
    {
        if (status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            // The approval screen presents whitespace-only values as Pending too.
            // Keep the SQL filter aligned with that display behavior.
            query = query.Where(l => l.LeaveApprovalStatus == null || l.LeaveApprovalStatus.Trim() == "");
        else if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            query = query.Where(l => l.LeaveApprovalStatus == "Approved");
        else if (status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
            query = query.Where(l => l.LeaveApprovalStatus == "Rejected");
        if (fromDate.HasValue) query = query.Where(l => l.FromDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(l => l.ToDate <= toDate.Value);
        return query;
    }
}
