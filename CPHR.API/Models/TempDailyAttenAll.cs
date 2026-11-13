using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class TempDailyAttenAll
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? DeptName { get; set; }

    public string? DesgName { get; set; }

    public string? Grade { get; set; }

    public string? Shift { get; set; }

    public string? RestDay { get; set; }

    public string? InTime { get; set; }

    public string? OutTime { get; set; }

    public decimal? WorkingHours { get; set; }

    public string? InDate { get; set; }

    public string? OutDate { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public string? AttendanceStatus { get; set; }

    public int SerialNo { get; set; }
}
