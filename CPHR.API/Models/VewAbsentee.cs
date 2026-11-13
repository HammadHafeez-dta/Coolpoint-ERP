using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewAbsentee
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? DesignationName { get; set; }

    public string? DepartmentName { get; set; }

    public string? Shift { get; set; }

    public string? RestDay { get; set; }

    public string? InTime { get; set; }

    public string? OutTime { get; set; }

    public DateTime? AttendanceDate { get; set; }
}
