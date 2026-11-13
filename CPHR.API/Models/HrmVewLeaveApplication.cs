using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewLeaveApplication
{
    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransDate { get; set; }

    public int? EmpCardNo { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public string? EmpName { get; set; }

    public string? DesignationName { get; set; }

    public string? DepartmentName { get; set; }

    public string? LeaveType { get; set; }

    public decimal? LeaveRequired { get; set; }

    public DateTime? LeaveDate { get; set; }

    public bool? MoreThanOne { get; set; }

    public string? Reason { get; set; }

    public string? Assignment { get; set; }
}
