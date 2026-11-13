using System;
using System.Collections.Generic;

namespace SaftHR.API.Models;

public partial class Shift
{
    public int ShiftId { get; set; }

    public string? ShiftType { get; set; }

    public string? ShiftName { get; set; }
}
