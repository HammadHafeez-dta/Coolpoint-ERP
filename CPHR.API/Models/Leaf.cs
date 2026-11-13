using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Leaf
{
    public int EmpCardNo { get; set; }

    public int AppNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? CplDate { get; set; }

    public DateTime? AppDate { get; set; }

    public string? EmpContactNo { get; set; }

    public int? CoveringCardNo { get; set; }

    public string? CoveringName { get; set; }

    public string? CoveringContactNo { get; set; }

    public string? LeaveType { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public decimal? TotalLeaves { get; set; }

    public string? LeaveReason { get; set; }

    public string? LeaveAddress { get; set; }

    public string? Remarks { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public long SerialNo { get; set; }
}
