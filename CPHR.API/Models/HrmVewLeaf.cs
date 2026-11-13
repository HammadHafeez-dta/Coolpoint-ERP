using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewLeaf
{
    public int ApplicationNo { get; set; }

    public DateTime? ApplicationDate { get; set; }

    public string Site { get; set; } = null!;

    public int? EmpCardNo { get; set; }

    public string? LeaveType { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public decimal? TotalLeaves { get; set; }

    public string? Remarks { get; set; }

    public long SerialNo { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public byte[]? EmpPicture { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public int? DeptCode { get; set; }

    public string? Reason { get; set; }

    public string? LeaveApprovalStatus { get; set; }

    public bool? ShortLeaveDeducted { get; set; }
}
