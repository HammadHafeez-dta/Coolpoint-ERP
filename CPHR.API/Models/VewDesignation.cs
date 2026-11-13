using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class VewDesignation
{
    public int DesignationCode { get; set; }

    public string? DesignationName { get; set; }

    public int? Grade { get; set; }

    public string? GradeName { get; set; }

    public decimal? MinimumSalary { get; set; }

    public decimal? MaximumSalary { get; set; }

    public string Site { get; set; } = null!;
}
