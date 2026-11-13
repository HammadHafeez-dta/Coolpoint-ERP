using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewAttendance
{
    public int EmpCardNo { get; set; }

    public int? TotalSeconds { get; set; }

    public DateTime? AttendanceDate { get; set; }

    public decimal? WorkingHours { get; set; }

    public bool? IsOverTime { get; set; }

    public bool? Absent { get; set; }
}
