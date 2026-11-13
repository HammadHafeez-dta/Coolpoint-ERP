using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmStatus
{
    public int StatusCode { get; set; }

    public string? StatusName { get; set; }

    public string Site { get; set; } = null!;

    public string? EnterBy { get; set; }
}
