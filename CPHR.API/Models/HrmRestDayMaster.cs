using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmRestDayMaster
{
    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public int DepartmentCode { get; set; }

    public DateTime RestDate { get; set; }

    public string RestDay { get; set; } = null!;

    public string? Remarks { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public virtual ICollection<HrmRestDayChild> Children { get; set; } = new List<HrmRestDayChild>();
}
