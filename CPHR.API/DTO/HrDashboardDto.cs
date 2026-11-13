namespace SaftHR.API.DTO;

public record DashboardSection<T>(string Status, T? Data, string? Message = null) where T : class;
public record DashboardCount(string Label, int Count);
public record JoinerMonth(string Month, int Count);
public record WorkforceOverview(int ActiveEmployees, int MissingJoiningDates, List<JoinerMonth> Joiners, List<DashboardCount> Departments);
public record AttendanceOverview(int Total, List<DashboardCount> Buckets);
public record LeaveOverview(int OnLeave, int PendingRequests, string PendingFrom, string PendingTo);
public record HrActivity(string Id, string Employee, string Action, DateTime Date, string Status, string Href, int? EmployeeId = null);
public record HrEvent(string Id, string Title, string Detail, DateTime Date, string Kind, string Href);
public record HrDashboardRights(bool Employees, bool Attendance, bool Leaves, bool Holidays);
public record HrDashboardDto(string Today, string From, string To, string TimeZone, DateTimeOffset AsOf,
    DashboardSection<WorkforceOverview> Workforce, DashboardSection<AttendanceOverview> Attendance,
    DashboardSection<LeaveOverview> Leaves, DashboardSection<List<HrActivity>> EmployeeActivity,
    DashboardSection<List<HrActivity>> LeaveActivity, DashboardSection<List<HrEvent>> Holidays,
    DashboardSection<List<HrEvent>> ScheduledLeave);
