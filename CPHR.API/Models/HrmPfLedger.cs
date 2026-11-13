using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmPfLedger
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransactionDate { get; set; }

    public decimal? ProvidantFund { get; set; }

    public string? PfType { get; set; }

    public decimal? LoanAmount { get; set; }

    public decimal? LoanInstallment { get; set; }
}
