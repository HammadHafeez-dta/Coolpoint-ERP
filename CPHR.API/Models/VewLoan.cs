using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewLoan
{
    public int AppNo { get; set; }

    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? EmpFatherName { get; set; }

    public string? DepartmentName { get; set; }

    public string? DesignationName { get; set; }

    public DateTime? LoanDate { get; set; }

    public string? LoanType { get; set; }

    public decimal? LoanAmount { get; set; }

    public decimal? LoanInstallment { get; set; }

    public string? Shift { get; set; }

    public bool? Status { get; set; }

    public string? Site { get; set; }

    public decimal? LoanBalance { get; set; }

    public byte? LoanClear { get; set; }

    public string? EnterBy { get; set; }
}
