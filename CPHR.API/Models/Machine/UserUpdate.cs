using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class UserUpdate
{
    public int UpdateId { get; set; }

    public string? BadgeNumber { get; set; }
}
