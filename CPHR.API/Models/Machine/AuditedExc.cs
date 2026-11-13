using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class AuditedExc
{
    public int Aeid { get; set; }

    public int? UserId { get; set; }

    public DateTime CheckTime { get; set; }

    public int? NewExcId { get; set; }

    public short? IsLeave { get; set; }

    public string? Uname { get; set; }

    public DateTime Utime { get; set; }
}
