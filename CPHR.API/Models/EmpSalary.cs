using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class EmpSalary
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public decimal? GrossPay { get; set; }

    public decimal? BasicPay { get; set; }

    public decimal? A01 { get; set; }

    public decimal? A02 { get; set; }

    public decimal? A03 { get; set; }

    public decimal? A04 { get; set; }

    public decimal? A05 { get; set; }

    public decimal? A06 { get; set; }

    public decimal? A07 { get; set; }

    public decimal? A08 { get; set; }

    public decimal? A09 { get; set; }

    public decimal? A10 { get; set; }

    public decimal? A11 { get; set; }

    public decimal? A12 { get; set; }

    public decimal? D01 { get; set; }

    public decimal? D02 { get; set; }

    public decimal? D03 { get; set; }

    public decimal? D04 { get; set; }

    public decimal? D05 { get; set; }

    public decimal? D06 { get; set; }

    public decimal? D07 { get; set; }

    public decimal? D08 { get; set; }

    public decimal? D09 { get; set; }

    public decimal? D10 { get; set; }

    public decimal? D11 { get; set; }

    public decimal? D12 { get; set; }

    public decimal? NetPay { get; set; }

    public string? EnterBy { get; set; }

    public decimal? SalLec { get; set; }

    public decimal? PfSchoolShare { get; set; }

    public decimal? EobiSchoolShare { get; set; }
}
