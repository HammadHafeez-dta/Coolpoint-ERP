using System;
using System.Collections.Generic;

namespace SaftHR.API.Models.Machine;

public partial class Acgroup
{
    public short GroupId { get; set; }

    public string? Name { get; set; }

    public short? TimeZone1 { get; set; }

    public short? TimeZone2 { get; set; }

    public short? TimeZone3 { get; set; }

    public bool? Holidayvaild { get; set; }

    public int? Verifystyle { get; set; }
}
