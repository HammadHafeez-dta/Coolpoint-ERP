using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class MchVewAttendance
{
    public string Badgenumber { get; set; } = null!;

    public string? Name { get; set; }

    public DateTime Checktime { get; set; }

    public string? Sensorid { get; set; }

    public int? Verifycode { get; set; }

    public string? Checktype { get; set; }

    public string? Memoinfo { get; set; }

    public int? WorkCode { get; set; }

    public string? Sn { get; set; }

    public short? UserExtFmt { get; set; }

    public int Userid { get; set; }
}
