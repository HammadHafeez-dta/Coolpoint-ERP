using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewAttendanceRegister
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? DesignationName { get; set; }

    public string? DepartmentName { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public string? AttnedanceType { get; set; }

    public string? Site { get; set; }

    public string? EnterBy { get; set; }

    public int? TotalSeconds { get; set; }

    public decimal? TotalHours { get; set; }

    public decimal? OverTime { get; set; }

    public string? Shift { get; set; }

    public int? DeptCode { get; set; }

    public long RecordNo { get; set; }

    public decimal? TotalDays { get; set; }

    public int? DesgCode { get; set; }

    public int? Grade { get; set; }

    public string? GradeName { get; set; }

    public string? SalaryUnit { get; set; }

    public decimal? TotalLate { get; set; }

    public int? EarlyGone { get; set; }

    public int? LateArrival { get; set; }

    public double? LeaveDeducted { get; set; }

    public decimal? ShortTime { get; set; }

    public bool? Status { get; set; }

    public string? GlapprovalStatus { get; set; }
}
