using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class ReportItem
{
    public int Riid { get; set; }

    public int? Riindex { get; set; }

    public short? ShowIt { get; set; }

    public string? Riname { get; set; }

    public string? UnitName { get; set; }

    public byte[] Formula { get; set; } = null!;

    public short? CalcBySchClass { get; set; }

    public short? StatisticMethod { get; set; }

    public short? CalcLast { get; set; }

    public byte[]? Notes { get; set; }
}
