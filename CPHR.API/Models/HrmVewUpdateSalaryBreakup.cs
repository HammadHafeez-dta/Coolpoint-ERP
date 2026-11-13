using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewUpdateSalaryBreakup
{
    public int TransactionNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? TransactionDate { get; set; }

    public string? EnterBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EditTime { get; set; }

    public int EmpCardNo { get; set; }

    public string? Name { get; set; }

    public decimal? BasicPay { get; set; }

    public decimal? TwentyPercent { get; set; }

    public decimal? ThirtyFivePercent { get; set; }

    public decimal? HouseRent { get; set; }

    public decimal? Conveyance { get; set; }

    public decimal? Adh1 { get; set; }

    public decimal? Adh2 { get; set; }

    public decimal? Adh3 { get; set; }

    public decimal? Allowance { get; set; }

    public decimal? TwentyPercent1 { get; set; }

    public decimal? ProvidentFund { get; set; }

    public decimal? Eobi { get; set; }

    public long RecNo { get; set; }

    public decimal? DProvidentFund { get; set; }

    public decimal? DEobi { get; set; }

    public decimal? DAdvance { get; set; }

    public decimal? DLoan { get; set; }

    public decimal? DTax { get; set; }

    public decimal? DLvs { get; set; }

    public decimal? GrossPay { get; set; }

    public decimal? NetPay { get; set; }

    public decimal? Allowances { get; set; }
}
