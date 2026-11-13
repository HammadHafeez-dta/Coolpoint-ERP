using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class DailyAttendance
{
    public int? EmpCardNo { get; set; }

    public string? Site { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public DateTime? InDate { get; set; }

    public DateTime? OutDate { get; set; }

    public int? LateArrival { get; set; }

    public int? EarlyGoing { get; set; }

    public bool? Absent { get; set; }

    public decimal? HoursToWork { get; set; }

    public int? Inoutno { get; set; }

    public int? TotalSeconds { get; set; }

    public string? Remarks { get; set; }

    public decimal? TotalHours { get; set; }

    public long RecordNo { get; set; }

    public string? Enterby { get; set; }

    public decimal? TotalLate { get; set; }

    public double? LeaveDeducted { get; set; }

    public decimal? OverTimeMinutes { get; set; }
}
