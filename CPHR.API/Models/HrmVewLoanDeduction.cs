using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewLoanDeduction
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public string? DepartmentName { get; set; }

    public string? DesignationName { get; set; }

    public DateTime? DeductionDate { get; set; }

    public string? LoanType { get; set; }

    public decimal? DeductionAmount { get; set; }

    public string? Shift { get; set; }

    public bool? Status { get; set; }

    public string Site { get; set; } = null!;
}
