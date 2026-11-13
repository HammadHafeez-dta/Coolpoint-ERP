using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Designation
{
    public int DesignationCode { get; set; }

    public string Site { get; set; } = null!;

    public string? DesignationName { get; set; }

    public string? EnterBy { get; set; }

    public int? Grade { get; set; }
}
