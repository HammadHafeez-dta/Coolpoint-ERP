using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class TimeCard
{
    public int EmpCardNo { get; set; }

    public DateTime AttendanceDate { get; set; }

    public string? EmpName { get; set; }

    public string? Shift { get; set; }

    public DateTime? JoiningDate { get; set; }

    public string? DesgName { get; set; }

    public string? DeptName { get; set; }

    public string? EmployeeType { get; set; }

    public string? InTime { get; set; }

    public DateTime? InDate { get; set; }

    public DateTime? OutDate { get; set; }

    public int? LateArrival { get; set; }

    public string? AttnedanceType { get; set; }

    public int? Daycount { get; set; }

    public decimal? GrossPay { get; set; }

    public string? Remarks { get; set; }

    public int? EarlyGoing { get; set; }
}
