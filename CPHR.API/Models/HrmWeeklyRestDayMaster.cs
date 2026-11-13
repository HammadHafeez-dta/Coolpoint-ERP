using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmWeeklyRestDayMaster
{
    public int TransNo { get; set; }
    public string Site { get; set; } = null!;
    public int DepartmentCode { get; set; }
    public string RestDays { get; set; } = null!;
    public string? Remarks { get; set; }
    public string? EnterBy { get; set; }
    public DateTime? EnteryTime { get; set; }
    public virtual ICollection<HrmWeeklyRestDayChild> Children { get; set; } = new List<HrmWeeklyRestDayChild>();
}
