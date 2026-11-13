using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class TempPfLoanDetail
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public string? Designation { get; set; }

    public int? DepartmentCode { get; set; }

    public int? SalaryMonth { get; set; }

    public int? SalaryYear { get; set; }

    public decimal? MonthlyPfDeduction { get; set; }

    public decimal? MonthlyPfLoanReturn { get; set; }

    public decimal? TotalMonthlyDeduction { get; set; }

    public string? Site { get; set; }

    public decimal? PfSchoolShare { get; set; }

    public decimal? EobiSchoolShare { get; set; }
}
