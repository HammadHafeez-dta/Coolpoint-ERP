using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class MachineAttendance
{
    public int? EmpCardNo { get; set; }

    public DateTime? InDate { get; set; }

    public DateTime? OutDate { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public bool InStatus { get; set; }

    public byte[]? InImage { get; set; }

    public bool OutStatus { get; set; }

    public byte[]? OutImage { get; set; }

    public bool Action { get; set; }

    public int? LateAllowed { get; set; }

    public int? LateArrival { get; set; }

    public int? EarlyGoing { get; set; }

    public bool? Absent { get; set; }

    public decimal? HoursToWork { get; set; }

    public decimal? LateMinutes { get; set; }

    public decimal? EarlyMinutes { get; set; }

    public decimal? OverTimeMinutes { get; set; }

    public double? LeaveDeducted { get; set; }

    public string? Remarks { get; set; }

    public bool? LateArrivalDeducted { get; set; }

    public string? AttendanceType { get; set; }

    public string? LateArrivalApprovalStatus { get; set; }

    public string? EarlyGoneApprovalStatus { get; set; }

    public bool? EarlyGoingDeducted { get; set; }

    public string? LateEarlyReason { get; set; }

    public long RecordNo { get; set; }
}
