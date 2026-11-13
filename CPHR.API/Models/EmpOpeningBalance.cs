using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class EmpOpeningBalance
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public DateTime? OpeningDate { get; set; }

    public decimal? EobiOpening { get; set; }

    public decimal? SocialSecurityOpening { get; set; }

    public decimal? ProvidantFundOpening { get; set; }

    public string? EnterBy { get; set; }

    public string? EditBy { get; set; }

    public DateTime? EnteryTime { get; set; }

    public DateTime? EditTime { get; set; }
}
