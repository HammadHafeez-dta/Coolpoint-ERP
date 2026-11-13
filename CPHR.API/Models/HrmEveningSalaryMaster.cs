using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmEveningSalaryMaster
{
    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransMonth { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }
}
