using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class OverTimeMaster
{
    public int OverTimeNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? OverTimeDate { get; set; }

    public bool OverTimeGazetted { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }
}
