using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class HrmScale
{
    public int ScaleId { get; set; }

    public string? ScaleName { get; set; }

    public string Site { get; set; } = null!;
}
