using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewOverTime
{
    public int OverTimeNo { get; set; }

    public DateTime? OverTimeDate { get; set; }

    public bool OverTimeGazetted { get; set; }

    public int EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? DepartmentName { get; set; }

    public string? Shift { get; set; }

    public DateTime? JoiningDate { get; set; }

    public bool? IsOverTime { get; set; }

    public bool? Status { get; set; }

    public decimal? GrossPay { get; set; }

    public string? DesignationName { get; set; }

    public DateTime? FromTime { get; set; }

    public DateTime? ToTime { get; set; }

    public decimal? OverTime { get; set; }

    public decimal? OverTimeAmount { get; set; }

    public string Site { get; set; } = null!;

    public long SerialNo { get; set; }

    public string? GradeName { get; set; }
}
