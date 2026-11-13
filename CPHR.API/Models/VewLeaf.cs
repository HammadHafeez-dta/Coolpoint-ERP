using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewLeaf
{
    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public string? DepartmentName { get; set; }

    public string? DesignationName { get; set; }

    public string? EmpContactNo { get; set; }

    public int? CoveringCardNo { get; set; }

    public string? CoveringName { get; set; }

    public string? CoveringContactNo { get; set; }

    public string? LeaveType { get; set; }

    public string? LeaveName { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public decimal? TotalLeaves { get; set; }

    public string? LeaveReason { get; set; }

    public string? LeaveAddress { get; set; }

    public string? Remarks { get; set; }

    public string Site { get; set; } = null!;

    public string? EnterBy { get; set; }

    public int AppNo { get; set; }

    public DateTime? AppDate { get; set; }

    public DateTime? CplDate { get; set; }

    public string? Category { get; set; }

    public string? GradeName { get; set; }
}
