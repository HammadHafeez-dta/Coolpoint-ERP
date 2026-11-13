using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmTempLoansBalance
{
    public int? EmpCardNo { get; set; }

    public string? EmpName { get; set; }

    public decimal? LongTermLoan { get; set; }

    public decimal? PfLoan { get; set; }

    public decimal? LongTermLoanReturn { get; set; }

    public decimal? PfLoanReturn { get; set; }

    public decimal? LongTermLoanBalance { get; set; }

    public decimal? PfLoanBalance { get; set; }
}
