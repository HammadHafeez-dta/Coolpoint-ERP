using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Loan
{
    public int AppNo { get; set; }

    public string? Site { get; set; }

    public int? EmpCardNo { get; set; }

    public DateTime? LoanDate { get; set; }

    public string? LoanType { get; set; }

    public decimal? LoanAmount { get; set; }

    public decimal? LoanInstallment { get; set; }

    public decimal? LoanBalance { get; set; }

    public byte? LoanClear { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public DateTime? EditTime { get; set; }

    public string? EditBy { get; set; }
}
