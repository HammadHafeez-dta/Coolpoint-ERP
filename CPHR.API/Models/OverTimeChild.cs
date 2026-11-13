using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class OverTimeChild
{
    public int OverTimeNo { get; set; }

    public string Site { get; set; } = null!;

    public int EmpCardNo { get; set; }

    public DateTime? FromTime { get; set; }

    public DateTime? ToTime { get; set; }

    public decimal? OverTime { get; set; }

    public decimal? OverTimeAmount { get; set; }

    public long SerialNo { get; set; }
}
