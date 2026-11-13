using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class AttendanceRegister
{
    public int? EmpCardNo { get; set; }

    public string? Site { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public string? AttnedanceType { get; set; }

    public int? TotalSeconds { get; set; }

    public decimal? TotalHours { get; set; }

    public decimal? OverTime { get; set; }

    public decimal? OverTimeManual { get; set; }

    public decimal? ShortTime { get; set; }

    public int? EarlyGone { get; set; }

    public int? LateArrival { get; set; }

    public decimal? TotalLate { get; set; }

    public double? LeaveDeducted { get; set; }

    public decimal? TotalDays { get; set; }

    public string? EnterBy { get; set; }

    public string? GlapprovalStatus { get; set; }

    public long RecordNo { get; set; }
}
