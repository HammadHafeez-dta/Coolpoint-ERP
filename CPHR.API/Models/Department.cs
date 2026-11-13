using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Department
{
    public int DepartmentCode { get; set; }

    public string Site { get; set; } = null!;

    public string? DepartmentName { get; set; }

    public string? EnterBy { get; set; }
}
