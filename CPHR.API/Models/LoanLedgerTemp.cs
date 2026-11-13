using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class LoanLedgerTemp
{
    public int? AppNo { get; set; }

    public string? EmpCardNo { get; set; }

    public DateTime? LoanDate { get; set; }

    public string? LoanType { get; set; }

    public decimal? LoanAmount { get; set; }

    public decimal? LoanInstallment { get; set; }
}
