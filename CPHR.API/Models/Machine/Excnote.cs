using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class Excnote
{
    public int? Userid { get; set; }

    public DateTime? Attdate { get; set; }

    public string? Notes { get; set; }
}
