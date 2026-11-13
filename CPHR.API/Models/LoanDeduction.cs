using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class LoanDeduction
{
    public int? EmpCardNo { get; set; }

    public string? LoanType { get; set; }

    public DateTime? DeductionDate { get; set; }

    public decimal? DeductionAmount { get; set; }

    public int SerialNo { get; set; }
}
