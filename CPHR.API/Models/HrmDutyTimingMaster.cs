using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmDutyTimingMaster
{
    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public int DepartmentCode { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string FromTime { get; set; } = null!;

    public string ToTime { get; set; } = null!;

    public string? Remarks { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public virtual ICollection<HrmDutyTimingChild> Children { get; set; } = new List<HrmDutyTimingChild>();
}
