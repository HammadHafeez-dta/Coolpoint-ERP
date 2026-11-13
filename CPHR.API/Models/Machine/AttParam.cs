using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class AttParam
{
    public string Paraname { get; set; } = null!;

    public string? Paratype { get; set; }

    public string Paravalue { get; set; } = null!;
}
