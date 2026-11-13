using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class ServerLog
{
    public int Id { get; set; }

    public string Event { get; set; } = null!;

    public int Userid { get; set; }

    public string? EnrollNumber { get; set; }

    public short? Parameter { get; set; }

    public DateTime Eventtime { get; set; }

    public string? Sensorid { get; set; }

    public string? Operator { get; set; }
}
