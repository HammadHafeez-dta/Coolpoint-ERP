using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class GazettedLeaf
{
    public int LeaveId { get; set; }

    public string? Site { get; set; }

    public string? LeaveName { get; set; }

    public DateTime? LeaveDate { get; set; }

    public string? EnterBy { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public DateTime? EditTime { get; set; }
}
