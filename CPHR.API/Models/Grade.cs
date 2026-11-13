using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Grade
{
    public int GradeCode { get; set; }

    public string? GradeName { get; set; }

    public decimal? MinimumSalary { get; set; }

    public decimal? MaximumSalary { get; set; }

    public string? EnterBy { get; set; }
}
