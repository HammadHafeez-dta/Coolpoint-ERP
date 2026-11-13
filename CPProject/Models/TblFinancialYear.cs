using System;
using System.Collections.Generic;

namespace SaftProject.Models;

public partial class TblFinancialYear
{
    public string FinancialYear { get; set; } = null!;

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
