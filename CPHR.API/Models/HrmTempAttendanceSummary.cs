using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmTempAttendanceSummary
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public int? PresentDays { get; set; }

    public int? AbsentDays { get; set; }

    public int? LateDays { get; set; }

    public int? WithoutInDays { get; set; }
}
