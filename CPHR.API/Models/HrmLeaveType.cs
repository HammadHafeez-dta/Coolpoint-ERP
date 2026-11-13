using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmLeaveType
{
    public int LeaveId { get; set; }

    public string LeaveType { get; set; } = null!;

    public string? LeaveName { get; set; }
}
