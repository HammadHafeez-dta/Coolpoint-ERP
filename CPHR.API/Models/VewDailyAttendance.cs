using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewDailyAttendance
{
    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? DepartmentName { get; set; }

    public string? DesignationName { get; set; }

    public string? Shift { get; set; }

    public DateTime? InDate { get; set; }

    public DateTime? OutDate { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public string? RestDay { get; set; }

    public string? InTime { get; set; }

    public string? OutTime { get; set; }

    public decimal? WorkingHours { get; set; }

    public bool? IsOverTime { get; set; }

    public long RecordNo { get; set; }

    public string? AttendanceType { get; set; }

    public DateTime? JoiningDate { get; set; }

    public byte[]? InImage { get; set; }

    public byte[]? OutImage { get; set; }

    public int? LateArrival { get; set; }

    public string? Remarks { get; set; }

    public int? LateAllowed { get; set; }

    public int? EarlyGoing { get; set; }

    public bool? Status { get; set; }

    public bool? Absent { get; set; }

    public string? LateArrivalApprovalStatus { get; set; }

    public string? EarlyGoneApprovalStatus { get; set; }

    public decimal? LateMinutes { get; set; }

    public decimal? EarlyMinutes { get; set; }

    public bool? LateArrivalDeducted { get; set; }

    public bool? EarlyGoingDeducted { get; set; }

    public string? LateEarlyReason { get; set; }
}
