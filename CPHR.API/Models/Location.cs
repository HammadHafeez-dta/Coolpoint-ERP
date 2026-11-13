using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Location
{
    public int LocationCode { get; set; }

    public string? LocationName { get; set; }

    public string? EnterBy { get; set; }
}
