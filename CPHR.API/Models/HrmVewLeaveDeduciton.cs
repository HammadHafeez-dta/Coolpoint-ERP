using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewLeaveDeduciton
{
    public int TransactionNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransactionDate { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public int EmpCardNo { get; set; }

    public string? Name { get; set; }

    public string? FatherName { get; set; }

    public string? DesignationName { get; set; }

    public string? DepartmentName { get; set; }

    public decimal? Leaves { get; set; }

    public long RecNo { get; set; }
}
