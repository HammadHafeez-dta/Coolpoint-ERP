using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmVewLeaveBalance
{
    public int EmpCardNo { get; set; }

    public string Site { get; set; } = null!;

    public decimal? AlBalance { get; set; }

    public decimal? ClBalance { get; set; }

    public decimal? SlBalance { get; set; }

    public decimal? CplBalance { get; set; }
}
