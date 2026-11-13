using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmTempLeaveDetail
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public decimal? YearlyQuota { get; set; }

    public decimal? LeavesAvailed { get; set; }

    public decimal? Balance { get; set; }

    public decimal? LeavesExceeded { get; set; }

    public int? Lates { get; set; }

    public int? ShortLeaves { get; set; }

    public DateTime? JoiningDate { get; set; }

    public int? DeptCode { get; set; }

    public string? DepartmentName { get; set; }

    public int? DesgCode { get; set; }

    public string? DesignationName { get; set; }
}
