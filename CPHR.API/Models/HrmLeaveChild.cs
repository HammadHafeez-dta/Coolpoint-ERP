using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmLeaveChild
{
    public int ApplicationNo { get; set; }

    public string Site { get; set; } = null!;

    public int? EmpCardNo { get; set; }

    public string? LeaveType { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public decimal? TotalLeaves { get; set; }

    public string? Remarks { get; set; }

    public string? Reason { get; set; }

    public string? LeaveApprovalStatus { get; set; }

    public bool? ShortLeaveDeducted { get; set; }

    public long SerialNo { get; set; }
}
