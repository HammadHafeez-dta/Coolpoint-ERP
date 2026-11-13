using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewLoanLedger
{
    public string? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? DepartmentName { get; set; }

    public string? DesignationName { get; set; }

    public decimal? GrossPay { get; set; }

    public string? Shift { get; set; }

    public int? AppNo { get; set; }

    public DateTime? LoanDate { get; set; }

    public string? LoanType { get; set; }

    public decimal? LoanAmount { get; set; }

    public decimal? LoanInstallment { get; set; }

    public string Site { get; set; } = null!;
}
