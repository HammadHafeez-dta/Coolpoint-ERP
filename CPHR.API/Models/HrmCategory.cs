using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmCategory
{
    public int CategoryCode { get; set; }

    public string? CategoryName { get; set; }

    public string Site { get; set; } = null!;

    public string? EnterBy { get; set; }
}
