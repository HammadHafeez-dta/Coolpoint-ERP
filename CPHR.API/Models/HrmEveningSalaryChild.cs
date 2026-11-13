using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmEveningSalaryChild
{
    public int TransNo { get; set; }

    public string Site { get; set; } = null!;

    public int? EmpCardNo { get; set; }

    public string? Subject { get; set; }

    public decimal? SalaryPerLecture { get; set; }

    public int? TotalLectures { get; set; }

    public decimal? Salary { get; set; }

    public int RecNo { get; set; }
}
