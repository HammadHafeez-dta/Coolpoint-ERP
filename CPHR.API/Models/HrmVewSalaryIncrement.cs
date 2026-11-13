using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewSalaryIncrement
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public string? DepartmentName { get; set; }

    public DateTime IncrementDate { get; set; }

    public decimal? OldBasicPay { get; set; }

    public decimal? OldGrossPay { get; set; }

    public decimal? Increment { get; set; }

    public decimal? CurrentBasicPay { get; set; }

    public decimal? CurrentGrossPay { get; set; }

    public decimal? A01 { get; set; }

    public decimal? A10 { get; set; }

    public decimal? D01 { get; set; }

    public string? EnterBy { get; set; }

    public string? DesignationName { get; set; }
}
